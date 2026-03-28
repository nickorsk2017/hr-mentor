from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Query

from app.config import settings
from app.services.proxy_service import forward_json

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@router.put("/cvs")
async def upsert_cv(body: dict[str, Any] = Body(...)) -> Any:
    return await forward_json(
        method="PUT",
        base_url=settings.cv_microservice_url,
        path="/cvs",
        json_body=body,
    )


@router.get("/cvs/{cv_id}")
async def get_cv(cv_id: UUID) -> Any:
    return await forward_json(
        method="GET",
        base_url=settings.cv_microservice_url,
        path=f"/cvs/{cv_id}",
    )


@router.post("/vacancies")
async def create_vacancy(body: dict[str, Any] = Body(...)) -> Any:
    return await forward_json(
        method="POST",
        base_url=settings.vacancy_microservice_url,
        path="/vacancies",
        json_body=body,
    )


@router.put("/vacancies/{vacancy_id}")
async def update_vacancy(vacancy_id: UUID, body: dict[str, Any] = Body(...)) -> Any:
    return await forward_json(
        method="PUT",
        base_url=settings.vacancy_microservice_url,
        path=f"/vacancies/{vacancy_id}",
        json_body=body,
    )


@router.get("/vacancies")
async def get_vacancies(user_id: UUID = Query(...)) -> Any:
    return await forward_json(
        method="GET",
        base_url=settings.vacancy_microservice_url,
        path="/vacancies",
        params={"user_id": str(user_id)},
    )


@router.delete("/vacancies/{vacancy_id}")
async def delete_vacancy(vacancy_id: UUID, user_id: UUID = Query(...)) -> Any:
    return await forward_json(
        method="DELETE",
        base_url=settings.vacancy_microservice_url,
        path=f"/vacancies/{vacancy_id}",
        params={"user_id": str(user_id)},
    )


@router.get("/rankings/health")
async def ranking_health() -> Any:
    return await forward_json(
        method="GET",
        base_url=settings.ranking_microservice_url,
        path="/rankings/health",
    )


@router.get("/rankings")
async def list_rankings(user_id: UUID = Query(...)) -> Any:
    return await forward_json(
        method="GET",
        base_url=settings.ranking_microservice_url,
        path="/rankings",
        params={"user_id": str(user_id)},
    )


@router.get("/vacancies/health")
async def rag_index_health() -> Any:
    return await forward_json(
        method="GET",
        base_url=settings.rag_index_microservice_url,
        path="/vacancies/health",
)


@router.post("/vacancies/index")
async def index_vacancy(body: dict[str, Any] = Body(...)) -> Any:
    return await forward_json(
        method="POST",
        base_url=settings.rag_index_microservice_url,
        path="/vacancies/index",
        json_body=body,
    )


@router.delete("/vacancies/index/{vacancy_id}")
async def delete_vacancy_index(vacancy_id: str) -> Any:
    return await forward_json(
        method="DELETE",
        base_url=settings.rag_index_microservice_url,
        path=f"/vacancies/index/{vacancy_id}",
    )
