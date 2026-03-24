from __future__ import annotations

from fastapi import APIRouter

from ..config import settings
from ..schemas.matching import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        openai_configured=bool(settings.openai_api_key),
        pinecone_configured=bool(settings.pinecone_api_key and settings.pinecone_index_name),
        ollama_base_url=settings.ollama_base_url,
        ollama_model=settings.ollama_model,
    )
