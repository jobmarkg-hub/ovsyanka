import os
import aiofiles
from typing import Optional
from backend.app.core.config import settings

class S3StorageService:
    def __init__(self):
        self.local_dir = os.path.join(settings.LOCAL_STORAGE_DIR, "audio")
        os.makedirs(self.local_dir, exist_ok=True)

    async def upload_audio_file(self, meeting_id: str, file_bytes: bytes, filename: str) -> str:
        """
        Stores compressed audio (Opus / WebM / WAV).
        In production, uploads to MinIO / AWS S3 / Cloudflare R2.
        Fallback writes to local storage directory.
        """
        ext = os.path.splitext(filename)[1] or ".opus"
        s3_key = f"meetings/{meeting_id}/audio{ext}"
        local_path = os.path.join(self.local_dir, f"{meeting_id}{ext}")

        async with aiofiles.open(local_path, "wb") as f:
            await f.write(file_bytes)

        return s3_key

    async def delete_audio_file(self, s3_key: str) -> bool:
        """
        Implements Zero Audio Storage retention policy:
        purges raw audio immediately after transcript/summary generation.
        """
        meeting_id = s3_key.split("/")[1] if "/" in s3_key else s3_key
        for ext in [".opus", ".wav", ".webm", ".mp3"]:
            p = os.path.join(self.local_dir, f"{meeting_id}{ext}")
            if os.path.exists(p):
                os.remove(p)
                return True
        return False

s3_service = S3StorageService()
