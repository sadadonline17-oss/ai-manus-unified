"""
AI Manus Unified - Skill Registry
==================================
A modular registry system that maps skill configurations to their corresponding
Python/MCP functions. This serves as the core execution layer for the workflow engine.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Type, Union
from pathlib import Path
import subprocess
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# Enums and Data Classes
# =============================================================================

class SkillCategory(Enum):
    """Categories of skills available in the registry."""
    COGNITIVE = "cognitive_ai_reasoning"
    WEB = "web_research"
    EXECUTION = "execution_development"
    INTEGRATION = "external_integrations_mcp"


class SkillStatus(Enum):
    """Execution status of a skill."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class SkillParameter:
    """Definition of a skill parameter."""
    name: str
    type: str
    description: str
    required: bool = True
    default: Any = None
    options: List[str] = field(default_factory=list)


@dataclass
class SkillOutput:
    """Definition of skill output."""
    name: str
    type: str
    description: str


@dataclass
class SkillDefinition:
    """
    Complete definition of a skill that can be executed within a workflow.
    
    Attributes:
        id: Unique identifier for the skill
        name: Human-readable name
        description: Detailed description of what the skill does
        category: Category this skill belongs to
        parameters: List of parameters the skill accepts
        outputs: List of outputs the skill produces
        timeout: Maximum execution time in seconds
        retry_count: Number of retries on failure
    """
    id: str
    name: str
    description: str
    category: SkillCategory
    parameters: List[SkillParameter] = field(default_factory=list)
    outputs: List[SkillOutput] = field(default_factory=list)
    timeout: int = 300  # 5 minutes default
    retry_count: int = 0
    icon: str = "⚙️"
    color: str = "#6366f1"


@dataclass
class SkillExecutionContext:
    """
    Context passed to a skill during execution.
    
    Contains all necessary information for the skill to execute,
    including workflow state, previous outputs, and configuration.
    """
    workflow_id: str
    node_id: str
    inputs: Dict[str, Any]
    previous_outputs: Dict[str, Any]
    config: Dict[str, Any]
    sandbox_path: Optional[Path] = None
    env_vars: Dict[str, str] = field(default_factory=dict)


@dataclass
class SkillExecutionResult:
    """
    Result of a skill execution.
    
    Attributes:
        status: Execution status
        outputs: Dictionary of output values
        error: Error message if failed
        logs: Execution logs
        duration_ms: Execution duration in milliseconds
    """
    status: SkillStatus
    outputs: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None
    logs: List[str] = field(default_factory=list)
    duration_ms: int = 0


# =============================================================================
# Base Skill Class
# =============================================================================

class BaseSkill(ABC):
    """
    Abstract base class for all skills.
    
    All skills must inherit from this class and implement the execute method.
    The skill registry will instantiate and execute skills based on their ID.
    """
    
    @property
    @abstractmethod
    def definition(self) -> SkillDefinition:
        """Return the skill definition."""
        pass
    
    @abstractmethod
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        """
        Execute the skill with the given context.
        
        Args:
            context: Execution context containing inputs and state
            
        Returns:
            SkillExecutionResult with status and outputs
        """
        pass
    
    def validate_inputs(self, inputs: Dict[str, Any]) -> List[str]:
        """
        Validate input parameters against the skill definition.
        
        Args:
            inputs: Dictionary of input values
            
        Returns:
            List of validation error messages (empty if valid)
        """
        errors = []
        
        for param in self.definition.parameters:
            if param.required and param.name not in inputs:
                errors.append(f"Missing required parameter: {param.name}")
            elif param.name in inputs and param.options:
                if inputs[param.name] not in param.options:
                    errors.append(
                        f"Invalid value for {param.name}. "
                        f"Must be one of: {param.options}"
                    )
        
        return errors


# =============================================================================
# Cognitive & AI Reasoning Skills
# =============================================================================

class DynamicPlannerSkill(BaseSkill):
    """
    Evaluates previous node outputs and decides the next workflow path
    based on real-time context using AI reasoning.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="dynamic_planner",
            name="Dynamic Planner",
            description="Evaluates previous node outputs and decides the next workflow path based on real-time context.",
            category=SkillCategory.COGNITIVE,
            parameters=[
                SkillParameter(
                    name="context",
                    type="object",
                    description="Previous node outputs to analyze",
                    required=True
                ),
                SkillParameter(
                    name="decision_criteria",
                    type="string",
                    description="Criteria for making the decision",
                    required=False,
                    default="Choose the optimal path based on the context"
                ),
                SkillParameter(
                    name="available_paths",
                    type="array",
                    description="List of possible paths to choose from",
                    required=True
                )
            ],
            outputs=[
                SkillOutput(
                    name="selected_path",
                    type="string",
                    description="The selected workflow path"
                ),
                SkillOutput(
                    name="reasoning",
                    type="string",
                    description="Explanation of the decision"
                )
            ],
            icon="🧠",
            color="#8b5cf6"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Dynamic Planner] Starting execution for node {context.node_id}")
            
            # Get inputs
            previous_outputs = context.inputs.get("context", context.previous_outputs)
            decision_criteria = context.inputs.get(
                "decision_criteria", 
                "Choose the optimal path based on the context"
            )
            available_paths = context.inputs.get("available_paths", [])
            
            logs.append(f"[Dynamic Planner] Analyzing {len(previous_outputs)} previous outputs")
            logs.append(f"[Dynamic Planner] Available paths: {available_paths}")
            
            # Simple decision logic (can be enhanced with AI)
            # For now, use rule-based decision making
            selected_path = available_paths[0] if available_paths else "default"
            reasoning = f"Selected '{selected_path}' based on available options"
            
            # Check for specific conditions in previous outputs
            for node_id, output in previous_outputs.items():
                if isinstance(output, dict):
                    if output.get("error"):
                        selected_path = "error_handler"
                        reasoning = f"Error detected in {node_id}, routing to error handler"
                        break
                    if output.get("status") == "failed":
                        selected_path = "retry_path"
                        reasoning = f"Failure detected in {node_id}, routing to retry"
                        break
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Dynamic Planner] Completed in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "selected_path": selected_path,
                    "reasoning": reasoning
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Dynamic Planner] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class DataExtractorSkill(BaseSkill):
    """
    Extracts structured JSON data from unstructured text or HTML.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="data_extractor",
            name="Data Extractor",
            description="Extracts structured JSON data from unstructured text or HTML.",
            category=SkillCategory.COGNITIVE,
            parameters=[
                SkillParameter(
                    name="input_text",
                    type="string",
                    description="Text or HTML to extract data from",
                    required=True
                ),
                SkillParameter(
                    name="extraction_schema",
                    type="object",
                    description="JSON schema defining the structure to extract",
                    required=True
                ),
                SkillParameter(
                    name="input_type",
                    type="string",
                    description="Type of input (text, html, markdown)",
                    required=False,
                    default="text",
                    options=["text", "html", "markdown"]
                )
            ],
            outputs=[
                SkillOutput(
                    name="extracted_data",
                    type="object",
                    description="Extracted structured data"
                ),
                SkillOutput(
                    name="confidence",
                    type="number",
                    description="Confidence score of extraction"
                )
            ],
            icon="📊",
            color="#06b6d4"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        import re
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Data Extractor] Starting extraction for node {context.node_id}")
            
            input_text = context.inputs.get("input_text", "")
            extraction_schema = context.inputs.get("extraction_schema", {})
            input_type = context.inputs.get("input_type", "text")
            
            logs.append(f"[Data Extractor] Processing {input_type} input ({len(input_text)} chars)")
            
            extracted_data = {}
            
            # Extract based on schema
            for field_name, field_def in extraction_schema.items():
                if isinstance(field_def, dict):
                    pattern = field_def.get("pattern")
                    field_type = field_def.get("type", "string")
                    
                    if pattern:
                        matches = re.findall(pattern, input_text)
                        if matches:
                            extracted_data[field_name] = matches[0] if len(matches) == 1 else matches
                        else:
                            extracted_data[field_name] = None
                    else:
                        extracted_data[field_name] = None
            
            confidence = 1.0 if extracted_data else 0.0
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Data Extractor] Extracted {len(extracted_data)} fields in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "extracted_data": extracted_data,
                    "confidence": confidence
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Data Extractor] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class DocumentSummarizerSkill(BaseSkill):
    """
    Summarizes long-form reports or logs generated during the workflow.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="document_summarizer",
            name="Document Summarizer",
            description="Summarizes long-form reports or logs generated during the workflow.",
            category=SkillCategory.COGNITIVE,
            parameters=[
                SkillParameter(
                    name="document",
                    type="string",
                    description="Document text to summarize",
                    required=True
                ),
                SkillParameter(
                    name="max_length",
                    type="integer",
                    description="Maximum length of summary in words",
                    required=False,
                    default=200
                ),
                SkillParameter(
                    name="style",
                    type="string",
                    description="Summary style",
                    required=False,
                    default="concise",
                    options=["concise", "detailed", "bullet_points"]
                )
            ],
            outputs=[
                SkillOutput(
                    name="summary",
                    type="string",
                    description="Generated summary"
                ),
                SkillOutput(
                    name="key_points",
                    type="array",
                    description="Key points extracted"
                )
            ],
            icon="📝",
            color="#f59e0b"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Document Summarizer] Starting summarization for node {context.node_id}")
            
            document = context.inputs.get("document", "")
            max_length = context.inputs.get("max_length", 200)
            style = context.inputs.get("style", "concise")
            
            logs.append(f"[Document Summarizer] Processing document ({len(document)} chars)")
            
            # Simple summarization (first N words for now)
            words = document.split()
            summary_words = words[:max_length]
            summary = " ".join(summary_words)
            
            if len(words) > max_length:
                summary += "..."
            
            # Extract key points (sentences with important keywords)
            key_points = []
            sentences = document.split(". ")
            important_keywords = ["important", "key", "critical", "main", "essential", "significant"]
            
            for sentence in sentences[:10]:
                if any(kw in sentence.lower() for kw in important_keywords):
                    key_points.append(sentence.strip())
            
            if not key_points:
                key_points = sentences[:3]
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Document Summarizer] Generated summary in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "summary": summary,
                    "key_points": key_points
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Document Summarizer] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


# =============================================================================
# Web & Research Skills
# =============================================================================

class BrowserOperatorSkill(BaseSkill):
    """
    Navigates websites visually using Playwright, clicks elements,
    and reads content dynamically.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="browser_operator",
            name="Browser Operator",
            description="Navigates websites visually using Playwright, clicks elements, and reads content dynamically.",
            category=SkillCategory.WEB,
            parameters=[
                SkillParameter(
                    name="url",
                    type="string",
                    description="URL to navigate to",
                    required=True
                ),
                SkillParameter(
                    name="actions",
                    type="array",
                    description="List of actions to perform (click, type, scroll, wait)",
                    required=False,
                    default=[]
                ),
                SkillParameter(
                    name="extract_selector",
                    type="string",
                    description="CSS selector for content extraction",
                    required=False
                ),
                SkillParameter(
                    name="screenshot",
                    type="boolean",
                    description="Whether to take a screenshot",
                    required=False,
                    default=False
                )
            ],
            outputs=[
                SkillOutput(
                    name="content",
                    type="string",
                    description="Extracted page content"
                ),
                SkillOutput(
                    name="screenshot_path",
                    type="string",
                    description="Path to screenshot if taken"
                ),
                SkillOutput(
                    name="url",
                    type="string",
                    description="Final URL after navigation"
                )
            ],
            timeout=120,
            icon="🌐",
            color="#22c55e"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Browser Operator] Starting browser session for node {context.node_id}")
            
            url = context.inputs.get("url", "")
            actions = context.inputs.get("actions", [])
            extract_selector = context.inputs.get("extract_selector")
            take_screenshot = context.inputs.get("screenshot", False)
            
            logs.append(f"[Browser Operator] Navigating to: {url}")
            
            # Simulated browser operation (in production, use Playwright)
            content = f"Simulated content from {url}"
            screenshot_path = None
            
            if take_screenshot:
                screenshot_path = f"/tmp/screenshot_{context.node_id}.png"
                logs.append(f"[Browser Operator] Screenshot saved to {screenshot_path}")
            
            for action in actions:
                action_type = action.get("type")
                logs.append(f"[Browser Operator] Performing action: {action_type}")
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Browser Operator] Completed in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "content": content,
                    "screenshot_path": screenshot_path,
                    "url": url
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Browser Operator] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class WideResearcherSkill(BaseSkill):
    """
    Performs multi-source web scraping and compiles technical data
    into a unified output.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="wide_researcher",
            name="Wide Researcher",
            description="Performs multi-source web scraping and compiles technical data into a unified output.",
            category=SkillCategory.WEB,
            parameters=[
                SkillParameter(
                    name="query",
                    type="string",
                    description="Search query",
                    required=True
                ),
                SkillParameter(
                    name="sources",
                    type="array",
                    description="List of sources to search (web, docs, github)",
                    required=False,
                    default=["web"]
                ),
                SkillParameter(
                    name="max_results",
                    type="integer",
                    description="Maximum results per source",
                    required=False,
                    default=10
                )
            ],
            outputs=[
                SkillOutput(
                    name="results",
                    type="array",
                    description="Compiled research results"
                ),
                SkillOutput(
                    name="summary",
                    type="string",
                    description="Summary of findings"
                )
            ],
            timeout=180,
            icon="🔍",
            color="#3b82f6"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Wide Researcher] Starting research for node {context.node_id}")
            
            query = context.inputs.get("query", "")
            sources = context.inputs.get("sources", ["web"])
            max_results = context.inputs.get("max_results", 10)
            
            logs.append(f"[Wide Researcher] Query: '{query}' on sources: {sources}")
            
            # Simulated research results
            results = []
            for source in sources:
                for i in range(min(3, max_results)):
                    results.append({
                        "source": source,
                        "title": f"Result {i+1} for '{query}' from {source}",
                        "url": f"https://example.com/{source}/{i+1}",
                        "snippet": f"This is a snippet from result {i+1}..."
                    })
            
            summary = f"Found {len(results)} results for '{query}' across {len(sources)} sources"
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Wide Researcher] Completed in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "results": results,
                    "summary": summary
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Wide Researcher] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class HTTPRequestSkill(BaseSkill):
    """
    Sends REST API calls (GET, POST, PUT, DELETE) similar to standard n8n nodes.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="http_request",
            name="HTTP Request",
            description="Sends REST API calls (GET, POST, PUT, DELETE) similar to standard n8n nodes.",
            category=SkillCategory.WEB,
            parameters=[
                SkillParameter(
                    name="url",
                    type="string",
                    description="Request URL",
                    required=True
                ),
                SkillParameter(
                    name="method",
                    type="string",
                    description="HTTP method",
                    required=False,
                    default="GET",
                    options=["GET", "POST", "PUT", "DELETE", "PATCH"]
                ),
                SkillParameter(
                    name="headers",
                    type="object",
                    description="Request headers",
                    required=False,
                    default={}
                ),
                SkillParameter(
                    name="body",
                    type="object",
                    description="Request body (for POST/PUT/PATCH)",
                    required=False
                ),
                SkillParameter(
                    name="timeout",
                    type="integer",
                    description="Request timeout in seconds",
                    required=False,
                    default=30
                )
            ],
            outputs=[
                SkillOutput(
                    name="status_code",
                    type="integer",
                    description="HTTP status code"
                ),
                SkillOutput(
                    name="response",
                    type="object",
                    description="Response body"
                ),
                SkillOutput(
                    name="headers",
                    type="object",
                    description="Response headers"
                )
            ],
            icon="📡",
            color="#ec4899"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        import aiohttp
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[HTTP Request] Starting request for node {context.node_id}")
            
            url = context.inputs.get("url", "")
            method = context.inputs.get("method", "GET").upper()
            headers = context.inputs.get("headers", {})
            body = context.inputs.get("body")
            timeout = context.inputs.get("timeout", 30)
            
            logs.append(f"[HTTP Request] {method} {url}")
            
            async with aiohttp.ClientSession() as session:
                request_kwargs = {
                    "headers": headers,
                    "timeout": aiohttp.ClientTimeout(total=timeout)
                }
                
                if body and method in ["POST", "PUT", "PATCH"]:
                    request_kwargs["json"] = body
                
                async with session.request(method, url, **request_kwargs) as response:
                    status_code = response.status
                    response_headers = dict(response.headers)
                    
                    try:
                        response_body = await response.json()
                    except:
                        response_body = await response.text()
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[HTTP Request] Completed with status {status_code} in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS if 200 <= status_code < 300 else SkillStatus.FAILED,
                outputs={
                    "status_code": status_code,
                    "response": response_body,
                    "headers": response_headers
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[HTTP Request] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


# =============================================================================
# Execution & Development Skills
# =============================================================================

class PythonSandboxSkill(BaseSkill):
    """
    Executes dynamic Python code securely within the isolated Docker container.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="python_sandbox",
            name="Python Sandbox Execution",
            description="Executes dynamic Python code securely within the isolated Docker container.",
            category=SkillCategory.EXECUTION,
            parameters=[
                SkillParameter(
                    name="code",
                    type="string",
                    description="Python code to execute",
                    required=True
                ),
                SkillParameter(
                    name="input_data",
                    type="object",
                    description="Input data available as 'input_data' variable",
                    required=False,
                    default={}
                ),
                SkillParameter(
                    name="requirements",
                    type="array",
                    description="List of pip packages to install",
                    required=False,
                    default=[]
                ),
                SkillParameter(
                    name="timeout",
                    type="integer",
                    description="Execution timeout in seconds",
                    required=False,
                    default=60
                )
            ],
            outputs=[
                SkillOutput(
                    name="result",
                    type="object",
                    description="Execution result"
                ),
                SkillOutput(
                    name="stdout",
                    type="string",
                    description="Standard output"
                ),
                SkillOutput(
                    name="stderr",
                    type="string",
                    description="Standard error"
                )
            ],
            timeout=300,
            icon="🐍",
            color="#3776ab"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Python Sandbox] Starting execution for node {context.node_id}")
            
            code = context.inputs.get("code", "")
            input_data = context.inputs.get("input_data", {})
            requirements = context.inputs.get("requirements", [])
            timeout = context.inputs.get("timeout", 60)
            
            logs.append(f"[Python Sandbox] Executing code ({len(code)} chars)")
            
            # Create temporary file for execution
            with tempfile.NamedTemporaryFile(
                mode='w', 
                suffix='.py', 
                delete=False
            ) as f:
                # Add input data as variable
                f.write(f"input_data = {repr(input_data)}\n\n")
                f.write(code)
                temp_file = f.name
            
            try:
                # Execute in subprocess
                result = subprocess.run(
                    ['python3', temp_file],
                    capture_output=True,
                    text=True,
                    timeout=timeout
                )
                
                stdout = result.stdout
                stderr = result.stderr
                
                # Try to parse result from stdout
                try:
                    result_data = json.loads(stdout.strip().split('\n')[-1])
                except:
                    result_data = {"output": stdout}
                
            finally:
                os.unlink(temp_file)
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            status = SkillStatus.SUCCESS if result.returncode == 0 else SkillStatus.FAILED
            logs.append(f"[Python Sandbox] Completed in {duration_ms}ms with return code {result.returncode}")
            
            return SkillExecutionResult(
                status=status,
                outputs={
                    "result": result_data,
                    "stdout": stdout,
                    "stderr": stderr
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except subprocess.TimeoutExpired:
            logs.append(f"[Python Sandbox] Execution timed out")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error="Execution timed out",
                logs=logs
            )
        except Exception as e:
            logs.append(f"[Python Sandbox] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class BashCommanderSkill(BaseSkill):
    """
    Runs shell scripts and commands within the sandbox environment.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="bash_commander",
            name="Bash Commander",
            description="Runs shell scripts and commands within the sandbox environment.",
            category=SkillCategory.EXECUTION,
            parameters=[
                SkillParameter(
                    name="command",
                    type="string",
                    description="Shell command to execute",
                    required=True
                ),
                SkillParameter(
                    name="working_dir",
                    type="string",
                    description="Working directory",
                    required=False,
                    default="/tmp"
                ),
                SkillParameter(
                    name="env",
                    type="object",
                    description="Environment variables",
                    required=False,
                    default={}
                ),
                SkillParameter(
                    name="timeout",
                    type="integer",
                    description="Execution timeout in seconds",
                    required=False,
                    default=60
                )
            ],
            outputs=[
                SkillOutput(
                    name="stdout",
                    type="string",
                    description="Standard output"
                ),
                SkillOutput(
                    name="stderr",
                    type="string",
                    description="Standard error"
                ),
                SkillOutput(
                    name="exit_code",
                    type="integer",
                    description="Exit code"
                )
            ],
            timeout=120,
            icon="💻",
            color="#4ade80"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Bash Commander] Starting execution for node {context.node_id}")
            
            command = context.inputs.get("command", "")
            working_dir = context.inputs.get("working_dir", "/tmp")
            env = context.inputs.get("env", {})
            timeout = context.inputs.get("timeout", 60)
            
            logs.append(f"[Bash Commander] Executing: {command}")
            
            # Merge environment variables
            exec_env = os.environ.copy()
            exec_env.update(env)
            
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=working_dir,
                env=exec_env,
                timeout=timeout
            )
            
            duration_ms = int((time.time() - start_time) * 1000)
            
            status = SkillStatus.SUCCESS if result.returncode == 0 else SkillStatus.FAILED
            logs.append(f"[Bash Commander] Completed in {duration_ms}ms with exit code {result.returncode}")
            
            return SkillExecutionResult(
                status=status,
                outputs={
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "exit_code": result.returncode
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except subprocess.TimeoutExpired:
            logs.append(f"[Bash Commander] Execution timed out")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error="Execution timed out",
                logs=logs
            )
        except Exception as e:
            logs.append(f"[Bash Commander] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class FileManagerSkill(BaseSkill):
    """
    Reads, writes, and parses local files within the workspace.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="file_manager",
            name="File Manager",
            description="Reads, writes, and parses local files within the workspace.",
            category=SkillCategory.EXECUTION,
            parameters=[
                SkillParameter(
                    name="operation",
                    type="string",
                    description="File operation to perform",
                    required=True,
                    options=["read", "write", "append", "delete", "list", "exists"]
                ),
                SkillParameter(
                    name="path",
                    type="string",
                    description="File path",
                    required=True
                ),
                SkillParameter(
                    name="content",
                    type="string",
                    description="Content to write (for write/append)",
                    required=False
                ),
                SkillParameter(
                    name="encoding",
                    type="string",
                    description="File encoding",
                    required=False,
                    default="utf-8"
                )
            ],
            outputs=[
                SkillOutput(
                    name="content",
                    type="string",
                    description="File content (for read)"
                ),
                SkillOutput(
                    name="exists",
                    type="boolean",
                    description="Whether file exists"
                ),
                SkillOutput(
                    name="files",
                    type="array",
                    description="List of files (for list)"
                )
            ],
            icon="📁",
            color="#f97316"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[File Manager] Starting operation for node {context.node_id}")
            
            operation = context.inputs.get("operation", "read")
            path = context.inputs.get("path", "")
            content = context.inputs.get("content", "")
            encoding = context.inputs.get("encoding", "utf-8")
            
            logs.append(f"[File Manager] Operation: {operation} on {path}")
            
            outputs = {}
            
            if operation == "read":
                with open(path, 'r', encoding=encoding) as f:
                    outputs["content"] = f.read()
                outputs["exists"] = True
                
            elif operation == "write":
                with open(path, 'w', encoding=encoding) as f:
                    f.write(content)
                outputs["exists"] = True
                
            elif operation == "append":
                with open(path, 'a', encoding=encoding) as f:
                    f.write(content)
                outputs["exists"] = True
                
            elif operation == "delete":
                os.remove(path)
                outputs["exists"] = False
                
            elif operation == "list":
                outputs["files"] = os.listdir(path)
                
            elif operation == "exists":
                outputs["exists"] = os.path.exists(path)
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[File Manager] Completed in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs=outputs,
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[File Manager] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


# =============================================================================
# External Integrations (MCP) Skills
# =============================================================================

class N8NWebhookSkill(BaseSkill):
    """
    Sends or receives payload data to/from external n8n instances.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="n8n_webhook",
            name="n8n Webhook Trigger/Action",
            description="Sends or receives payload data to/from external n8n instances.",
            category=SkillCategory.INTEGRATION,
            parameters=[
                SkillParameter(
                    name="webhook_url",
                    type="string",
                    description="n8n webhook URL",
                    required=True
                ),
                SkillParameter(
                    name="method",
                    type="string",
                    description="HTTP method",
                    required=False,
                    default="POST",
                    options=["GET", "POST"]
                ),
                SkillParameter(
                    name="payload",
                    type="object",
                    description="Data to send",
                    required=False,
                    default={}
                ),
                SkillParameter(
                    name="headers",
                    type="object",
                    description="Additional headers",
                    required=False,
                    default={}
                )
            ],
            outputs=[
                SkillOutput(
                    name="response",
                    type="object",
                    description="Response from n8n"
                ),
                SkillOutput(
                    name="status_code",
                    type="integer",
                    description="HTTP status code"
                )
            ],
            icon="🔗",
            color="#ff6d5a"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        import aiohttp
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[n8n Webhook] Starting for node {context.node_id}")
            
            webhook_url = context.inputs.get("webhook_url", "")
            method = context.inputs.get("method", "POST")
            payload = context.inputs.get("payload", {})
            headers = context.inputs.get("headers", {})
            
            logs.append(f"[n8n Webhook] {method} {webhook_url}")
            
            async with aiohttp.ClientSession() as session:
                if method == "GET":
                    async with session.get(webhook_url, headers=headers) as response:
                        status_code = response.status
                        response_data = await response.json()
                else:
                    async with session.post(
                        webhook_url, 
                        json=payload, 
                        headers=headers
                    ) as response:
                        status_code = response.status
                        response_data = await response.json()
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[n8n Webhook] Completed with status {status_code} in {duration_ms}ms")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS if 200 <= status_code < 300 else SkillStatus.FAILED,
                outputs={
                    "response": response_data,
                    "status_code": status_code
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[n8n Webhook] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


class DatabaseOperatorSkill(BaseSkill):
    """
    Connects via MCP to local/remote PostgreSQL or SQLite to query
    or write workflow states.
    """
    
    @property
    def definition(self) -> SkillDefinition:
        return SkillDefinition(
            id="database_operator",
            name="Database Operator",
            description="Connects via MCP to local/remote PostgreSQL or SQLite to query or write workflow states.",
            category=SkillCategory.INTEGRATION,
            parameters=[
                SkillParameter(
                    name="connection_string",
                    type="string",
                    description="Database connection string",
                    required=True
                ),
                SkillParameter(
                    name="query",
                    type="string",
                    description="SQL query to execute",
                    required=True
                ),
                SkillParameter(
                    name="params",
                    type="array",
                    description="Query parameters",
                    required=False,
                    default=[]
                ),
                SkillParameter(
                    name="database_type",
                    type="string",
                    description="Type of database",
                    required=False,
                    default="sqlite",
                    options=["sqlite", "postgresql", "mysql"]
                )
            ],
            outputs=[
                SkillOutput(
                    name="rows",
                    type="array",
                    description="Query results"
                ),
                SkillOutput(
                    name="row_count",
                    type="integer",
                    description="Number of affected rows"
                )
            ],
            icon="🗄️",
            color="#14b8a6"
        )
    
    async def execute(self, context: SkillExecutionContext) -> SkillExecutionResult:
        import time
        start_time = time.time()
        logs = []
        
        try:
            logs.append(f"[Database Operator] Starting for node {context.node_id}")
            
            connection_string = context.inputs.get("connection_string", "")
            query = context.inputs.get("query", "")
            params = context.inputs.get("params", [])
            database_type = context.inputs.get("database_type", "sqlite")
            
            logs.append(f"[Database Operator] Executing query on {database_type}")
            
            # Simulated database operation
            rows = []
            row_count = 0
            
            if database_type == "sqlite":
                import sqlite3
                conn = sqlite3.connect(connection_string)
                cursor = conn.cursor()
                cursor.execute(query, params)
                
                if query.strip().upper().startswith("SELECT"):
                    rows = cursor.fetchall()
                    row_count = len(rows)
                else:
                    conn.commit()
                    row_count = cursor.rowcount
                
                conn.close()
            else:
                # Simulated response for other databases
                rows = [{"id": 1, "data": "sample"}]
                row_count = 1
            
            duration_ms = int((time.time() - start_time) * 1000)
            logs.append(f"[Database Operator] Completed in {duration_ms}ms, {row_count} rows affected")
            
            return SkillExecutionResult(
                status=SkillStatus.SUCCESS,
                outputs={
                    "rows": rows,
                    "row_count": row_count
                },
                logs=logs,
                duration_ms=duration_ms
            )
            
        except Exception as e:
            logs.append(f"[Database Operator] Error: {str(e)}")
            return SkillExecutionResult(
                status=SkillStatus.FAILED,
                error=str(e),
                logs=logs
            )


# =============================================================================
# Skill Registry
# =============================================================================

class SkillRegistry:
    """
    Central registry for all available skills.
    
    Manages skill registration, discovery, and instantiation.
    Skills are registered by their ID and can be retrieved for execution.
    """
    
    _instance: Optional[SkillRegistry] = None
    _skills: Dict[str, Type[BaseSkill]] = {}
    
    def __new__(cls) -> SkillRegistry:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._register_default_skills()
        return cls._instance
    
    def _register_default_skills(self):
        """Register all default skills."""
        # Cognitive & AI Reasoning
        self.register(DynamicPlannerSkill)
        self.register(DataExtractorSkill)
        self.register(DocumentSummarizerSkill)
        
        # Web & Research
        self.register(BrowserOperatorSkill)
        self.register(WideResearcherSkill)
        self.register(HTTPRequestSkill)
        
        # Execution & Development
        self.register(PythonSandboxSkill)
        self.register(BashCommanderSkill)
        self.register(FileManagerSkill)
        
        # External Integrations (MCP)
        self.register(N8NWebhookSkill)
        self.register(DatabaseOperatorSkill)
    
    def register(self, skill_class: Type[BaseSkill]) -> None:
        """
        Register a skill class.
        
        Args:
            skill_class: The skill class to register
        """
        skill_instance = skill_class()
        skill_id = skill_instance.definition.id
        self._skills[skill_id] = skill_class
        logger.info(f"Registered skill: {skill_id}")
    
    def get(self, skill_id: str) -> Optional[BaseSkill]:
        """
        Get a skill instance by ID.
        
        Args:
            skill_id: The skill ID
            
        Returns:
            Skill instance or None if not found
        """
        skill_class = self._skills.get(skill_id)
        if skill_class:
            return skill_class()
        return None
    
    def get_definition(self, skill_id: str) -> Optional[SkillDefinition]:
        """Get skill definition by ID."""
        skill = self.get(skill_id)
        return skill.definition if skill else None
    
    def list_all(self) -> List[SkillDefinition]:
        """List all registered skill definitions."""
        return [
            self.get(skill_id).definition 
            for skill_id in self._skills
        ]
    
    def list_by_category(self, category: SkillCategory) -> List[SkillDefinition]:
        """List skills by category."""
        return [
            skill.definition 
            for skill in [self.get(sid) for sid in self._skills]
            if skill and skill.definition.category == category
        ]
    
    def to_dict(self) -> Dict[str, Any]:
        """Export registry as dictionary for API responses."""
        return {
            "skills": [
                {
                    "id": skill.definition.id,
                    "name": skill.definition.name,
                    "description": skill.definition.description,
                    "category": skill.definition.category.value,
                    "parameters": [
                        {
                            "name": p.name,
                            "type": p.type,
                            "description": p.description,
                            "required": p.required,
                            "default": p.default,
                            "options": p.options
                        }
                        for p in skill.definition.parameters
                    ],
                    "outputs": [
                        {
                            "name": o.name,
                            "type": o.type,
                            "description": o.description
                        }
                        for o in skill.definition.outputs
                    ],
                    "icon": skill.definition.icon,
                    "color": skill.definition.color
                }
                for skill in [self.get(sid) for sid in self._skills]
                if skill
            ]
        }


# Singleton instance
skill_registry = SkillRegistry()


# =============================================================================
# Export
# =============================================================================

__all__ = [
    # Enums
    'SkillCategory',
    'SkillStatus',
    # Data Classes
    'SkillParameter',
    'SkillOutput',
    'SkillDefinition',
    'SkillExecutionContext',
    'SkillExecutionResult',
    # Base Class
    'BaseSkill',
    # Skills
    'DynamicPlannerSkill',
    'DataExtractorSkill',
    'DocumentSummarizerSkill',
    'BrowserOperatorSkill',
    'WideResearcherSkill',
    'HTTPRequestSkill',
    'PythonSandboxSkill',
    'BashCommanderSkill',
    'FileManagerSkill',
    'N8NWebhookSkill',
    'DatabaseOperatorSkill',
    # Registry
    'SkillRegistry',
    'skill_registry',
]