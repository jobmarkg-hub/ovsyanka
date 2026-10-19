import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, AsyncSessionLocal
from backend.app.models.models import User, Space, Folder, Meeting
from backend.app.core.security import get_password_hash
from backend.app.api import auth, spaces, meetings, calendar, search

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed initial user and spaces if empty
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

            # Seed Spaces
            my_notes = Space(
                workspace_id="ws-malcom-hq",
                name="My notes",
                is_private=True,
                owner_id=user.id
            )
            it_core = Space(
                workspace_id="ws-malcom-hq",
                name="IT Core",
                is_private=False,
                owner_id=user.id
            )
            db.add_all([my_notes, it_core])
            await db.flush()

            # Seed Demo Meeting
            demo_meeting = Meeting(
                title="Demo meeting",
                owner_id=user.id,
                raw_user_notes="# What Granola Is\n- AI meeting notes tool combining transcript capture with manual notes\n- Produces enhanced notes automatically",
                ai_summary={
                    "text": "# What Granola Is\n- **AI meeting notes workspace** combining non-intrusive local audio transcript capture with manual user notes [02:40 - 08:20]",
                    "is_enhanced": True
                },
                transcript=[
                    {
                        "id": "c1",
                        "speaker": "Sam Stephenson",
                        "channel": 1,
                        "startMs": 2400,
                        "endMs": 8200,
                        "text": "Granola is an AI meeting notes tool combining transcript capture with manual notes."
                    }
                ],
                duration_seconds=185
            )
            db.add(demo_meeting)
            await db.commit()

    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.app.api import auth, spaces, meetings, calendar, search, templates, integrations, security

# Inside routers section
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(spaces.router, prefix=settings.API_V1_STR)
app.include_router(meetings.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(search.router, prefix=settings.API_V1_STR)
app.include_router(templates.router, prefix=settings.API_V1_STR)
app.include_router(integrations.router, prefix=settings.API_V1_STR)
app.include_router(security.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "healthy",
        "docs": "/docs"
    }
