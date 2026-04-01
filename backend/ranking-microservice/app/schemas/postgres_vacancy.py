from __future__ import annotations

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class VacancyStageItem(BaseModel):
    id: UUID
    name: str
    status: str
    notes: str = ""


class Vacancy(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    company: str | None = None
    summary: str | None = None
    created_at: datetime
    planned_stages: int
    stages: list[VacancyStageItem] = Field(default_factory=list)
    match_score: int | None = Field(
        None,
        ge=0,
        le=100,
        description="OpenAI CV–vacancy fit when a CV exists in DB; null if no CV or not LLM-ranked",
    )
    advice: str | None = Field(
        default=None,
        description="Optional LLM explanation for the assigned match score.",
    )
    tech_score: int | None = Field(default=None, ge=0, le=100)
    seniority_score: int | None = Field(default=None, ge=0, le=100)
    other_score: int | None = Field(default=None, ge=0, le=100)
    domain_score: int | None = Field(default=None, ge=0, le=100)
    aligned_skills: list[str] = Field(default_factory=list)
    not_aligned_skills: list[str] = Field(default_factory=list)
    meta_data: dict[str, Any] | None = Field(
        default=None,
        description="Parsed Pinecone vacancy payload (from `meta_data` JSON or legacy flat metadata).",
    )


class VacanciesByUserResponse(BaseModel):
    vacancies: list[Vacancy]
