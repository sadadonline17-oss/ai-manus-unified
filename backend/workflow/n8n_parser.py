"""
AI Manus Unified - n8n Workflow Parser
======================================
A module that reads n8n JSON export files, maps n8n triggers/actions to the
closest available Skills in the agent_skills_library, and converts them into
the Manus DAG format.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# n8n Node Type Mappings
# =============================================================================

# Mapping from n8n node types to Manus skill IDs
N8N_TO_MANUS_MAPPING = {
    # Triggers
    "n8n-nodes-base.webhook": "trigger_webhook",
    "n8n-nodes-base.manualTrigger": "trigger_manual",
    "n8n-nodes-base.scheduleTrigger": "trigger_schedule",
    "n8n-nodes-base.cron": "trigger_schedule",
    
    # HTTP & Web
    "n8n-nodes-base.httpRequest": "http_request",
    "n8n-nodes-base.httpRequestAction": "http_request",
    
    # Code Execution
    "n8n-nodes-base.code": "python_sandbox",
    "n8n-nodes-base.executeCommand": "bash_commander",
    
    # File Operations
    "n8n-nodes-base.readBinaryFile": "file_manager",
    "n8n-nodes-base.writeBinaryFile": "file_manager",
    "n8n-nodes-base.readTextFile": "file_manager",
    "n8n-nodes-base.writeTextFile": "file_manager",
    
    # Database
    "n8n-nodes-base.postgres": "database_operator",
    "n8n-nodes-base.mysql": "database_operator",
    "n8n-nodes-base.sqlite": "database_operator",
    "n8n-nodes-base.mongodb": "database_operator",
    
    # AI & Processing
    "n8n-nodes-base.openAi": "dynamic_planner",
    "n8n-nodes-base.anthropic": "dynamic_planner",
    "n8n-nodes-base.langChain": "dynamic_planner",
    
    # Web Scraping
    "n8n-nodes-base.htmlExtract": "data_extractor",
    "n8n-nodes-base.webhook": "n8n_webhook",
    
    # Data Processing
    "n8n-nodes-base.set": "data_extractor",
    "n8n-nodes-base.function": "python_sandbox",
    "n8n-nodes-base.switch": "dynamic_planner",
    "n8n-nodes-base.if": "dynamic_planner",
    "n8n-nodes-base.merge": "data_extractor",
    "n8n-nodes-base.split": "data_extractor",
    
    # Communication
    "n8n-nodes-base.slack": "http_request",
    "n8n-nodes-base.discord": "http_request",
    "n8n-nodes-base.telegram": "http_request",
    "n8n-nodes-base.emailSend": "http_request",
    
    # Default fallback
    "default": "http_request",
}

# Parameter mappings from n8n to Manus
PARAMETER_MAPPINGS = {
    # HTTP Request
    "url": "url",
    "method": "method",
    "headers": "headers",
    "body": "body",
    "authentication": "auth",
    
    # Code
    "jsCode": "code",
    "pythonCode": "code",
    "code": "code",
    
    # File
    "fileName": "path",
    "filePath": "path",
    "fileContent": "content",
    "binaryData": "content",
    
    # Database
    "query": "query",
    "sql": "query",
    "parameters": "params",
    
    # Webhook
    "httpMethod": "method",
    "path": "webhook_url",
    "responseData": "payload",
}


# =============================================================================
# Data Classes
# =============================================================================

class ManusNodeType(Enum):
    """Types of nodes in Manus workflow."""
    TRIGGER = "trigger"
    SKILL = "skill"
    CONDITION = "condition"
    MERGE = "merge"
    OUTPUT = "output"


@dataclass
class ManusNode:
    """
    A node in the Manus workflow DAG.
    
    Attributes:
        id: Unique node identifier
        name: Human-readable name
        type: Node type (trigger, skill, etc.)
        skill_id: ID of the skill to execute
        parameters: Input parameters for the skill
        position: Visual position (x, y)
        connections: IDs of connected downstream nodes
    """
    id: str
    name: str
    type: ManusNodeType
    skill_id: Optional[str] = None
    parameters: Dict[str, Any] = field(default_factory=dict)
    position: Tuple[int, int] = (0, 0)
    connections: List[str] = field(default_factory=list)
    conditions: List[Dict[str, Any]] = field(default_factory=list)
    original_n8n_type: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type.value,
            "skill_id": self.skill_id,
            "parameters": self.parameters,
            "position": list(self.position),
            "connections": self.connections,
            "conditions": self.conditions,
            "original_n8n_type": self.original_n8n_type,
        }


@dataclass
class ManusWorkflow:
    """
    A complete Manus workflow DAG.
    
    Attributes:
        id: Unique workflow identifier
        name: Human-readable workflow name
        description: Workflow description
        nodes: List of workflow nodes
        edges: List of connections between nodes
        triggers: List of trigger node IDs
        settings: Workflow settings
    """
    id: str
    name: str
    description: str = ""
    nodes: List[ManusNode] = field(default_factory=list)
    edges: List[Dict[str, str]] = field(default_factory=list)
    triggers: List[str] = field(default_factory=list)
    settings: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "nodes": [node.to_dict() for node in self.nodes],
            "edges": self.edges,
            "triggers": self.triggers,
            "settings": self.settings,
        }
    
    def get_execution_order(self) -> List[str]:
        """
        Get the topological order of node execution.
        
        Returns:
            List of node IDs in execution order
        """
        # Build adjacency list
        in_degree: Dict[str, int] = {node.id: 0 for node in self.nodes}
        adjacency: Dict[str, List[str]] = {node.id: [] for node in self.nodes}
        
        for edge in self.edges:
            source = edge["source"]
            target = edge["target"]
            adjacency[source].append(target)
            in_degree[target] += 1
        
        # Kahn's algorithm for topological sort
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        order = []
        
        while queue:
            current = queue.pop(0)
            order.append(current)
            
            for neighbor in adjacency[current]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
        
        return order


# =============================================================================
# n8n Parser
# =============================================================================

class N8NParser:
    """
    Parser for n8n workflow JSON exports.
    
    Converts n8n workflows to Manus DAG format with skill mappings.
    """
    
    def __init__(self):
        """Initialize the parser."""
        self.mapping = N8N_TO_MANUS_MAPPING
        self.param_mapping = PARAMETER_MAPPINGS
    
    def parse_file(self, file_path: str | Path) -> ManusWorkflow:
        """
        Parse an n8n workflow JSON file.
        
        Args:
            file_path: Path to the n8n JSON file
            
        Returns:
            ManusWorkflow object
        """
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return self.parse(data)
    
    def parse(self, n8n_data: Dict[str, Any]) -> ManusWorkflow:
        """
        Parse n8n workflow JSON data.
        
        Args:
            n8n_data: Parsed n8n workflow JSON
            
        Returns:
            ManusWorkflow object
        """
        # Extract workflow metadata
        workflow_id = n8n_data.get("id", self._generate_id())
        workflow_name = n8n_data.get("name", "Imported Workflow")
        workflow_description = n8n_data.get("meta", {}).get("description", "")
        
        logger.info(f"Parsing n8n workflow: {workflow_name}")
        
        # Parse nodes
        nodes = []
        triggers = []
        node_id_map: Dict[str, str] = {}
        
        for n8n_node in n8n_data.get("nodes", []):
            node = self._parse_node(n8n_node)
            nodes.append(node)
            node_id_map[n8n_node.get("name", node.id)] = node.id
            
            if node.type == ManusNodeType.TRIGGER:
                triggers.append(node.id)
        
        # Parse connections (edges)
        edges = self._parse_connections(n8n_data.get("connections", {}), node_id_map)
        
        # Update node connections
        for edge in edges:
            source_id = edge["source"]
            for node in nodes:
                if node.id == source_id:
                    node.connections.append(edge["target"])
        
        return ManusWorkflow(
            id=f"manus_{workflow_id}",
            name=workflow_name,
            description=workflow_description,
            nodes=nodes,
            edges=edges,
            triggers=triggers,
            settings=n8n_data.get("settings", {}),
        )
    
    def _parse_node(self, n8n_node: Dict[str, Any]) -> ManusNode:
        """
        Parse a single n8n node to Manus node.
        
        Args:
            n8n_node: n8n node data
            
        Returns:
            ManusNode object
        """
        # Extract basic info
        original_id = n8n_node.get("id", self._generate_id())
        name = n8n_node.get("name", "Unnamed Node")
        n8n_type = n8n_node.get("type", "")
        
        # Determine node type and skill
        node_type, skill_id = self._map_node_type(n8n_type)
        
        # Extract position
        position_data = n8n_node.get("position", [0, 0])
        position = (
            position_data[0] if isinstance(position_data, list) else position_data.get("x", 0),
            position_data[1] if isinstance(position_data, list) else position_data.get("y", 0),
        )
        
        # Map parameters
        parameters = self._map_parameters(n8n_node.get("parameters", {}), n8n_type)
        
        # Extract conditions for conditional nodes
        conditions = []
        if node_type == ManusNodeType.CONDITION:
            conditions = self._extract_conditions(n8n_node)
        
        return ManusNode(
            id=f"node_{original_id}",
            name=name,
            type=node_type,
            skill_id=skill_id,
            parameters=parameters,
            position=position,
            conditions=conditions,
            original_n8n_type=n8n_type,
        )
    
    def _map_node_type(self, n8n_type: str) -> Tuple[ManusNodeType, str]:
        """
        Map n8n node type to Manus node type and skill.
        
        Args:
            n8n_type: n8n node type string
            
        Returns:
            Tuple of (ManusNodeType, skill_id)
        """
        # Check for triggers
        if any(trigger in n8n_type.lower() for trigger in ["trigger", "webhook", "cron", "schedule"]):
            if "webhook" in n8n_type.lower():
                return ManusNodeType.TRIGGER, "trigger_webhook"
            return ManusNodeType.TRIGGER, "trigger_manual"
        
        # Check for conditions
        if any(cond in n8n_type.lower() for cond in ["if", "switch", "condition"]):
            return ManusNodeType.CONDITION, "dynamic_planner"
        
        # Check for merge
        if "merge" in n8n_type.lower():
            return ManusNodeType.MERGE, "data_extractor"
        
        # Look up in mapping
        skill_id = self.mapping.get(n8n_type, self.mapping.get("default", "http_request"))
        
        return ManusNodeType.SKILL, skill_id
    
    def _map_parameters(self, n8n_params: Dict[str, Any], n8n_type: str) -> Dict[str, Any]:
        """
        Map n8n parameters to Manus skill parameters.
        
        Args:
            n8n_params: n8n node parameters
            n8n_type: n8n node type
            
        Returns:
            Mapped parameters dictionary
        """
        mapped = {}
        
        for n8n_key, value in n8n_params.items():
            # Try direct mapping
            manus_key = self.param_mapping.get(n8n_key, n8n_key)
            mapped[manus_key] = value
        
        # Handle special cases
        if "httpRequest" in n8n_type or "http" in n8n_type.lower():
            mapped.setdefault("method", "GET")
            if "url" not in mapped and "path" in n8n_params:
                mapped["url"] = n8n_params["path"]
        
        if "code" in n8n_type.lower() or "function" in n8n_type.lower():
            # Combine code from various possible keys
            code = n8n_params.get("jsCode") or n8n_params.get("pythonCode") or n8n_params.get("code", "")
            mapped["code"] = code
        
        return mapped
    
    def _extract_conditions(self, n8n_node: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract conditions from conditional n8n nodes.
        
        Args:
            n8n_node: n8n node data
            
        Returns:
            List of condition dictionaries
        """
        conditions = []
        params = n8n_node.get("parameters", {})
        
        # Handle IF node conditions
        if "conditions" in params:
            for cond in params["conditions"]:
                conditions.append({
                    "type": cond.get("condition", "equals"),
                    "left": cond.get("leftValue", ""),
                    "right": cond.get("rightValue", ""),
                    "output": cond.get("output", 0),
                })
        
        # Handle SWITCH node rules
        if "rules" in params:
            for i, rule in enumerate(params["rules"]):
                conditions.append({
                    "type": rule.get("condition", "equals"),
                    "left": rule.get("leftValue", ""),
                    "right": rule.get("rightValue", ""),
                    "output": i,
                })
        
        return conditions
    
    def _parse_connections(
        self, 
        connections: Dict[str, Any], 
        node_id_map: Dict[str, str]
    ) -> List[Dict[str, str]]:
        """
        Parse n8n connections to Manus edges.
        
        Args:
            connections: n8n connections data
            node_id_map: Mapping from n8n node names to Manus node IDs
            
        Returns:
            List of edge dictionaries
        """
        edges = []
        
        for source_name, connection_data in connections.items():
            source_id = node_id_map.get(source_name, source_name)
            
            # Handle main output
            if "main" in connection_data:
                for output_idx, outputs in enumerate(connection_data["main"]):
                    for target in outputs:
                        target_name = target.get("node", "")
                        target_id = node_id_map.get(target_name, target_name)
                        
                        edges.append({
                            "id": f"edge_{source_id}_{target_id}",
                            "source": source_id,
                            "target": target_id,
                            "output_index": output_idx,
                        })
        
        return edges
    
    def _generate_id(self) -> str:
        """Generate a unique ID."""
        import uuid
        return str(uuid.uuid4())[:8]


# =============================================================================
# Workflow Converter Utilities
# =============================================================================

def convert_n8n_to_manus(n8n_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Convenience function to convert n8n JSON to Manus format.
    
    Args:
        n8n_json: Parsed n8n workflow JSON
        
    Returns:
        Manus workflow as dictionary
    """
    parser = N8NParser()
    workflow = parser.parse(n8n_json)
    return workflow.to_dict()


def convert_n8n_file(file_path: str | Path) -> Dict[str, Any]:
    """
    Convenience function to convert n8n file to Manus format.
    
    Args:
        file_path: Path to n8n JSON file
        
    Returns:
        Manus workflow as dictionary
    """
    parser = N8NParser()
    workflow = parser.parse_file(file_path)
    return workflow.to_dict()


def validate_manus_workflow(workflow: Dict[str, Any]) -> List[str]:
    """
    Validate a Manus workflow.
    
    Args:
        workflow: Manus workflow dictionary
        
    Returns:
        List of validation errors (empty if valid)
    """
    errors = []
    
    # Check required fields
    if "id" not in workflow:
        errors.append("Missing workflow ID")
    if "name" not in workflow:
        errors.append("Missing workflow name")
    if "nodes" not in workflow or not workflow["nodes"]:
        errors.append("Workflow has no nodes")
    
    # Check for triggers
    if "triggers" not in workflow or not workflow["triggers"]:
        errors.append("Workflow has no trigger nodes")
    
    # Validate nodes
    node_ids = set()
    for node in workflow.get("nodes", []):
        if node["id"] in node_ids:
            errors.append(f"Duplicate node ID: {node['id']}")
        node_ids.add(node["id"])
        
        if "skill_id" not in node and node.get("type") != "trigger":
            errors.append(f"Node {node['id']} has no skill_id")
    
    # Validate edges
    for edge in workflow.get("edges", []):
        if edge["source"] not in node_ids:
            errors.append(f"Edge references unknown source: {edge['source']}")
        if edge["target"] not in node_ids:
            errors.append(f"Edge references unknown target: {edge['target']}")
    
    return errors


# =============================================================================
# Example Usage
# =============================================================================

if __name__ == "__main__":
    # Example n8n workflow
    example_n8n = {
        "name": "Example Workflow",
        "nodes": [
            {
                "id": "1",
                "name": "Webhook",
                "type": "n8n-nodes-base.webhook",
                "position": [100, 100],
                "parameters": {
                    "httpMethod": "POST",
                    "path": "webhook"
                }
            },
            {
                "id": "2",
                "name": "HTTP Request",
                "type": "n8n-nodes-base.httpRequest",
                "position": [300, 100],
                "parameters": {
                    "url": "https://api.example.com/data",
                    "method": "GET"
                }
            },
            {
                "id": "3",
                "name": "Code",
                "type": "n8n-nodes-base.code",
                "position": [500, 100],
                "parameters": {
                    "jsCode": "return items[0].json;"
                }
            }
        ],
        "connections": {
            "Webhook": {
                "main": [[{"node": "HTTP Request"}]]
            },
            "HTTP Request": {
                "main": [[{"node": "Code"}]]
            }
        }
    }
    
    # Parse and print
    parser = N8NParser()
    workflow = parser.parse(example_n8n)
    print(json.dumps(workflow.to_dict(), indent=2))


# =============================================================================
# Export
# =============================================================================

__all__ = [
    'N8NParser',
    'ManusNode',
    'ManusWorkflow',
    'ManusNodeType',
    'N8N_TO_MANUS_MAPPING',
    'PARAMETER_MAPPINGS',
    'convert_n8n_to_manus',
    'convert_n8n_file',
    'validate_manus_workflow',
]