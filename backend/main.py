"""
AI Manus Unified - FastAPI Application
=======================================
Main FastAPI application for the AI Manus Unified platform.
Provides REST API endpoints for workflow management, skill execution,
and AI provider integration.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


# =============================================================================
# Lifespan Context Manager
# =============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan context manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("=" * 60)
    logger.info("AI Manus Unified - Starting up...")
    logger.info("=" * 60)
    
    # Initialize skill registry
    from skills.skill_registry import skill_registry
    logger.info(f"Loaded {len(skill_registry.list_all())} skills")
    
    # Initialize workflow manager
    from workflow.workflow_runner import workflow_manager as _
    logger.info("Workflow manager initialized")
    
    logger.info("=" * 60)
    logger.info("AI Manus Unified - Ready!")
    logger.info("=" * 60)
    
    yield
    
    # Shutdown
    logger.info("AI Manus Unified - Shutting down...")


# =============================================================================
# Create FastAPI Application
# =============================================================================

app = FastAPI(
    title="AI Manus Unified",
    description="""
    ## AI Manus Unified - Visual Workflow Automation Platform
    
    A powerful AI-powered workflow automation platform that combines:
    
    - **17+ AI Providers**: OpenAI, Anthropic, Google, DeepSeek, Groq, Mistral, xAI, and more
    - **20+ Skills**: Browser automation, code execution, file management, HTTP requests
    - **Visual Workflow Builder**: Drag-and-drop interface powered by React Flow
    - **n8n Import**: Import workflows from n8n and convert to Manus format
    - **DAG Execution Engine**: Parallel and sequential node execution
    
    ### Key Features
    
    - Dynamic AI reasoning for workflow decisions
    - Secure sandbox execution for Python and Bash
    - Real-time workflow monitoring and streaming
    - MCP tool integration for external services
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)


# =============================================================================
# CORS Middleware
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*",  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Exception Handlers
# =============================================================================

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc),
            "path": str(request.url),
        }
    )


# =============================================================================
# Health Check Endpoints
# =============================================================================

@app.get("/")
async def root():
    """Root endpoint - API information."""
    return {
        "name": "AI Manus Unified",
        "version": "1.0.0",
        "description": "Visual Workflow Automation Platform",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    from skills.skill_registry import skill_registry
    from workflow.workflow_runner import workflow_manager
    
    return {
        "status": "healthy",
        "version": "1.0.0",
        "skills_count": len(skill_registry.list_all()),
        "workflows_count": len(workflow_manager.list_workflows()),
    }


# =============================================================================
# Register Routers
# =============================================================================

# Import and register workflow routes
from api.workflow_routes import router as workflow_router

app.include_router(workflow_router)

logger.info("Workflow routes registered at /api/workflows")


# =============================================================================
# Additional API Routes
# =============================================================================

@app.get("/api/providers")
async def list_providers():
    """List all available AI providers."""
    # In a real app, these would be checked against env vars or health checks
    return {
        "providers": [
            {"id": "openai", "name": "openai", "displayName": "OpenAI", "available": True, "models": ["gpt-4o", "gpt-4-turbo", "o1", "o3-mini"]},
            {"id": "anthropic", "name": "anthropic", "displayName": "Anthropic", "available": True, "models": ["claude-sonnet-4", "claude-3.5-sonnet", "claude-3.5-haiku"]},
            {"id": "google", "name": "google", "displayName": "Google AI", "available": True, "models": ["gemini-2.0-flash", "gemini-1.5-pro"]},
            {"id": "deepseek", "name": "deepseek", "displayName": "DeepSeek", "available": True, "models": ["deepseek-chat", "deepseek-reasoner"]},
            {"id": "groq", "name": "groq", "displayName": "Groq", "available": True, "models": ["llama-3.3-70b-versatile", "mixtral-8x7b"]},
            {"id": "mistral", "name": "mistral", "displayName": "Mistral AI", "available": True, "models": ["mistral-large-latest", "codestral-latest"]},
            {"id": "xai", "name": "xai", "displayName": "xAI", "available": True, "models": ["grok-beta"]},
            {"id": "cohere", "name": "cohere", "displayName": "Cohere", "available": True, "models": ["command-r-plus", "command-r"]},
            {"id": "openrouter", "name": "openrouter", "displayName": "OpenRouter", "available": True, "models": ["openai/gpt-4o", "anthropic/claude-3.5-sonnet"]},
            {"id": "ollama", "name": "ollama", "displayName": "Ollama (Local)", "available": False, "models": ["llama3.2", "codellama", "mistral"]},
            {"id": "lmstudio", "name": "lmstudio", "displayName": "LMStudio (Local)", "available": False, "models": ["local-model"]},
            {"id": "together", "name": "together", "displayName": "Together AI", "available": True, "models": ["meta-llama/Llama-3-70b-chat-hf"]},
            {"id": "perplexity", "name": "perplexity", "displayName": "Perplexity", "available": True, "models": ["llama-3.1-sonar-large-128k-online"]},
            {"id": "huggingface", "name": "huggingface", "displayName": "HuggingFace", "available": True, "models": ["meta-llama/Llama-2-70b-chat-hf"]},
            {"id": "moonshot", "name": "moonshot", "displayName": "Moonshot (Kimi)", "available": True, "models": ["moonshot-v1-8k", "moonshot-v1-32k"]},
            {"id": "hyperbolic", "name": "hyperbolic", "displayName": "Hyperbolic", "available": True, "models": ["meta-llama/Llama-3-70b"]},
            {"id": "github", "name": "github", "displayName": "GitHub Models", "available": True, "models": ["gpt-4o", "Phi-3-medium-128k-instruct"]},
        ]
    }


@app.get("/api/tools")
async def list_tools():
    """List all available tools."""
    from skills.skill_registry import skill_registry
    skills = skill_registry.list_all()
    return {
        "tools": [
            {
                "name": skill.id,
                "description": skill.description,
                "category": skill.category.value.split('_')[0],  # Simplified category
            }
            for skill in skills
        ]
    }


@app.post("/api/chat")
async def chat(request: Request):
    """Handle chat requests."""
    data = await request.json()
    provider = data.get("provider", "openai")
    messages = data.get("messages", [])

    # Mock response
    return {
        "data": f"This is a simulated response from {provider} for your message: '{messages[-1]['content']}'"
    }


@app.get("/api/stats")
async def get_stats():
    """Get system statistics."""
    from skills.skill_registry import skill_registry
    return {
        "providers": {
            "totalProviders": 17,
            "availableProviders": 15
        },
        "tools": {
            "totalTools": len(skill_registry.list_all())
        },
        "orchestrator": {
            "healthyProviders": 15
        }
    }


@app.get("/api/config")
async def get_config():
    """Get public configuration."""
    return {
        "version": "1.0.0",
        "features": {
            "workflow_builder": True,
            "n8n_import": True,
            "streaming": True,
            "sandbox": True,
            "mcp_tools": True,
        },
        "limits": {
            "max_workflow_nodes": 100,
            "max_parallel_executions": 5,
            "default_timeout": 300,
        }
    }


# =============================================================================
# Static Files (for frontend)
# =============================================================================

# Mount static files if the frontend build exists
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="static")
    logger.info(f"Frontend static files mounted from {frontend_dist}")


# =============================================================================
# Development Server
# =============================================================================

def run_dev_server():
    """Run the development server."""
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(Path(__file__).parent)],
        log_level="info",
    )


if __name__ == "__main__":
    run_dev_server()


# =============================================================================
# Export
# =============================================================================

__all__ = [
    'app',
    'run_dev_server',
]