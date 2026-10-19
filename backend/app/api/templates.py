from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.services.template_service import template_service

router = APIRouter(prefix="/templates", tags=["templates"])

class TemplateApplyRequest(BaseModel):
    template_id: str
    meeting_title: str
    user_notes: str
    participants: List[str] = []
    folder_context: Optional[str] = None
    transcript: List[Dict[str, Any]] = []

class SlashCommandRequest(BaseModel):
    command: str
    selected_text: str

@router.get("")
async def list_templates():
    return template_service.get_all_templates()

@router.post("/apply")
async def apply_template(req: TemplateApplyRequest):
    context = req.model_dump()
    rendered = template_service.render_template(req.template_id, context)
    return {"rendered_text": rendered}

@router.post("/command")
async def execute_command(req: SlashCommandRequest):
    result = template_service.process_slash_command(req.command, req.selected_text)
    return {"result": result}
