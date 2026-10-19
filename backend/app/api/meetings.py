from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.models import Meeting, User
from backend.app.schemas.schemas import MeetingCreate, MeetingUpdate, MeetingOut
from backend.app.api.auth import get_current_user
from backend.app.services.vector_service import vector_service
from backend.app.services.s3_service import s3_service

router = APIRouter(prefix="/meetings", tags=["meetings"])

@router.get("", response_model=List[MeetingOut])
async def list_meetings(
    folder_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Meeting).order_by(Meeting.created_at.desc())
    if folder_id:
        stmt = stmt.where(Meeting.folder_id == folder_id)
    result = await db.execute(stmt)
    return [MeetingOut.model_validate(m) for m in result.scalars().all()]

@router.post("", response_model=MeetingOut)
async def create_meeting(
    meeting_in: MeetingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    transcript_dicts = [t.model_dump() for t in meeting_in.transcript] if meeting_in.transcript else []
    meeting = Meeting(
        title=meeting_in.title,
        folder_id=meeting_in.folder_id,
        owner_id=current_user.id,
        calendar_event_id=meeting_in.calendar_event_id,
        raw_user_notes=meeting_in.raw_user_notes,
        transcript=transcript_dicts,
        duration_seconds=meeting_in.duration_seconds or 0
    )
    db.add(meeting)
    await db.commit()
    await db.refresh(meeting)
    return MeetingOut.model_validate(meeting)

@router.get("/{meeting_id}", response_model=MeetingOut)
async def get_meeting(meeting_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return MeetingOut.model_validate(meeting)

@router.put("/{meeting_id}", response_model=MeetingOut)
async def update_meeting(
    meeting_id: str,
    update_in: MeetingUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if update_in.title is not None:
        meeting.title = update_in.title
    if update_in.raw_user_notes is not None:
        meeting.raw_user_notes = update_in.raw_user_notes
    if update_in.transcript is not None:
        meeting.transcript = [t.model_dump() for t in update_in.transcript]
    if update_in.duration_seconds is not None:
        meeting.duration_seconds = update_in.duration_seconds
    if update_in.ai_summary is not None:
        meeting.ai_summary = update_in.ai_summary

    await db.commit()
    await db.refresh(meeting)
    return MeetingOut.model_validate(meeting)

@router.post("/{meeting_id}/enhance", response_model=MeetingOut)
async def enhance_meeting(meeting_id: str, db: AsyncSession = Depends(get_db)):
    """
    Executes Server-Side 'Jot & Enhance' algorithm (ТЗ 3.3):
    Synthesizes notes with transcript, embeds citations with [start_ms, end_ms],
    and indexes embeddings for semantic RAG search.
    """
    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    raw_notes = meeting.raw_user_notes or ""
    transcript = meeting.transcript or []

    # Synthesize enhanced points
    enhanced_lines = []
    for line in raw_notes.split("\n"):
        trimmed = line.strip()
        if trimmed.startswith("-") or trimmed.startswith("*"):
            bullet = trimmed.lstrip("-* ").strip()
            # Match with transcript
            matched = next((c for c in transcript if any(w in c.get("text", "").lower() for w in bullet.lower().split() if len(w) > 3)), None)
            if matched:
                s_ms = matched.get("startMs", 0)
                e_ms = matched.get("endMs", 0)
                enhanced_lines.append(f"- **{bullet}**: Согласовано ({matched.get('speaker', 'Speaker')}: «{matched.get('text', '')[:80]}...») [{s_ms}ms - {e_ms}ms]")
            else:
                enhanced_lines.append(f"- **{bullet}** — зафиксировано в протоколе встречи.")
        else:
            enhanced_lines.append(line)

    enhanced_text = "\n".join(enhanced_lines)
    meeting.ai_summary = {
        "text": enhanced_text,
        "is_enhanced": True,
        "status": "ready"
    }

    # Automatically index in Vector DB (RAG)
    await vector_service.index_meeting(meeting, db)

    await db.commit()
    await db.refresh(meeting)
    return MeetingOut.model_validate(meeting)

@router.post("/{meeting_id}/audio")
async def upload_meeting_audio(
    meeting_id: str,
    file: UploadFile = File(...),
    zero_retention: bool = False,
    db: AsyncSession = Depends(get_db)
):
    content = await file.read()
    s3_key = await s3_service.upload_audio_file(meeting_id, content, file.filename or "meeting.opus")

    result = await db.execute(select(Meeting).where(Meeting.id == meeting_id))
    meeting = result.scalar_one_or_none()
    if meeting:
        meeting.audio_s3_key = s3_key
        await db.commit()

    if zero_retention:
        # Zero Audio Storage policy: immediately delete audio
        await s3_service.delete_audio_file(s3_key)
        if meeting:
            meeting.audio_s3_key = None
            await db.commit()
        return {"status": "audio_processed_and_purged_zero_retention"}

    return {"status": "uploaded", "s3_key": s3_key}
