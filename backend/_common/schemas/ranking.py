from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class VacancyFitItem(BaseModel):
    id: str
    vacancy_id: str = Field(..., description="UUID of the vacancy, as given in the prompt")
    match_score: int = Field(
        ...,
        ge=0,
        le=100,
        description="How well the candidate's CV fits this role (skills, seniority, domain)",
    )
    reason: str | None = Field(
        default=None,
        description="Why the candidate's CV fits this role (max 1000 characters)",
    )
    tech_score: int | None = Field(default=None, ge=0, le=100)
    years_score: float | None = Field(default=None, ge=0, le=100)
    other_score: int | None = Field(default=None, ge=0, le=100)
    domain_score: int | None = Field(default=None, ge=0, le=100)
    aligned_skills: list[str] = Field(default_factory=list)
    not_aligned_skills: list[str] = Field(default_factory=list)
    meta_data: dict[str, Any] | None = Field(
        default=None,
        description="Optional metadata echo for the vacancy, as given in the prompt",
    )


class RankingResponse(BaseModel):
    """Best match first; must cover every vacancy id exactly once."""

    rankings: list[VacancyFitItem] = Field(
        ...,
        description="Ordered list from strongest fit to weakest; one entry per vacancy id",
    )