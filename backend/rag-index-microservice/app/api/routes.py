from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas.indexing import (
    VacancyIndexRequest,
    VacancyIndexResponse,
    DeleteVacancyIndexResponse,
    HealthResponse,
)
from app.services import vector_index_service

router = APIRouter(prefix="/vacancies")


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        openai_configured=bool(settings.openai_api_key),
        pinecone_configured=bool(settings.pinecone_api_key and settings.pinecone_index_name),
    )


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
