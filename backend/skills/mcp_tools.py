"""
AI Manus Unified - MCP Tools Integration
=========================================
Model Context Protocol (MCP) tools integration for external services.
Provides standardized interface for connecting to various external tools
and services through the MCP protocol.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import asyncio
import json
import logging
import subprocess
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, AsyncGenerator
import aiohttp

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# =============================================================================
# MCP Types
# =============================================================================

class MCPToolType(Enum):
    """Types of MCP tools."""
    FILESYSTEM = "filesystem"
    DATABASE = "database"
    HTTP = "http"
    SHELL = "shell"
    BROWSER = "browser"
    AI = "ai"
    CUSTOM = "custom"


@dataclass
class MCPToolDefinition:
    """Definition of an MCP tool."""
    name: str
    description: str
    type: MCPToolType
    parameters: Dict[str, Any] = field(default_factory=dict)
    command: Optional[str] = None
    endpoint: Optional[str] = None
    enabled: bool = True


@dataclass
class MCPToolResult:
    """Result from an MCP tool execution."""
    success: bool
    data: Any = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


# =============================================================================
# Base MCP Tool
# =============================================================================

class BaseMCPTool(ABC):
    """Base class for MCP tools."""
    
    @property
    @abstractmethod
    def definition(self) -> MCPToolDefinition:
        """Return the tool definition."""
        pass
    
    @abstractmethod
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        """Execute the tool with given parameters."""
        pass
    
    async def validate_params(self, params: Dict[str, Any]) -> List[str]:
        """Validate parameters against tool definition."""
        errors = []
        required = self.definition.parameters.get("required", [])
        properties = self.definition.parameters.get("properties", {})
        
        for req in required:
            if req not in params:
                errors.append(f"Missing required parameter: {req}")
        
        return errors


# =============================================================================
# Filesystem MCP Tool
# =============================================================================

class FilesystemMCPTool(BaseMCPTool):
    """MCP tool for filesystem operations."""
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="filesystem",
            description="Read, write, and manage files in the workspace",
            type=MCPToolType.FILESYSTEM,
            parameters={
                "type": "object",
                "properties": {
                    "operation": {
                        "type": "string",
                        "enum": ["read", "write", "list", "delete", "exists", "mkdir"]
                    },
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                    "recursive": {"type": "boolean"}
                },
                "required": ["operation", "path"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        operation = params.get("operation", "read")
        path = Path(params.get("path", "/tmp"))
        content = params.get("content", "")
        recursive = params.get("recursive", False)
        
        try:
            if operation == "read":
                if path.exists() and path.is_file():
                    return MCPToolResult(
                        success=True,
                        data=path.read_text(),
                        metadata={"path": str(path), "size": path.stat().st_size}
                    )
                return MCPToolResult(success=False, error=f"File not found: {path}")
            
            elif operation == "write":
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content)
                return MCPToolResult(
                    success=True,
                    data={"path": str(path), "bytes_written": len(content)}
                )
            
            elif operation == "list":
                if path.exists() and path.is_dir():
                    items = list(path.iterdir())
                    return MCPToolResult(
                        success=True,
                        data=[
                            {"name": item.name, "type": "dir" if item.is_dir() else "file"}
                            for item in items
                        ]
                    )
                return MCPToolResult(success=False, error=f"Directory not found: {path}")
            
            elif operation == "delete":
                if path.exists():
                    if path.is_dir():
                        import shutil
                        shutil.rmtree(path) if recursive else path.rmdir()
                    else:
                        path.unlink()
                    return MCPToolResult(success=True, data={"deleted": str(path)})
                return MCPToolResult(success=False, error=f"Path not found: {path}")
            
            elif operation == "exists":
                return MCPToolResult(
                    success=True,
                    data={"exists": path.exists(), "is_file": path.is_file(), "is_dir": path.is_dir()}
                )
            
            elif operation == "mkdir":
                path.mkdir(parents=True, exist_ok=True)
                return MCPToolResult(success=True, data={"created": str(path)})
            
            else:
                return MCPToolResult(success=False, error=f"Unknown operation: {operation}")
        
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# Database MCP Tool
# =============================================================================

class DatabaseMCPTool(BaseMCPTool):
    """MCP tool for database operations."""
    
    def __init__(self, connection_string: Optional[str] = None):
        self.connection_string = connection_string
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="database",
            description="Execute SQL queries on connected databases",
            type=MCPToolType.DATABASE,
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "params": {"type": "array"},
                    "fetch": {"type": "boolean"}
                },
                "required": ["query"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        query = params.get("query", "")
        query_params = params.get("params", [])
        fetch = params.get("fetch", True)
        
        try:
            # SQLite implementation
            import sqlite3
            
            if not self.connection_string:
                self.connection_string = ":memory:"
            
            conn = sqlite3.connect(self.connection_string)
            cursor = conn.cursor()
            
            cursor.execute(query, query_params)
            
            if fetch and query.strip().upper().startswith("SELECT"):
                rows = cursor.fetchall()
                columns = [desc[0] for desc in cursor.description]
                result = [dict(zip(columns, row)) for row in rows]
            else:
                conn.commit()
                result = {"rowcount": cursor.rowcount}
            
            conn.close()
            
            return MCPToolResult(success=True, data=result)
        
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# HTTP MCP Tool
# =============================================================================

class HTTPMCPTool(BaseMCPTool):
    """MCP tool for HTTP requests."""
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="http",
            description="Make HTTP requests to external APIs",
            type=MCPToolType.HTTP,
            parameters={
                "type": "object",
                "properties": {
                    "url": {"type": "string"},
                    "method": {"type": "string", "enum": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
                    "headers": {"type": "object"},
                    "body": {"type": "object"},
                    "timeout": {"type": "integer"}
                },
                "required": ["url"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        url = params.get("url", "")
        method = params.get("method", "GET")
        headers = params.get("headers", {})
        body = params.get("body")
        timeout = params.get("timeout", 30)
        
        try:
            async with aiohttp.ClientSession() as session:
                kwargs = {"headers": headers, "timeout": aiohttp.ClientTimeout(total=timeout)}
                
                if body and method in ["POST", "PUT", "PATCH"]:
                    kwargs["json"] = body
                
                async with session.request(method, url, **kwargs) as response:
                    data = await response.json() if "json" in response.content_type else await response.text()
                    
                    return MCPToolResult(
                        success=200 <= response.status < 300,
                        data={
                            "status": response.status,
                            "headers": dict(response.headers),
                            "body": data
                        },
                        metadata={"url": url, "method": method}
                    )
        
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# Shell MCP Tool
# =============================================================================

class ShellMCPTool(BaseMCPTool):
    """MCP tool for shell command execution."""
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="shell",
            description="Execute shell commands in sandbox environment",
            type=MCPToolType.SHELL,
            parameters={
                "type": "object",
                "properties": {
                    "command": {"type": "string"},
                    "cwd": {"type": "string"},
                    "timeout": {"type": "integer"},
                    "env": {"type": "object"}
                },
                "required": ["command"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        command = params.get("command", "")
        cwd = params.get("cwd", "/tmp")
        timeout = params.get("timeout", 60)
        env = params.get("env", {})
        
        try:
            import os
            exec_env = os.environ.copy()
            exec_env.update(env)
            
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                cwd=cwd,
                env=exec_env,
                timeout=timeout
            )
            
            return MCPToolResult(
                success=result.returncode == 0,
                data={
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "exit_code": result.returncode
                },
                metadata={"command": command, "cwd": cwd}
            )
        
        except subprocess.TimeoutExpired:
            return MCPToolResult(success=False, error=f"Command timed out after {timeout}s")
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# Browser MCP Tool
# =============================================================================

class BrowserMCPTool(BaseMCPTool):
    """MCP tool for browser automation."""
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="browser",
            description="Automate browser interactions using Playwright",
            type=MCPToolType.BROWSER,
            parameters={
                "type": "object",
                "properties": {
                    "action": {
                        "type": "string",
                        "enum": ["navigate", "click", "type", "screenshot", "extract", "wait"]
                    },
                    "url": {"type": "string"},
                    "selector": {"type": "string"},
                    "text": {"type": "string"},
                    "timeout": {"type": "integer"}
                },
                "required": ["action"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        action = params.get("action", "navigate")
        url = params.get("url", "")
        selector = params.get("selector", "")
        text = params.get("text", "")
        timeout = params.get("timeout", 30000)
        
        try:
            # Simulated browser actions (in production, use Playwright)
            if action == "navigate":
                return MCPToolResult(
                    success=True,
                    data={"url": url, "title": "Page Title"},
                    metadata={"action": action}
                )
            
            elif action == "click":
                return MCPToolResult(
                    success=True,
                    data={"clicked": selector},
                    metadata={"action": action}
                )
            
            elif action == "type":
                return MCPToolResult(
                    success=True,
                    data={"typed": text, "into": selector},
                    metadata={"action": action}
                )
            
            elif action == "screenshot":
                return MCPToolResult(
                    success=True,
                    data={"screenshot_path": "/tmp/screenshot.png"},
                    metadata={"action": action}
                )
            
            elif action == "extract":
                return MCPToolResult(
                    success=True,
                    data={"content": "Extracted content..."},
                    metadata={"action": action}
                )
            
            elif action == "wait":
                await asyncio.sleep(timeout / 1000)
                return MCPToolResult(
                    success=True,
                    data={"waited_ms": timeout},
                    metadata={"action": action}
                )
            
            else:
                return MCPToolResult(success=False, error=f"Unknown action: {action}")
        
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# AI MCP Tool
# =============================================================================

class AIMCPTool(BaseMCPTool):
    """MCP tool for AI model interactions."""
    
    def __init__(self, provider: str = "openai", api_key: Optional[str] = None):
        self.provider = provider
        self.api_key = api_key
    
    @property
    def definition(self) -> MCPToolDefinition:
        return MCPToolDefinition(
            name="ai",
            description="Interact with AI models for text generation",
            type=MCPToolType.AI,
            parameters={
                "type": "object",
                "properties": {
                    "prompt": {"type": "string"},
                    "model": {"type": "string"},
                    "max_tokens": {"type": "integer"},
                    "temperature": {"type": "number"}
                },
                "required": ["prompt"]
            }
        )
    
    async def execute(self, params: Dict[str, Any]) -> MCPToolResult:
        prompt = params.get("prompt", "")
        model = params.get("model", "gpt-4o-mini")
        max_tokens = params.get("max_tokens", 1000)
        temperature = params.get("temperature", 0.7)
        
        try:
            # Simulated AI response (in production, use actual API)
            return MCPToolResult(
                success=True,
                data={
                    "response": f"AI response to: {prompt[:100]}...",
                    "model": model,
                    "usage": {"prompt_tokens": 50, "completion_tokens": 100}
                },
                metadata={"provider": self.provider}
            )
        
        except Exception as e:
            return MCPToolResult(success=False, error=str(e))


# =============================================================================
# MCP Tool Registry
# =============================================================================

class MCPToolRegistry:
    """Registry for MCP tools."""
    
    _instance: Optional[MCPToolRegistry] = None
    _tools: Dict[str, BaseMCPTool] = {}
    
    def __new__(cls) -> MCPToolRegistry:
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._register_default_tools()
        return cls._instance
    
    def _register_default_tools(self):
        """Register default MCP tools."""
        self.register(FilesystemMCPTool())
        self.register(DatabaseMCPTool())
        self.register(HTTPMCPTool())
        self.register(ShellMCPTool())
        self.register(BrowserMCPTool())
        self.register(AIMCPTool())
    
    def register(self, tool: BaseMCPTool) -> None:
        """Register an MCP tool."""
        name = tool.definition.name
        self._tools[name] = tool
        logger.info(f"Registered MCP tool: {name}")
    
    def get(self, name: str) -> Optional[BaseMCPTool]:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def list_all(self) -> List[MCPToolDefinition]:
        """List all registered tools."""
        return [tool.definition for tool in self._tools.values()]
    
    async def execute(self, name: str, params: Dict[str, Any]) -> MCPToolResult:
        """Execute a tool by name."""
        tool = self.get(name)
        if not tool:
            return MCPToolResult(success=False, error=f"Tool not found: {name}")
        
        # Validate parameters
        errors = await tool.validate_params(params)
        if errors:
            return MCPToolResult(success=False, error="; ".join(errors))
        
        return await tool.execute(params)


# Singleton instance
mcp_tool_registry = MCPToolRegistry()


# =============================================================================
# Export
# =============================================================================

__all__ = [
    # Types
    'MCPToolType',
    'MCPToolDefinition',
    'MCPToolResult',
    # Base
    'BaseMCPTool',
    # Tools
    'FilesystemMCPTool',
    'DatabaseMCPTool',
    'HTTPMCPTool',
    'ShellMCPTool',
    'BrowserMCPTool',
    'AIMCPTool',
    # Registry
    'MCPToolRegistry',
    'mcp_tool_registry',
]