from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class VacancyIndexRequest(BaseModel):
    """Vacancy payload: description is embedded after LLM extraction."""

    user_id: str = Field(..., min_length=1, description="Client user id (same as CV microservice)")
    vacancy_id: str = Field(..., min_length=1, description="Stable id, e.g. vacancy UUID")
    title: str = Field("", max_length=512)
    company: str | None = Field(None, max_length=512)
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
        description="Stored in Pinecone metadata `text` (LLM short_description).",
    )
    extracted: dict[str, Any]


class DeleteVacancyIndexResponse(BaseModel):
    vacancy_id: str
    deleted: bool = True
    namespace: str


class HealthResponse(BaseModel):
    status: str
    service: str
    openai_configured: bool
    pinecone_configured: bool
