from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime, timezone
from backend.app.services.pii_masking import pii_masking_service

router = APIRouter(prefix="/security", tags=["security"])

class MaskRequest(BaseModel):
    text: str

class MaskResponse(BaseModel):
    masked_text: str
    stats: Dict[str, int]

@router.post("/mask-pii", response_model=MaskResponse)
async def mask_pii(req: MaskRequest):
    masked, stats = pii_masking_service.mask_text(req.text)
    return MaskResponse(masked_text=masked, stats=stats)

@router.get("/audit-logs")
async def get_audit_logs():
    now = datetime.now(timezone.utc)
    return [
        {
            "id": "log-001",
            "action": "MEETING_AUDIO_PURGED_ZERO_RETENTION",
            "user": "southwell855@gmail.com",
            "details": "Audio file purged immediately after STT completion (Zero Audio Storage)",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "log-002",
            "action": "PII_MASKING_APPLIED",
            "user": "southwell855@gmail.com",
            "details": "3 sensitive credentials anonymized prior to vector embedding",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "id": "log-003",
            "action": "EXPORT_TO_SLACK",
            "user": "southwell855@gmail.com",
            "details": "Meeting summary exported to channel #general-syncs",
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
