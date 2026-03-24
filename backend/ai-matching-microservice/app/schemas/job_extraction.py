from __future__ import annotations

from pydantic import BaseModel, Field


class ExtractedJobDescription(BaseModel):
    """Structured output aligned with EXTRACT_JOB_DESCRIPTION_PROMPT."""

    title: str = ""
    skills: list[str] = Field(default_factory=list)
    seniority: str = ""
    role: str = ""
    is_remote: bool = False
    is_full_time: bool = True
    is_part_time: bool = False
    is_contract: bool = False
    location: str = ""
    short_description: str = Field(
        default="",
        description="Job narrative only; no duplicated structured fields",
    )
