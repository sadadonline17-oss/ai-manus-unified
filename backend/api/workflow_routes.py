"""
AI Manus Unified - Workflow API Routes
=======================================
FastAPI routes for workflow management, execution, and monitoring.
Provides REST endpoints for the visual workflow builder frontend.

Author: AI Manus Unified Team
License: MIT
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional
from pathlib import Path

from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
    BackgroundTasks,
    Query,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# Import from our modules
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from skills.skill_registry import (
    skill_registry,
    SkillCategory,
)
from workflow.workflow_runner import (
    workflow_runner,
    workflow_manager,
)
from workflow.n8n_parser import (
    N8NParser,
    convert_n8n_to_manus,
    validate_manus_workflow,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/workflows", tags=["workflows"])


# =============================================================================
# Pydantic Models
# =============================================================================

class WorkflowNodeModel(BaseModel):
    """Model for a workflow node."""
    id: str
    name: str
    type: str = "skill"
    skill_id: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    position: List[int] = Field(default_factory=lambda: [0, 0])
    connections: List[str] = Field(default_factory=list)
    conditions: List[Dict[str, Any]] = Field(default_factory=list)


class WorkflowEdgeModel(BaseModel):
    """Model for a workflow edge."""
    id: str
    source: str
    target: str
    output_index: int = 0


class WorkflowModel(BaseModel):
    """Model for a complete workflow."""
    id: Optional[str] = None
    name: str
    description: str = ""
    nodes: List[WorkflowNodeModel] = Field(default_factory=list)
    edges: List[WorkflowEdgeModel] = Field(default_factory=list)
    triggers: List[str] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=dict)


class ExecuteWorkflowRequest(BaseModel):
    """Request model for executing a workflow."""
    workflow_id: Optional[str] = None
    workflow: Optional[WorkflowModel] = None
    initial_context: Dict[str, Any] = Field(default_factory=dict)


class SkillParameterModel(BaseModel):
    """Model for a skill parameter."""
    name: str
    type: str
    description: str
    required: bool = True
    default: Any = None
    options: List[str] = Field(default_factory=list)


class SkillOutputModel(BaseModel):
    """Model for a skill output."""
    name: str
    type: str
    description: str


class SkillDefinitionModel(BaseModel):
    """Model for a skill definition."""
    id: str
    name: str
    description: str
    category: str
    parameters: List[SkillParameterModel] = Field(default_factory=list)
    outputs: List[SkillOutputModel] = Field(default_factory=list)
    icon: str = "⚙️"
    color: str = "#6366f1"


# =============================================================================
# Skills Endpoints
# =============================================================================

@router.get("/skills", response_model=List[SkillDefinitionModel])
async def list_skills(
    category: Optional[str] = Query(None, description="Filter by category")
) -> List[SkillDefinitionModel]:
    """
    List all available skills.
    
    Returns all registered skills that can be used in workflows.
    Optionally filter by category.
    """
    skills = skill_registry.list_all()
    
    if category:
        try:
            cat = SkillCategory(category)
            skills = skill_registry.list_by_category(cat)
        except ValueError:
            pass
    
    return [
        SkillDefinitionModel(
            id=skill.id,
            name=skill.name,
            description=skill.description,
            category=skill.category.value,
            parameters=[
                SkillParameterModel(
                    name=p.name,
                    type=p.type,
                    description=p.description,
                    required=p.required,
                    default=p.default,
                    options=p.options,
                )
                for p in skill.parameters
            ],
            outputs=[
                SkillOutputModel(
                    name=o.name,
                    type=o.type,
                    description=o.description,
                )
                for o in skill.outputs
            ],
            icon=skill.icon,
            color=skill.color,
        )
        for skill in skills
    ]


@router.get("/skills/categories")
async def list_skill_categories() -> List[Dict[str, str]]:
    """
    List all skill categories.
    
    Returns available categories for organizing skills.
    """
    return [
        {"id": cat.value, "name": cat.name.replace("_", " ").title()}
        for cat in SkillCategory
    ]


@router.get("/skills/{skill_id}", response_model=SkillDefinitionModel)
async def get_skill(skill_id: str) -> SkillDefinitionModel:
    """
    Get a specific skill by ID.
    
    Returns detailed information about a skill.
    """
    skill = skill_registry.get(skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail=f"Skill not found: {skill_id}")
    
    definition = skill.definition
    return SkillDefinitionModel(
        id=definition.id,
        name=definition.name,
        description=definition.description,
        category=definition.category.value,
        parameters=[
            SkillParameterModel(
                name=p.name,
                type=p.type,
                description=p.description,
                required=p.required,
                default=p.default,
                options=p.options,
            )
            for p in definition.parameters
        ],
        outputs=[
            SkillOutputModel(
                name=o.name,
                type=o.type,
                description=o.description,
            )
            for o in definition.outputs
        ],
        icon=definition.icon,
        color=definition.color,
    )


# =============================================================================
# Workflow CRUD Endpoints
# =============================================================================

@router.get("")
async def list_workflows() -> List[Dict[str, Any]]:
    """
    List all saved workflows.
    
    Returns a list of all workflows in the system.
    """
    workflows = workflow_manager.list_workflows()
    return [
        {
            "id": w.get("id"),
            "name": w.get("name"),
            "description": w.get("description", ""),
            "created_at": w.get("created_at"),
            "updated_at": w.get("updated_at"),
            "node_count": len(w.get("nodes", [])),
        }
        for w in workflows
    ]


@router.post("")
async def create_workflow(workflow: WorkflowModel) -> Dict[str, str]:
    """
    Create a new workflow.
    
    Saves the workflow and returns its ID.
    """
    workflow_dict = workflow.model_dump(exclude_none=True)
    
    # Validate workflow
    errors = validate_manus_workflow(workflow_dict)
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    workflow_id = workflow_manager.save_workflow(workflow_dict)
    
    return {"id": workflow_id, "message": "Workflow created successfully"}


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str) -> Dict[str, Any]:
    """
    Get a workflow by ID.
    
    Returns the complete workflow definition.
    """
    workflow = workflow_manager.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_id}")
    
    return workflow


@router.put("/{workflow_id}")
async def update_workflow(
    workflow_id: str,
    workflow: WorkflowModel
) -> Dict[str, str]:
    """
    Update an existing workflow.
    
    Updates the workflow with the given ID.
    """
    existing = workflow_manager.get_workflow(workflow_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_id}")
    
    workflow_dict = workflow.model_dump(exclude_none=True)
    workflow_dict["id"] = workflow_id
    
    # Validate workflow
    errors = validate_manus_workflow(workflow_dict)
    if errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    workflow_manager.save_workflow(workflow_dict)
    
    return {"id": workflow_id, "message": "Workflow updated successfully"}


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str) -> Dict[str, str]:
    """
    Delete a workflow.
    
    Removes the workflow from the system.
    """
    if not workflow_manager.delete_workflow(workflow_id):
        raise HTTPException(status_code=404, detail=f"Workflow not found: {workflow_id}")
    
    return {"message": "Workflow deleted successfully"}


# =============================================================================
# Workflow Execution Endpoints
# =============================================================================

@router.post("/execute")
async def execute_workflow(
    request: ExecuteWorkflowRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Execute a workflow.
    
    Starts workflow execution and returns the execution ID.
    The workflow can be specified by ID or provided directly.
    """
    if request.workflow_id:
        workflow = workflow_manager.get_workflow(request.workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=404,
                detail=f"Workflow not found: {request.workflow_id}"
            )
    elif request.workflow:
        workflow = request.workflow.model_dump(exclude_none=True)
    else:
        raise HTTPException(
            status_code=400,
            detail="Either workflow_id or workflow must be provided"
        )
    
    # Execute in background
    execution = await workflow_manager.run_workflow(
        workflow.get("id", "temp"),
        request.initial_context
    )
    
    return {
        "execution_id": execution.execution_id,
        "workflow_id": execution.workflow_id,
        "status": execution.status.value,
        "message": "Workflow execution started",
    }


@router.post("/execute/stream")
async def execute_workflow_stream(
    request: ExecuteWorkflowRequest
) -> StreamingResponse:
    """
    Execute a workflow with streaming updates.
    
    Streams execution state updates via Server-Sent Events.
    """
    if request.workflow_id:
        workflow = workflow_manager.get_workflow(request.workflow_id)
        if not workflow:
            raise HTTPException(
                status_code=404,
                detail=f"Workflow not found: {request.workflow_id}"
            )
    elif request.workflow:
        workflow = request.workflow.model_dump(exclude_none=True)
    else:
        raise HTTPException(
            status_code=400,
            detail="Either workflow_id or workflow must be provided"
        )
    
    async def event_generator():
        async for update in workflow_runner.execute_stream(
            workflow,
            request.initial_context
        ):
            yield f"data: {json.dumps(update)}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/executions/{execution_id}")
async def get_execution(execution_id: str) -> Dict[str, Any]:
    """
    Get execution status and results.
    
    Returns the current state of a workflow execution.
    """
    execution = workflow_runner.get_execution(execution_id)
    if not execution:
        raise HTTPException(
            status_code=404,
            detail=f"Execution not found: {execution_id}"
        )
    
    return execution.to_dict()


@router.post("/executions/{execution_id}/cancel")
async def cancel_execution(execution_id: str) -> Dict[str, str]:
    """
    Cancel a running execution.
    
    Stops the workflow execution if it's still running.
    """
    if not workflow_runner.cancel_execution(execution_id):
        raise HTTPException(
            status_code=404,
            detail=f"Execution not found or already completed: {execution_id}"
        )
    
    return {"message": "Execution cancelled"}


@router.get("/executions")
async def list_executions(
    workflow_id: Optional[str] = Query(None)
) -> List[Dict[str, Any]]:
    """
    List all executions.
    
    Returns a list of workflow executions, optionally filtered by workflow.
    """
    executions = workflow_runner.list_executions(workflow_id)
    return [e.to_dict() for e in executions]


# =============================================================================
# n8n Import Endpoints
# =============================================================================

@router.post("/import/n8n")
async def import_n8n_workflow(
    file: UploadFile = File(..., description="n8n workflow JSON file")
) -> Dict[str, Any]:
    """
    Import an n8n workflow.
    
    Parses an n8n JSON export and converts it to Manus format.
    """
    if not file.filename or not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=400,
            detail="File must be a JSON file"
        )
    
    try:
        content = await file.read()
        n8n_data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON file"
        )
    
    # Parse n8n workflow
    parser = N8NParser()
    manus_workflow = parser.parse(n8n_data)
    
    # Save the converted workflow
    workflow_dict = manus_workflow.to_dict()
    workflow_id = workflow_manager.save_workflow(workflow_dict)
    
    return {
        "id": workflow_id,
        "name": manus_workflow.name,
        "message": "n8n workflow imported successfully",
        "nodes_converted": len(manus_workflow.nodes),
        "edges_converted": len(manus_workflow.edges),
    }


@router.post("/import/n8n/preview")
async def preview_n8n_import(
    file: UploadFile = File(..., description="n8n workflow JSON file")
) -> Dict[str, Any]:
    """
    Preview an n8n workflow import.
    
    Shows how the n8n workflow would be converted without saving.
    """
    if not file.filename or not file.filename.endswith('.json'):
        raise HTTPException(
            status_code=400,
            detail="File must be a JSON file"
        )
    
    try:
        content = await file.read()
        n8n_data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail="Invalid JSON file"
        )
    
    # Parse n8n workflow
    manus_workflow = convert_n8n_to_manus(n8n_data)
    
    return manus_workflow


# =============================================================================
# Validation Endpoints
# =============================================================================

@router.post("/validate")
async def validate_workflow(workflow: WorkflowModel) -> Dict[str, Any]:
    """
    Validate a workflow.
    
    Checks the workflow for errors and returns validation results.
    """
    workflow_dict = workflow.model_dump(exclude_none=True)
    errors = validate_manus_workflow(workflow_dict)
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
    }


# =============================================================================
# Export Endpoints
# =============================================================================

@router.get("/{workflow_id}/export")
async def export_workflow(workflow_id: str) -> Dict[str, Any]:
    """
    Export a workflow.
    
    Returns the workflow in a format suitable for download.
    """
    workflow = workflow_manager.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=404,
            detail=f"Workflow not found: {workflow_id}"
        )
    
    return workflow


# =============================================================================
# Health Check
# =============================================================================

@router.get("/health")
async def health_check() -> Dict[str, str]:
    """
    Health check endpoint.
    
    Returns the status of the workflow service.
    """
    return {
        "status": "healthy",
        "skills_registered": str(len(skill_registry.list_all())),
        "workflows_saved": str(len(workflow_manager.list_workflows())),
    }


# =============================================================================
# Router Registration Helper
# =============================================================================

def register_workflow_routes(app):
    """
    Register workflow routes with a FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    app.include_router(router)
    logger.info("Workflow routes registered")


# =============================================================================
# Export
# =============================================================================

__all__ = [
    'router',
    'register_workflow_routes',
    'WorkflowModel',
    'WorkflowNodeModel',
    'WorkflowEdgeModel',
    'ExecuteWorkflowRequest',
    'SkillDefinitionModel',
]