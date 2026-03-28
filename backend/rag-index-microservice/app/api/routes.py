from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from _common.schemas.vacancy_index import (
    CvIndexPayload,
    CvIndexResponse,
    DeleteCvIndexResponse,
    DeleteVacancyIndexResponse,
    VacancyIndexPayload,
    VacancyIndexResponse,
)
from app.services import cv_vector_index_service, vacancy_vector_index_service

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}

async def _upsert_cv_index(payload: CvIndexPayload) -> CvIndexResponse:
    try:
        return await cv_vector_index_service.add_to_index(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while indexing: {type(e).__name__}: {e}",
        ) from e


@router.patch("/cv/index", response_model=CvIndexResponse)
async def upsert_cv_to_index_patch(payload: CvIndexPayload) -> CvIndexResponse:
    return await _upsert_cv_index(payload)


@router.delete("/cv/index", response_model=DeleteCvIndexResponse)
async def delete_cv_from_index(
    user_id: str = Query(..., min_length=1),
) -> DeleteCvIndexResponse:
    try:
        return await cv_vector_index_service.delete_cv_index(user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while deleting from index: {type(e).__name__}: {e}",
        ) from e


@router.patch("/vacancies/index", response_model=VacancyIndexResponse)
async def add_vacancy_to_index(body: VacancyIndexPayload) -> VacancyIndexResponse:
    try:
        return await vacancy_vector_index_service.add_vacancy_to_index(body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while indexing: {type(e).__name__}: {e}",
        ) from e


@router.delete("/vacancies/index/{vacancy_id}", response_model=DeleteVacancyIndexResponse)
async def delete_vacancy_from_index_endpoint(vacancy_id: str) -> DeleteVacancyIndexResponse:
    try:
        return await vacancy_vector_index_service.delete_vacancy_index(vacancy_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while deleting from index: {type(e).__name__}: {e}",
        ) from e
