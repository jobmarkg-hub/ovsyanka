from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.models import Space, Folder, User
from backend.app.schemas.schemas import SpaceCreate, SpaceOut, FolderCreate, FolderOut
from backend.app.api.auth import get_current_user

router = APIRouter(prefix="/spaces", tags=["spaces"])

@router.get("", response_model=List[SpaceOut])
async def list_spaces(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Space))
    return [SpaceOut.model_validate(s) for s in result.scalars().all()]

@router.post("", response_model=SpaceOut)
async def create_space(
    space_in: SpaceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    space = Space(
        workspace_id=space_in.workspace_id,
        name=space_in.name,
        is_private=space_in.is_private,
        owner_id=current_user.id
    )
    db.add(space)
    await db.commit()
    await db.refresh(space)
    return SpaceOut.model_validate(space)

@router.get("/{space_id}/folders", response_model=List[FolderOut])
async def list_folders(space_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Folder).where(Folder.space_id == space_id))
    return [FolderOut.model_validate(f) for f in result.scalars().all()]

@router.post("/{space_id}/folders", response_model=FolderOut)
async def create_folder(
    space_id: str,
    folder_in: FolderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    folder = Folder(
        space_id=space_id,
        name=folder_in.name,
        description=folder_in.description,
        auto_add_keywords=folder_in.auto_add_keywords
    )
    db.add(folder)
    await db.commit()
    await db.refresh(folder)
    return FolderOut.model_validate(folder)
