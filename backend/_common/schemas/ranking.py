from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


class VacancyFitItem(BaseModel):
    id: str
    vacancy_id: str = Field(..., description="UUID of the vacancy, as given in the prompt")
    match_score: float | None = Field(
        ...,
        ge=0,
        le=100,
        description="How well the candidate's CV fits this role (skills, seniority_score, domain)",
    )
    advice: str | None = Field(
        default=None,
        description="Why the candidate's CV fits this role (max 1000 characters)",
    )
    tech_score: float | None = Field(default=None, ge=0, le=100)
    seniority_score: float | None = Field(default=None, ge=0, le=100)
    other_score: float | None = Field(default=None, ge=0, le=100)
    domain_score: float | None = Field(default=None, ge=0, le=100)
    meta_data: dict[str, Any] | None = Field(
        default=None,
        description="Optional metadata echo for the vacancy, as given in the prompt",
    )
    summary: str | None = Field(default=None, description="Summary of the vacancy and the candidate match")

class RankingResponse(BaseModel):
    """Best match first; must cover every vacancy id exactly once."""

    rankings: list[VacancyFitItem] = Field(
        ...,
        description="Ordered list from strongest fit to weakest; one entry per vacancy id",
    )