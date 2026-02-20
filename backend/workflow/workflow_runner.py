"""
AI Manus Unified - Workflow Runner (DAG Engine)
================================================
A Directed Acyclic Graph execution engine to parse workflow JSON and execute
nodes sequentially or in parallel. Handles state management, error handling,
and streaming logs back to the frontend.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set, AsyncGenerator
from pathlib import Path

# Import from our modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from skills.skill_registry import (
    SkillRegistry,
    SkillStatus,
    SkillExecutionContext,
    SkillExecutionResult,
    skill_registry,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# Enums and Data Classes
# =============================================================================

class WorkflowStatus(Enum):
    """Status of a workflow execution."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"


class NodeExecutionStatus(Enum):
    """Status of a node execution."""
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class NodeExecution:
    """
    Represents the execution state of a single node.
    
    Attributes:
        node_id: ID of the node
        status: Current execution status
        started_at: When execution started
        completed_at: When execution completed
        inputs: Input data for the node
        outputs: Output data from the node
        error: Error message if failed
        logs: Execution logs
        retry_count: Number of retries attempted
    """
    node_id: str
    status: NodeExecutionStatus = NodeExecutionStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    inputs: Dict[str, Any] = field(default_factory=dict)
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    logs: List[str] = field(default_factory=list)
    retry_count: int = 0
    duration_ms: int = 0


@dataclass
class WorkflowExecution:
    """
    Represents the complete execution state of a workflow.
    
    Attributes:
        execution_id: Unique execution identifier
        workflow_id: ID of the workflow being executed
        status: Current workflow status
        started_at: When execution started
        completed_at: When execution completed
        node_executions: Map of node ID to NodeExecution
        context: Shared context data across nodes
        error: Error message if workflow failed
    """
    execution_id: str
    workflow_id: str
    status: WorkflowStatus = WorkflowStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    node_executions: Dict[str, NodeExecution] = field(default_factory=dict)
    context: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "execution_id": self.execution_id,
            "workflow_id": self.workflow_id,
            "status": self.status.value,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "node_executions": {
                node_id: {
                    "status": exec.status.value,
                    "started_at": exec.started_at.isoformat() if exec.started_at else None,
                    "completed_at": exec.completed_at.isoformat() if exec.completed_at else None,
                    "outputs": exec.outputs,
                    "error": exec.error,
                    "logs": exec.logs,
                    "duration_ms": exec.duration_ms,
                }
                for node_id, exec in self.node_executions.items()
            },
            "context": self.context,
            "error": self.error,
        }


# =============================================================================
# Workflow Runner
# =============================================================================

class WorkflowRunner:
    """
    DAG Execution Engine for Manus Workflows.
    
    Handles the execution of workflow nodes in topological order,
    managing state, parallelism, and error handling.
    """
    
    def __init__(
        self,
        skill_registry: SkillRegistry = skill_registry,
        max_parallel_nodes: int = 5,
        default_timeout: int = 300,
        max_retries: int = 2,
    ):
        """
        Initialize the workflow runner.
        
        Args:
            skill_registry: Registry of available skills
            max_parallel_nodes: Maximum number of nodes to execute in parallel
            default_timeout: Default timeout for node execution in seconds
            max_retries: Maximum number of retries for failed nodes
        """
        self.skill_registry = skill_registry
        self.max_parallel_nodes = max_parallel_nodes
        self.default_timeout = default_timeout
        self.max_retries = max_retries
        
        # Active executions
        self._executions: Dict[str, WorkflowExecution] = {}
        
        # Event callbacks
        self._on_node_start: Optional[Callable] = None
        self._on_node_complete: Optional[Callable] = None
        self._on_workflow_complete: Optional[Callable] = None
    
    def on_node_start(self, callback: Callable):
        """Register callback for node start events."""
        self._on_node_start = callback
    
    def on_node_complete(self, callback: Callable):
        """Register callback for node complete events."""
        self._on_node_complete = callback
    
    def on_workflow_complete(self, callback: Callable):
        """Register callback for workflow complete events."""
        self._on_workflow_complete = callback
    
    async def execute(
        self,
        workflow: Dict[str, Any],
        initial_context: Optional[Dict[str, Any]] = None,
        execution_id: Optional[str] = None,
    ) -> WorkflowExecution:
        """
        Execute a workflow.
        
        Args:
            workflow: Workflow definition dictionary
            initial_context: Initial context data
            execution_id: Optional execution ID (generated if not provided)
            
        Returns:
            WorkflowExecution object with execution results
        """
        # Create execution record
        execution_id = execution_id or f"exec_{uuid.uuid4().hex[:12]}"
        workflow_id = workflow.get("id", "unknown")
        
        execution = WorkflowExecution(
            execution_id=execution_id,
            workflow_id=workflow_id,
            status=WorkflowStatus.RUNNING,
            started_at=datetime.now(),
            context=initial_context or {},
        )
        
        # Initialize node executions
        for node in workflow.get("nodes", []):
            execution.node_executions[node["id"]] = NodeExecution(
                node_id=node["id"],
                status=NodeExecutionStatus.PENDING,
            )
        
        self._executions[execution_id] = execution
        
        logger.info(f"Starting workflow execution: {execution_id}")
        
        try:
            # Build execution graph
            graph = self._build_execution_graph(workflow)
            
            # Execute nodes in topological order
            await self._execute_graph(workflow, execution, graph)
            
            # Mark as completed
            execution.status = WorkflowStatus.COMPLETED
            execution.completed_at = datetime.now()
            
        except asyncio.CancelledError:
            execution.status = WorkflowStatus.CANCELLED
            execution.completed_at = datetime.now()
            logger.info(f"Workflow execution cancelled: {execution_id}")
            
        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error = str(e)
            execution.completed_at = datetime.now()
            logger.error(f"Workflow execution failed: {execution_id} - {e}")
        
        # Notify callback
        if self._on_workflow_complete:
            await self._on_workflow_complete(execution)
        
        return execution
    
    async def execute_stream(
        self,
        workflow: Dict[str, Any],
        initial_context: Optional[Dict[str, Any]] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Execute a workflow with streaming updates.
        
        Yields execution state updates as they occur.
        
        Args:
            workflow: Workflow definition dictionary
            initial_context: Initial context data
            
        Yields:
            Execution state updates
        """
        execution_id = f"exec_{uuid.uuid4().hex[:12]}"
        
        # Set up streaming callbacks
        update_queue = asyncio.Queue()
        
        async def on_node_update(node_exec: NodeExecution):
            await update_queue.put({
                "type": "node_update",
                "execution_id": execution_id,
                "node_id": node_exec.node_id,
                "status": node_exec.status.value,
                "outputs": node_exec.outputs,
                "error": node_exec.error,
                "logs": node_exec.logs[-5:] if node_exec.logs else [],
            })
        
        # Store original callback
        original_callback = self._on_node_complete
        self._on_node_complete = on_node_update
        
        # Start execution in background
        execution_task = asyncio.create_task(
            self.execute(workflow, initial_context, execution_id)
        )
        
        try:
            # Yield initial state
            yield {
                "type": "execution_start",
                "execution_id": execution_id,
                "workflow_id": workflow.get("id", "unknown"),
            }
            
            # Stream updates
            while not execution_task.done():
                try:
                    update = await asyncio.wait_for(update_queue.get(), timeout=0.5)
                    yield update
                except asyncio.TimeoutError:
                    # Send heartbeat
                    yield {
                        "type": "heartbeat",
                        "execution_id": execution_id,
                    }
            
            # Get final result
            execution = execution_task.result()
            
            yield {
                "type": "execution_complete",
                "execution_id": execution_id,
                "status": execution.status.value,
                "error": execution.error,
            }
            
        finally:
            # Restore original callback
            self._on_node_complete = original_callback
    
    def _build_execution_graph(self, workflow: Dict[str, Any]) -> Dict[str, Set[str]]:
        """
        Build the execution dependency graph.
        
        Args:
            workflow: Workflow definition
            
        Returns:
            Dictionary mapping node IDs to their dependencies
        """
        # Map node ID to its dependencies
        dependencies: Dict[str, Set[str]] = {
            node["id"]: set()
            for node in workflow.get("nodes", [])
        }
        
        # Add dependencies from edges
        for edge in workflow.get("edges", []):
            target = edge["target"]
            source = edge["source"]
            if target in dependencies:
                dependencies[target].add(source)
        
        return dependencies
    
    async def _execute_graph(
        self,
        workflow: Dict[str, Any],
        execution: WorkflowExecution,
        graph: Dict[str, Set[str]],
    ) -> None:
        """
        Execute the workflow graph.
        
        Args:
            workflow: Workflow definition
            execution: Execution state
            graph: Dependency graph
        """
        nodes_by_id = {node["id"]: node for node in workflow.get("nodes", [])}
        completed: Set[str] = set()
        running: Set[str] = set()
        
        while len(completed) < len(nodes_by_id):
            # Find nodes ready to execute (all dependencies completed)
            ready = []
            for node_id, deps in graph.items():
                if node_id in completed or node_id in running:
                    continue
                if deps.issubset(completed):
                    ready.append(node_id)
            
            if not ready:
                if running:
                    # Wait for running nodes to complete
                    await asyncio.sleep(0.1)
                    continue
                else:
                    # Deadlock or cycle detected
                    raise RuntimeError("Workflow deadlock detected")
            
            # Start executing ready nodes (up to max parallel)
            to_start = ready[:self.max_parallel_nodes - len(running)]
            
            tasks = []
            for node_id in to_start:
                running.add(node_id)
                node = nodes_by_id[node_id]
                task = asyncio.create_task(
                    self._execute_node(node, execution, completed)
                )
                tasks.append((node_id, task))
            
            # Wait for tasks to complete
            for node_id, task in tasks:
                try:
                    await task
                except Exception as e:
                    logger.error(f"Node {node_id} failed: {e}")
                    # Check if we should continue or fail the workflow
                    node_exec = execution.node_executions[node_id]
                    if node_exec.status == NodeExecutionStatus.FAILED:
                        # Check if this is a critical node
                        # For now, we'll continue with other nodes
                        pass
                
                running.discard(node_id)
                completed.add(node_id)
    
    async def _execute_node(
        self,
        node: Dict[str, Any],
        execution: WorkflowExecution,
        completed: Set[str],
    ) -> None:
        """
        Execute a single node.
        
        Args:
            node: Node definition
            execution: Execution state
            completed: Set of completed node IDs
        """
        node_id = node["id"]
        node_exec = execution.node_executions[node_id]
        
        # Update status
        node_exec.status = NodeExecutionStatus.RUNNING
        node_exec.started_at = datetime.now()
        
        logger.info(f"Executing node: {node_id}")
        
        # Notify callback
        if self._on_node_start:
            await self._on_node_start(node_exec)
        
        try:
            # Get skill
            skill_id = node.get("skill_id")
            if not skill_id:
                # Skip nodes without skills (like triggers)
                node_exec.status = NodeExecutionStatus.SUCCESS
                node_exec.completed_at = datetime.now()
                return
            
            skill = self.skill_registry.get(skill_id)
            if not skill:
                raise ValueError(f"Skill not found: {skill_id}")
            
            # Prepare inputs
            inputs = self._prepare_inputs(node, execution, completed)
            node_exec.inputs = inputs
            
            # Create execution context
            context = SkillExecutionContext(
                workflow_id=execution.workflow_id,
                node_id=node_id,
                inputs=inputs,
                previous_outputs={
                    nid: execution.node_executions[nid].outputs
                    for nid in completed
                },
                config=node.get("config", {}),
            )
            
            # Execute with retry
            result = await self._execute_with_retry(skill, context, node_exec)
            
            # Update execution state
            node_exec.status = NodeExecutionStatus.SUCCESS if result.status == SkillStatus.SUCCESS else NodeExecutionStatus.FAILED
            node_exec.outputs = result.outputs
            node_exec.error = result.error
            node_exec.logs = result.logs
            node_exec.duration_ms = result.duration_ms
            node_exec.completed_at = datetime.now()
            
            # Update workflow context
            execution.context[node_id] = result.outputs
            
        except Exception as e:
            node_exec.status = NodeExecutionStatus.FAILED
            node_exec.error = str(e)
            node_exec.completed_at = datetime.now()
            logger.error(f"Node {node_id} execution failed: {e}")
        
        # Notify callback
        if self._on_node_complete:
            await self._on_node_complete(node_exec)
    
    def _prepare_inputs(
        self,
        node: Dict[str, Any],
        execution: WorkflowExecution,
        completed: Set[str],
    ) -> Dict[str, Any]:
        """
        Prepare inputs for a node execution.
        
        Combines node parameters with outputs from previous nodes.
        
        Args:
            node: Node definition
            execution: Execution state
            completed: Set of completed node IDs
            
        Returns:
            Input dictionary for the node
        """
        inputs = dict(node.get("parameters", {}))
        
        # Add outputs from connected nodes
        for prev_node_id in completed:
            prev_outputs = execution.node_executions[prev_node_id].outputs
            if prev_outputs:
                # Merge outputs, preferring explicit inputs
                for key, value in prev_outputs.items():
                    if key not in inputs:
                        inputs[key] = value
        
        return inputs
    
    async def _execute_with_retry(
        self,
        skill: Any,
        context: SkillExecutionContext,
        node_exec: NodeExecution,
    ) -> Any:
        """
        Execute a skill with retry logic.
        
        Args:
            skill: Skill to execute
            context: Execution context
            node_exec: Node execution state
            
        Returns:
            SkillExecutionResult
        """
        max_retries = skill.definition.retry_count if hasattr(skill, 'definition') else self.max_retries
        last_result = None
        
        for attempt in range(max_retries + 1):
            try:
                # Execute with timeout
                timeout = skill.definition.timeout if hasattr(skill, 'definition') else self.default_timeout
                
                result = await asyncio.wait_for(
                    skill.execute(context),
                    timeout=timeout
                )
                
                if result.status == SkillStatus.SUCCESS:
                    return result
                
                last_result = result
                node_exec.retry_count = attempt + 1
                
                # Wait before retry
                if attempt < max_retries:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    
            except asyncio.TimeoutError:
                last_result = type('Result', (), {
                    'status': SkillStatus.FAILED,
                    'error': f'Execution timed out after {timeout}s',
                    'outputs': {},
                    'logs': ['Execution timed out'],
                    'duration_ms': timeout * 1000,
                })()
                node_exec.retry_count = attempt + 1
                
                if attempt < max_retries:
                    await asyncio.sleep(2 ** attempt)
        
        return last_result
    
    def get_execution(self, execution_id: str) -> Optional[WorkflowExecution]:
        """
        Get an execution by ID.
        
        Args:
            execution_id: Execution ID
            
        Returns:
            WorkflowExecution or None if not found
        """
        return self._executions.get(execution_id)
    
    def cancel_execution(self, execution_id: str) -> bool:
        """
        Cancel a running execution.
        
        Args:
            execution_id: Execution ID
            
        Returns:
            True if cancelled, False if not found or already completed
        """
        execution = self._executions.get(execution_id)
        if execution and execution.status == WorkflowStatus.RUNNING:
            execution.status = WorkflowStatus.CANCELLED
            execution.completed_at = datetime.now()
            return True
        return False
    
    def list_executions(self, workflow_id: Optional[str] = None) -> List[WorkflowExecution]:
        """
        List executions, optionally filtered by workflow.
        
        Args:
            workflow_id: Optional workflow ID to filter by
            
        Returns:
            List of WorkflowExecution objects
        """
        executions = list(self._executions.values())
        if workflow_id:
            executions = [e for e in executions if e.workflow_id == workflow_id]
        return executions


# =============================================================================
# Workflow Manager
# =============================================================================

class WorkflowManager:
    """
    High-level workflow management.
    
    Handles workflow storage, retrieval, and execution lifecycle.
    """
    
    def __init__(self, runner: Optional[WorkflowRunner] = None):
        """
        Initialize the workflow manager.
        
        Args:
            runner: WorkflowRunner instance (created if not provided)
        """
        self.runner = runner or WorkflowRunner()
        self._workflows: Dict[str, Dict[str, Any]] = {}
    
    def save_workflow(self, workflow: Dict[str, Any]) -> str:
        """
        Save a workflow.
        
        Args:
            workflow: Workflow definition
            
        Returns:
            Workflow ID
        """
        workflow_id = workflow.get("id") or f"workflow_{uuid.uuid4().hex[:12]}"
        workflow["id"] = workflow_id
        workflow["updated_at"] = datetime.now().isoformat()
        
        if "created_at" not in workflow:
            workflow["created_at"] = workflow["updated_at"]
        
        self._workflows[workflow_id] = workflow
        logger.info(f"Saved workflow: {workflow_id}")
        
        return workflow_id
    
    def get_workflow(self, workflow_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a workflow by ID.
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            Workflow definition or None if not found
        """
        return self._workflows.get(workflow_id)
    
    def delete_workflow(self, workflow_id: str) -> bool:
        """
        Delete a workflow.
        
        Args:
            workflow_id: Workflow ID
            
        Returns:
            True if deleted, False if not found
        """
        if workflow_id in self._workflows:
            del self._workflows[workflow_id]
            logger.info(f"Deleted workflow: {workflow_id}")
            return True
        return False
    
    def list_workflows(self) -> List[Dict[str, Any]]:
        """
        List all workflows.
        
        Returns:
            List of workflow definitions
        """
        return list(self._workflows.values())
    
    async def run_workflow(
        self,
        workflow_id: str,
        initial_context: Optional[Dict[str, Any]] = None,
    ) -> WorkflowExecution:
        """
        Run a workflow by ID.
        
        Args:
            workflow_id: Workflow ID
            initial_context: Initial context data
            
        Returns:
            WorkflowExecution object
        """
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        return await self.runner.execute(workflow, initial_context)
    
    async def run_workflow_stream(
        self,
        workflow_id: str,
        initial_context: Optional[Dict[str, Any]] = None,
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        Run a workflow with streaming updates.
        
        Args:
            workflow_id: Workflow ID
            initial_context: Initial context data
            
        Yields:
            Execution state updates
        """
        workflow = self.get_workflow(workflow_id)
        if not workflow:
            raise ValueError(f"Workflow not found: {workflow_id}")
        
        async for update in self.runner.execute_stream(workflow, initial_context):
            yield update


# =============================================================================
# Singleton Instances
# =============================================================================

workflow_runner = WorkflowRunner()
workflow_manager = WorkflowManager(workflow_runner)


# =============================================================================
# Export
# =============================================================================

__all__ = [
    # Enums
    'WorkflowStatus',
    'NodeExecutionStatus',
    # Data Classes
    'NodeExecution',
    'WorkflowExecution',
    # Classes
    'WorkflowRunner',
    'WorkflowManager',
    # Instances
    'workflow_runner',
    'workflow_manager',
]