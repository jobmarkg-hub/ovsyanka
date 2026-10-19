from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.database import get_db
from backend.app.schemas.schemas import SearchRequest, SearchResponse
from backend.app.services.vector_service import vector_service

router = APIRouter(prefix="/search", tags=["search"])

@router.post("/rag", response_model=SearchResponse)
async def semantic_rag_search(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Cross-Meeting Search (RAG по всей компании):
    Performs vector similarity search across all meetings,
    identifying exact quotes and returning source citations.
    """
    return await vector_service.search(
        query=request.query,
        db=db,
        limit=request.limit or 5
    )
