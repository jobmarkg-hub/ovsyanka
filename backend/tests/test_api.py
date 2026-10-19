import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from backend.app.main import app
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.models.models import User, Space, Meeting
from backend.app.core.security import get_password_hash

@pytest_asyncio.fixture(autouse=True)
async def init_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        res = await db.execute(select(User).where(User.email == "southwell855@gmail.com"))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                email="southwell855@gmail.com",
                full_name="Malcom Southwell",
                hashed_password=get_password_hash("ovsyanka123"),
                role="super_admin"
            )
            db.add(user)
            await db.flush()

            space = Space(
                workspace_id="ws-malcom-hq",
                name="My notes",
                is_private=True,
                owner_id=user.id
            )
            db.add(space)
            await db.commit()

@pytest.mark.asyncio
async def test_health_and_docs():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.asyncio
async def test_auth_and_spaces_and_meetings():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Login with seeded user
        login_res = await ac.post("/api/v1/auth/login", json={
            "email": "southwell855@gmail.com",
            "password": "ovsyanka123"
        })
        assert login_res.status_code == 200
        token_data = login_res.json()
        token = token_data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. List Spaces
        spaces_res = await ac.get("/api/v1/spaces", headers=headers)
        assert spaces_res.status_code == 200
        spaces = spaces_res.json()
        assert len(spaces) >= 1

        # 3. Create a Meeting
        create_res = await ac.post("/api/v1/meetings", headers=headers, json={
            "title": "Architecture Sync: No-Bot & pgvector",
            "raw_user_notes": "- Дедлайн пятница\n- Миграция БД на PostgreSQL 16 с pgvector\n- Согласовать бюджет 10к",
            "transcript": [
                {
                    "id": "c1",
                    "speaker": "Sam",
                    "channel": 1,
                    "startMs": 4000,
                    "endMs": 9500,
                    "text": "Мы согласовали бюджет в 10 тысяч долларов и зафиксировали дедлайн в эту пятницу."
                }
            ],
            "duration_seconds": 320
        })
        assert create_res.status_code == 200
        meeting = create_res.json()
        meeting_id = meeting["id"]
        assert meeting["title"] == "Architecture Sync: No-Bot & pgvector"

        # 4. Enhance Meeting (Jot & Enhance)
        enhance_res = await ac.post(f"/api/v1/meetings/{meeting_id}/enhance", headers=headers)
        assert enhance_res.status_code == 200
        enhanced_meeting = enhance_res.json()
        assert enhanced_meeting["ai_summary"]["is_enhanced"] is True
        assert "Согласовано" in enhanced_meeting["ai_summary"]["text"]

        # 5. Semantic RAG Search across meetings
        search_res = await ac.post("/api/v1/search/rag", headers=headers, json={
            "query": "бюджет 10 тысяч",
            "limit": 3
        })
        assert search_res.status_code == 200
        search_data = search_res.json()
        assert len(search_data["sources"]) > 0

        # 6. Calendar & Pre-Meeting Briefing
        cal_res = await ac.get("/api/v1/calendar/events", headers=headers)
        assert cal_res.status_code == 200
        events = cal_res.json()
        assert len(events) >= 1

        briefing_res = await ac.get(f"/api/v1/calendar/briefing/{events[0]['id']}", headers=headers)
        assert briefing_res.status_code == 200
        briefing = briefing_res.json()
        assert len(briefing["previous_commitments"]) > 0

        # 7. Templates & Custom Recipes (Phase 3)
        tmpl_res = await ac.get("/api/v1/templates")
        assert tmpl_res.status_code == 200
        templates = tmpl_res.json()
        assert len(templates) >= 4

        # Apply Executive Summary
        apply_res = await ac.post("/api/v1/templates/apply", json={
            "template_id": "executive-summary",
            "meeting_title": "Architecture Sync: No-Bot & pgvector",
            "user_notes": "- Дедлайн пятница\n- Миграция БД",
            "participants": ["Me", "Sam"],
            "transcript": [{"speaker": "Sam", "text": "Бюджет 10к утвержден"}]
        })
        assert apply_res.status_code == 200
        rendered = apply_res.json()["rendered_text"]
        assert "Executive Summary" in rendered
        assert "Дедлайн пятница" in rendered

        # Execute Slash Command (/jira-ticket)
        cmd_res = await ac.post("/api/v1/templates/command", json={
            "command": "/jira-ticket",
            "selected_text": "Миграция БД на PostgreSQL 16 с pgvector\nОтветственный: Me"
        })
        assert cmd_res.status_code == 200
        cmd_result = cmd_res.json()["result"]
        assert "Jira Issue Created" in cmd_result

        # 8. Enterprise Integrations (Phase 4)
        slack_res = await ac.post("/api/v1/integrations/slack", json={
            "channel": "#general-syncs",
            "meeting_title": "Architecture Sync: No-Bot & pgvector",
            "summary_text": "Миграция БД на PostgreSQL 16 завершена.",
            "action_items": ["Проверить pgvector", "Собрать релиз"]
        })
        assert slack_res.status_code == 200
        assert slack_res.json()["channel"] == "#general-syncs"

        notion_res = await ac.post("/api/v1/integrations/notion", json={
            "database_id": "meeting-notes-db",
            "meeting_title": "Architecture Sync: No-Bot & pgvector",
            "notes_markdown": "# Summary\nAll tasks completed.",
            "participants": ["Me", "Sam"]
        })
        assert notion_res.status_code == 200
        assert "notion-page" in notion_res.json()["notion_page_id"]

        jira_res = await ac.post("/api/v1/integrations/jira", json={
            "project_key": "OVS",
            "summary": "Fix database migration",
            "description": "Details from action item",
            "assignee": "Me"
        })
        assert jira_res.status_code == 200
        assert jira_res.json()["ticket_key"] == "OVS-104"

        # 9. Security & PII Masking (Phase 4)
        pii_res = await ac.post("/api/v1/security/mask-pii", json={
            "text": "User card: 4111 2222 3333 4444, password: secretToken1234, phone: 800-555-0199"
        })
        assert pii_res.status_code == 200
        masked_data = pii_res.json()
        assert "[REDACTED_CREDIT_CARD]" in masked_data["masked_text"]
        assert "[REDACTED_SECRET]" in masked_data["masked_text"]

        audit_res = await ac.get("/api/v1/security/audit-logs")
        assert audit_res.status_code == 200
        logs = audit_res.json()
        assert len(logs) >= 3
