import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    role = Column(String(50), default="member") # super_admin, space_admin, member, guest
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    spaces = relationship("Space", back_populates="owner")
    meetings = relationship("Meeting", back_populates="owner")

class Space(Base):
    __tablename__ = "spaces"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workspace_id = Column(String(36), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    is_private = Column(Boolean, default=False)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="spaces")
    folders = relationship("Folder", back_populates="space", cascade="all, delete-orphan")

class Folder(Base):
    __tablename__ = "folders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    space_id = Column(String(36), ForeignKey("spaces.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    auto_add_keywords = Column(JSON, nullable=True) # list of keyword strings
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    space = relationship("Space", back_populates="folders")
    meetings = relationship("Meeting", back_populates="folder")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    folder_id = Column(String(36), ForeignKey("folders.id", ondelete="SET NULL"), nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    calendar_event_id = Column(String(255), nullable=True, index=True)
    raw_user_notes = Column(Text, nullable=True)
    ai_summary = Column(JSON, nullable=True)
    transcript = Column(JSON, nullable=True) # full transcript with timecodes and channels
    duration_seconds = Column(Integer, default=0)
    audio_s3_key = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="meetings")
    folder = relationship("Folder", back_populates="meetings")
    embeddings = relationship("MeetingEmbedding", back_populates="meeting", cascade="all, delete-orphan")

class MeetingEmbedding(Base):
    __tablename__ = "meeting_embeddings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True) # 1536-dim vector stored as JSON array (or pgvector)
    speaker = Column(String(100), nullable=True)
    timestamp_start = Column(Integer, default=0)

    meeting = relationship("Meeting", back_populates="embeddings")
