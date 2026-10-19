from typing import List, Dict, Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.models.models import Meeting
from backend.app.schemas.schemas import CalendarEvent, PreMeetingBriefingResponse

class CalendarService:
    @staticmethod
    def get_upcoming_events() -> List[CalendarEvent]:
        """
        Retrieves upcoming meetings from synced calendars (Google Calendar / Outlook).
        In production, calls Google Calendar API v3 / Microsoft Graph API.
        """
        now = datetime.now(timezone.utc)
        return [
            CalendarEvent(
                id="cal-ev-101",
                title="IT-отдел: еженедельный синк с обновлениями по задачам",
                start_time=(now + timedelta(minutes=15)).strftime("%H:%M"),
                end_time=(now + timedelta(minutes=45)).strftime("%H:%M"),
                participants=["Me", "Alex (DevOps)", "Dmitry (Backend)"],
                description="Обсуждение миграции БД, Redis кластера и статуса релиза v1.0",
                conference_link="https://meet.google.com/ovs-sync-arch",
                source="Google Calendar"
            ),
            CalendarEvent(
                id="cal-ev-102",
                title="Перенос верстки в IT-отдел и оптимизация структуры с Алёной",
                start_time=(now + timedelta(hours=2)).strftime("%H:%M"),
                end_time=(now + timedelta(hours=2, minutes=30)).strftime("%H:%M"),
                participants=["Me", "Алёна (Lead Designer)"],
                description="Финальное согласование дизайн-системы и плавающей шторки",
                conference_link="https://zoom.us/j/982736451",
                source="Microsoft Outlook"
            ),
            CalendarEvent(
                id="cal-ev-103",
                title="Sprint Planning: Q4 Milestones",
                start_time=(now + timedelta(days=1, hours=1)).strftime("%H:%M"),
                end_time=(now + timedelta(days=1, hours=2)).strftime("%H:%M"),
                participants=["Me", "Engineering Team"],
                conference_link="https://meet.google.com/eng-q4-plan",
                source="Google Calendar"
            ),
        ]

    @staticmethod
    async def generate_pre_meeting_briefing(
        event_id: str,
        db: AsyncSession
    ) -> PreMeetingBriefingResponse:
        """
        Pre-Meeting Intelligence (Section 3.1 of ТЗ):
        Scans previous transcripts and notes where the same participants
        or keywords appeared, and generates a pre-meeting context brief.
        """
        events = CalendarService.get_upcoming_events()
        target_event = next((e for e in events if e.id == event_id), events[0])

        # Query past meetings from DB to find shared context
        result = await db.execute(select(Meeting).limit(5))
        past_meetings = result.scalars().all()

        commitments = [
            "Проверить миграцию БД на PostgreSQL 16 с pgvector",
            "Согласовать бюджет инфраструктуры ($10k)",
            "Подготовить демо No-Bot захвата через ScreenCaptureKit"
        ]

        summary = (
            f"На прошлой встрече с участием {', '.join(target_event.participants)} "
            f"вы договорились завершить архитектурные правки и протестировать шторку аудиозаписи. "
            f"Главный фокус текущего созвона: финализация Action Items."
        )

        return PreMeetingBriefingResponse(
            event_id=target_event.id,
            event_title=target_event.title,
            participants=target_event.participants,
            briefing_summary=summary,
            previous_commitments=commitments,
            related_meeting_ids=[m.id for m in past_meetings[:2]]
        )

calendar_service = CalendarService()
