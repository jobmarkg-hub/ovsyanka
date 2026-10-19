from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth & User
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: Optional[str] = "member"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# Space
class SpaceCreate(BaseModel):
    workspace_id: str
    name: str
    is_private: Optional[bool] = False

class SpaceOut(BaseModel):
    id: str
    workspace_id: str
    name: str
    is_private: bool
    owner_id: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Folder
class FolderCreate(BaseModel):
    space_id: str
    name: str
    description: Optional[str] = None
    auto_add_keywords: Optional[List[str]] = []

class FolderOut(BaseModel):
    id: str
    space_id: str
    name: str
    description: Optional[str] = None
    auto_add_keywords: Optional[List[str]] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Meeting
class TranscriptChunk(BaseModel):
    id: str
    speaker: str
    channel: int
    startMs: int
    endMs: int
    text: str

class MeetingCreate(BaseModel):
    title: str
    folder_id: Optional[str] = None
    calendar_event_id: Optional[str] = None
    raw_user_notes: Optional[str] = ""
    transcript: Optional[List[TranscriptChunk]] = []
    duration_seconds: Optional[int] = 0

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    folder_id: Optional[str] = None
    raw_user_notes: Optional[str] = None
    transcript: Optional[List[TranscriptChunk]] = None
    duration_seconds: Optional[int] = None
    ai_summary: Optional[Dict[str, Any]] = None

class MeetingOut(BaseModel):
    id: str
    title: str
    folder_id: Optional[str] = None
    owner_id: Optional[str] = None
    calendar_event_id: Optional[str] = None
    raw_user_notes: Optional[str] = None
    ai_summary: Optional[Dict[str, Any]] = None
    transcript: Optional[List[Dict[str, Any]]] = None
    duration_seconds: Optional[int] = 0
    audio_s3_key: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Calendar & Briefing
class CalendarEvent(BaseModel):
    id: str
    title: str
    start_time: str
    end_time: str
    participants: List[str]
    description: Optional[str] = None
    conference_link: Optional[str] = None
    source: str = "Google Calendar"

class PreMeetingBriefingResponse(BaseModel):
    event_id: str
    event_title: str
    participants: List[str]
    briefing_summary: str
    previous_commitments: List[str]
    related_meeting_ids: List[str]

# RAG Search
class SearchRequest(BaseModel):
    query: str
    space_id: Optional[str] = None
    limit: Optional[int] = 5

class SearchResultItem(BaseModel):
    meeting_id: str
    meeting_title: str
    chunk_text: str
    speaker: Optional[str] = None
    timestamp_start: Optional[int] = None
    score: float

class SearchResponse(BaseModel):
    answer: str
    sources: List[SearchResultItem]
