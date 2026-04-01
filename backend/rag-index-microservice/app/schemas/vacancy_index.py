from __future__ import annotations

from pydantic import BaseModel, Field


class VacancyIndexRecord(BaseModel):
    """Structured output aligned with EXTRACT_JOB_DESCRIPTION_PROMPT."""

    title: str = ""
    skills: list[str] = Field(default_factory=list)
    seniority_score: str = ""
    role: str = ""
    is_remote: bool = False
    is_full_time: bool = True
    is_part_time: bool = False
    is_contract: bool = False
    location: str = ""
    salary_range: str = ""
    benefits: list[str] = Field(default_factory=list)
    field: str = ""
    company_size: str = ""
    company_type: str = ""
    company_industry: str = ""
    company_location: str = ""
    company_website: str = ""
    summary: str = Field(
        default="",
        description="""SHORT_DESCRIPTION MUST DESCRIBE ABOUT COMPANY, TEAM, RESPONSIBILITIES, BENEFITS, APPROACHES, WHAT IS IMPORTANT.
SHORT_DESCRIPTION SHOULD BE 8-10 SENTENCES.""",
    )
