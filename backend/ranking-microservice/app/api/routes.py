from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.ranking import HealthResponse
from app.schemas.postgres_vacancy import VacanciesByUserResponse
from app.services import vacancies_ranking_service

router = APIRouter(prefix="/rankings")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        openai_configured=bool(settings.openai_api_key),
        pinecone_configured=bool(settings.pinecone_api_key and settings.pinecone_index_name),
    )


@router.get("", response_model=VacanciesByUserResponse)
async def list_vacancies_by_user(
    user_id: UUID = Query(..., description="Same UUID as CV microservice / client user id"),
) -> VacanciesByUserResponse:
    try:
        return await vacancies_ranking_service.get_vacancies_by_user_id(user_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
