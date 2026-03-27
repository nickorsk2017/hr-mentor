from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import select

from ..db.session import SessionLocal
from ..models.vacancy import Vacancy as VacancyModel
from ..schemas.vacancy import (
    CreateVacancyRequest,
    UpdateVacancyRequest,
    DeleteVacancyResponse,
    VacancyResponse,
    VacanciesResponse,
    VacancyStagePayload,
)


def _stages_to_json(stages: list[VacancyStagePayload]) -> list[dict]:
    return [s.model_dump(mode="json") for s in stages]


def _stages_from_json(raw: list | None) -> list[VacancyStagePayload]:
    if not raw:
        return []
    out: list[VacancyStagePayload] = []
    for item in raw:
        if isinstance(item, dict):
            out.append(VacancyStagePayload.model_validate(item))
    return out


def _to_response(vacancy: VacancyModel) -> VacancyResponse:
    return VacancyResponse(
        id=vacancy.id,
        user_id=vacancy.user_id,
        title=vacancy.title,
        company=vacancy.company,
        description=vacancy.description,
        created_at=vacancy.created_at,
        planned_stages=int(vacancy.planned_stages),
        stages=_stages_from_json(vacancy.stages),
    )


async def upsert_vacancy(req: CreateVacancyRequest) -> VacancyResponse:
    async with SessionLocal() as db:
        vacancy = VacancyModel(
            user_id=req.user_id,
            title=req.title,
            company=req.company,
            description=req.description,
            planned_stages=req.planned_stages,
            stages=_stages_to_json(req.stages),
        )
        db.add(vacancy)
        await db.commit()
        await db.refresh(vacancy)

        return _to_response(vacancy)


async def update_vacancy(vacancy_id: UUID, req: UpdateVacancyRequest) -> VacancyResponse | None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(VacancyModel).where(VacancyModel.id == vacancy_id)
        )
        vacancy = result.scalar_one_or_none()
        if vacancy is None:
            return None
        if vacancy.user_id != req.user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        vacancy.title = req.title
        vacancy.company = req.company
        vacancy.description = req.description
        vacancy.planned_stages = req.planned_stages
        vacancy.stages = _stages_to_json(req.stages)

        await db.commit()
        await db.refresh(vacancy)
        return _to_response(vacancy)


async def get_vacancies(user_id: UUID) -> VacanciesResponse:
    async with SessionLocal() as db:
        result = await db.execute(
            select(VacancyModel).where(VacancyModel.user_id == user_id)
        )
        vacancies = result.scalars().all()

        return VacanciesResponse(
            vacancies=[_to_response(vacancy) for vacancy in vacancies]
        )


async def delete_vacancy(vacancy_id: UUID, user_id: UUID) -> DeleteVacancyResponse | None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(VacancyModel).where(VacancyModel.id == vacancy_id)
        )
        vacancy = result.scalar_one_or_none()
        if vacancy is None:
            return None
        if vacancy.user_id != user_id:
            raise HTTPException(status_code=403, detail="Forbidden")

        await db.delete(vacancy)
        await db.commit()
        return DeleteVacancyResponse(id=vacancy_id, deleted=True)
