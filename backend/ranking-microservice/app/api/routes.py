from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.postgres_vacancy import VacanciesByUserResponse
from app.services import vacancies_ranking_service

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}

@router.get("/rankings", response_model=VacanciesByUserResponse)
async def list_vacancies_by_user(
    user_id: UUID = Query(..., description="Same UUID as CV microservice / client user id"),
) -> VacanciesByUserResponse:
    try:
        return await vacancies_ranking_service.get_vacancies_by_user_id(user_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
