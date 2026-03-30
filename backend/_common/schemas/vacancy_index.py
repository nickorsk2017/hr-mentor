from __future__ import annotations

from typing import Any
from typing import Self
from pydantic import BaseModel, Field, model_validator
from _common.schemas.vacancy import VacancyStagePayload
from dataclasses import dataclass, field
from uuid import UUID
from typing import Any

@dataclass
class VacancyFromIndex:

    id: UUID
    user_id: UUID
    title: str
    company: str | None
    summary: str
    meta_data: dict[str, Any]
    reason: str | None = None


class VacancyIndexPayload(BaseModel):
    """Vacancy payload: description is embedded after LLM extraction."""

    user_id: str = Field(..., min_length=1, description="Client user id (same as CV microservice)")
    vacancy_id: str = Field(..., min_length=1, description="Stable id, e.g. vacancy UUID")
    title: str = Field("", max_length=512)
    company: str | None = Field(None, max_length=512)
    stages: list[VacancyStagePayload] = Field(default_factory=list)
    description: str = Field(
        ...,
        min_length=1,
        description="Job description (plain text or HTML)",
    )


class VacancyIndexResponse(BaseModel):
    vacancy_id: str
    dimensions: int
    namespace: str
    summary: str = Field(
        ...,
        description="Embedded text (LLM summary).",
    )
    extracted: dict[str, Any]


class CvIndexPayload(BaseModel):
    """User CV profile for Pinecone (id must match user_id)."""
    user_id: str = Field(..., min_length=1, description="User id")
    cv_text:  str = Field(..., min_length=1, description="CV text")


class CvIndexResponse(BaseModel):
    id: str
    user_id: str
    skills: list[str]
    summary: str
    years_expereance: float
    vector_id: str
    dimensions: int
    namespace: str


class DeleteCvIndexResponse(BaseModel):
    user_id: str
    vector_id: str
    deleted: bool = True
    namespace: str

class DeleteVacancyIndexResponse(BaseModel):
    vacancy_id: str
    deleted: bool = True
    namespace: str