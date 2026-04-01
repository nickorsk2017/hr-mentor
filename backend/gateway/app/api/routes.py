from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Query

from app.config import settings
from _common.schemas.vacancy_index import CvIndexPayload
from _common.schemas.vacancy import (
    CreateVacancyRequest,
    UpdateVacancyRequest,
    DeleteVacancyResponse,
    VacancyResponse,
    VacanciesResponse,
)
from _common.schemas.vacancy_index import (
    VacancyIndexPayload,
    VacancyIndexResponse,
)

from app.services.proxy_service import forward_json
from app.services.rabbitmq_publisher import publish_cv_index, publish_vacancy_index

router = APIRouter()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}


@router.put("/cvs")
async def upsert_cv(payload: CvIndexPayload) -> Any:
    cv_response = await forward_json(
        method="PUT",
        base_url=settings.cv_microservice_url,
        path="/cvs",
        json_body=payload.model_dump(mode="json"),
    )

    # add CV to index asynchronously via RabbitMQ broker
    await publish_cv_index(payload)

    return cv_response


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


@router.patch("/vacancies/{vacancy_id}")
async def update_vacancy(vacancy_id: UUID, payload: UpdateVacancyRequest) -> Any:
    payload_dict = payload.model_dump(mode="json")
    payload_dict.update({"vacancy_id": str(vacancy_id)})

    # Re-index vacancy after update asynchronously via RabbitMQ broker.
    await publish_vacancy_index(payload_dict)

    return await forward_json(
        method="PATCH",
        base_url=settings.vacancy_microservice_url,
        path=f"/vacancies/{vacancy_id}",
        json_body=payload_dict,
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


@router.patch("/vacancies/index")
async def index_vacancy(body: VacancyIndexPayload) -> Any:
    return await forward_json(
        method="PATCH",
        base_url=settings.rag_index_microservice_url,
        path="/vacancies/index",
        json_body=body,
    )


@router.patch("/cv/index")
async def index_cv(payload: CvIndexPayload) -> Any:
    return await forward_json(
        method="PATCH",
        base_url=settings.rag_index_microservice_url,
        path="/cv/index",
        json_body=payload.model_dump(mode="json"),
    )


@router.delete("/cv/index")
async def delete_cv_index(
    user_id: str = Query(..., description="Client user id"),
) -> Any:
    return await forward_json(
        method="DELETE",
        base_url=settings.rag_index_microservice_url,
        path="/cv/index",
        params={"user_id": user_id},
    )


@router.delete("/vacancies/index/{vacancy_id}")
async def delete_vacancy_index(vacancy_id: str) -> Any:
    return await forward_json(
        method="DELETE",
        base_url=settings.rag_index_microservice_url,
        path=f"/vacancies/index/{vacancy_id}",
    )
