from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.schemas import CalendarEvent, PreMeetingBriefingResponse
from backend.app.services.calendar_service import calendar_service

router = APIRouter(prefix="/calendar", tags=["calendar"])

@router.get("/events", response_model=List[CalendarEvent])
async def get_upcoming_events():
    return calendar_service.get_upcoming_events()

@router.get("/briefing/{event_id}", response_model=PreMeetingBriefingResponse)
async def get_pre_meeting_briefing(
    event_id: str,
    db: AsyncSession = Depends(get_db)
):
    return await calendar_service.generate_pre_meeting_briefing(event_id, db)
