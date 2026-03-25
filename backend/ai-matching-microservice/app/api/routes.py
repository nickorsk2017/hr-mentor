from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query

from app.config import settings
from app.schemas.matching import (
    VacancyIndexRequest,
    VacancyIndexResponse,
    DeleteVacancyIndexResponse,
    HealthResponse,
)
from app.schemas.postgres_vacancy import VacanciesByUserResponse
from app.services import vector_index_service
from app.services import postgres_vacancy_service

router = APIRouter(prefix="/v1/vacancies")


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
        return await postgres_vacancy_service.get_vacancies_by_user_id(user_id)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e


@router.post("/index", response_model=VacancyIndexResponse)
async def add_vacancy_to_index(body: VacancyIndexRequest) -> VacancyIndexResponse:
    try:
        return await vector_index_service.add_to_index(body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while indexing: {type(e).__name__}: {e}",
        ) from e


@router.delete("/index/{vacancy_id}", response_model=DeleteVacancyIndexResponse)
async def delete_vacancy_from_index_endpoint(vacancy_id: str) -> DeleteVacancyIndexResponse:
    try:
        return await vector_index_service.delete_vacancy_index(vacancy_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while deleting from index: {type(e).__name__}: {e}",
        ) from e
