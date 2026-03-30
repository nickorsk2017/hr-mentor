from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class VacancyStagePayload(BaseModel):
    id: UUID
    name: str
    status: str
    notes: str = ""


class CreateVacancyRequest(BaseModel):
    user_id: UUID
    title: str
    company: str | None = None
    description: str = ""
    planned_stages: int = 1
    stages: list[VacancyStagePayload] = Field(default_factory=list)


class UpdateVacancyRequest(BaseModel):
    user_id: UUID
    title: str
    company: str | None = None
    description: str = ""
    planned_stages: int = 1
    stages: list[VacancyStagePayload] = Field(default_factory=list)


class VacancyResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    company: str | None = None
    description: str
    created_at: datetime
    planned_stages: int
    stages: list[VacancyStagePayload] = Field(default_factory=list)


class GetVacanciesRequest(BaseModel):
    user_id: UUID


class VacanciesResponse(BaseModel):
    vacancies: list[VacancyResponse]


class DeleteVacancyResponse(BaseModel):
    id: UUID
    deleted: bool = True
