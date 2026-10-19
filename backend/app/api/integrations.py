from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from backend.app.services.integration_service import integration_service

router = APIRouter(prefix="/integrations", tags=["integrations"])

class SlackExportRequest(BaseModel):
    webhook_url: Optional[str] = None
    channel: str = "#general-syncs"
    meeting_title: str
    summary_text: str
    action_items: List[str] = []

class NotionExportRequest(BaseModel):
    database_id: str = "meeting-notes-db"
    meeting_title: str
    notes_markdown: str
    participants: List[str] = []

class JiraExportRequest(BaseModel):
    project_key: str = "OVS"
    summary: str
    description: str
    assignee: Optional[str] = "Me"

@router.post("/slack")
async def export_slack(req: SlackExportRequest):
    return await integration_service.export_to_slack(
        webhook_url=req.webhook_url,
        channel_name=req.channel,
        meeting_title=req.meeting_title,
        summary_text=req.summary_text,
        action_items=req.action_items
    )

@router.post("/notion")
async def export_notion(req: NotionExportRequest):
    return await integration_service.export_to_notion(
        database_id=req.database_id,
        meeting_title=req.meeting_title,
        notes_markdown=req.notes_markdown,
        participants=req.participants
    )

@router.post("/jira")
async def export_jira(req: JiraExportRequest):
    return await integration_service.create_jira_ticket(
        project_key=req.project_key,
        summary=req.summary,
        description=req.description,
        assignee=req.assignee
    )
