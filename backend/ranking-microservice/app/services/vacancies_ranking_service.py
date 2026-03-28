from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from app.models import CVModel
from app.db.session import SessionLocal
from uuid import UUID
from typing import Any
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from sqlalchemy import select

from app.schemas.postgres_vacancy import (
    Vacancy as VacancyResponse,
    VacanciesByUserResponse,
)

from app.config import settings
from app.prompts.ranking_prompt import (
    CV_VACANCY_RANK_SYSTEM,
    CV_VACANCY_RANK_USER_TEMPLATE,
)
from app.schemas import RankingResponse
from app.utils import strip_html_to_text

from app.services.vector_store_service import (
    list_user_vacancies_from_pinecone,
    unknown_listing_created_at,
)


@dataclass
class VacancyRankingRow:
    """One ranked vacancy: Pinecone input plus LLM scores (replaces nested tuples)."""

    vacancy: VacancyFromIndex
    match_score: int
    reason: str | None = None
    tech_score: int | None = None
    years_score: int | None = None
    other_score: int | None = None
    domain_score: int | None = None
    aligned_skills: list[str] = field(default_factory=list)
    not_aligned_skills: list[str] = field(default_factory=list)

    def model_dump(self) -> dict[str, object]:
        """JSON-friendly dict for logging or APIs."""
        v = self.vacancy
        return {
            "vacancy_id": str(v.id),
            "user_id": str(v.user_id),
            "title": v.title,
            "company": v.company,
            "summary": v.summary,
            "meta_data": v.meta_data,
            "match_score": self.match_score,
            "reason": self.reason,
            "tech_score": self.tech_score,
            "years_score": self.years_score,
            "other_score": self.other_score,
            "domain_score": self.domain_score,
            "aligned_skills": self.aligned_skills,
            "not_aligned_skills": self.not_aligned_skills,
        }

def _vacancy_block(v: VacancyFromIndex) -> str:
    plain = strip_html_to_text(v.summary or "")
    company = v.company or "(unknown)"
    skills = v.meta_data.get("skills", [])

    return (
        f"- id: {v.id}\n"
        f"- title: {v.title or '(untitled)'}\n"
        f"- company: {company}\n"
        f"- summary:\n{plain or '(empty)'}\n"
        f"- skills: {json.dumps(skills, indent=2)}\n"
    )


def _get_ranking_data_llm(cv_text: str, vacancies_from_index: list[VacancyFromIndex]) -> RankingResponse:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.openai_api_key,
        temperature=0,
        response_format={"type": "json_object"},
    )

    blocks = "\n".join(_vacancy_block(vacancy_from_index) for vacancy_from_index in vacancies_from_index)

    cv_plane_text = strip_html_to_text(cv_text)

    cv_and_vacancies_list_prompt = CV_VACANCY_RANK_USER_TEMPLATE.format(
        cv_text=cv_plane_text,
        vacancy_blocks=blocks,
    )

    raw = llm.invoke(
        [
            SystemMessage(content=CV_VACANCY_RANK_SYSTEM),
            HumanMessage(content=cv_and_vacancies_list_prompt),
        ]
    )

    data = json.loads(raw.content)
    print(data, 'data')
    return RankingResponse.model_validate(data)


def _opt_score(v: int | None) -> int | None:
    if v is None:
        return None
    return max(0, min(100, int(v)))


def _merge_ranking(
    vacancies_from_index: list[VacancyFromIndex],
    ranking_data_llm: RankingResponse,
) -> list[VacancyRankingRow]:
    by_id: dict[str, VacancyFromIndex] = {str(r.id): r for r in vacancies_from_index}
    seen: set[str] = set()
    result: list[VacancyRankingRow] = []

    for item in ranking_data_llm.rankings:
        key = item.vacancy_id
        if key and key in by_id and key not in seen:
            score = max(0, min(100, int(item.match_score)))
            reason = (item.reason or "").strip() or None
            tech_score = _opt_score(item.tech_score)
            years_score = _opt_score(item.years_score)
            other_score = _opt_score(item.other_score)
            domain_score = _opt_score(item.domain_score)
            skills = item.aligned_skills
            not_skills = item.not_aligned_skills
            result.append(
                VacancyRankingRow(
                    vacancy=by_id[key],
                    match_score=score,
                    reason=reason,
                    tech_score=tech_score,
                    years_score=years_score,
                    other_score=other_score,
                    domain_score=domain_score,
                    aligned_skills=skills,
                    not_aligned_skills=not_skills,
                )
            )
            seen.add(key)

    return result


async def rank_vacancies_by_cv(
    cv_text: str,
    vacancies_from_index: list[VacancyFromIndex],
) -> list[VacancyRankingRow]:
    """
    Returns rows reordered best match first, with integer match_score per row.
    If ``rows`` is empty, returns [].
    """
    if not vacancies_from_index:
        return []

    result_llm = await asyncio.to_thread(_get_ranking_data_llm, cv_text, vacancies_from_index)
    if result_llm is None:
        raise RuntimeError("OpenAI ranking returned empty result")

    merged = _merge_ranking(vacancies_from_index, result_llm)
    return merged


async def get_vacancies_by_user_id(user_id: UUID) -> VacanciesByUserResponse:
    async with SessionLocal() as db:
        cv_result = await db.execute(
            select(CVModel)
            .where(CVModel.user_id == user_id)
            .order_by(CVModel.created_at.desc())
            .limit(1)
        )
    cv_row = cv_result.scalar_one_or_none()
    cv_text = cv_row.cv_text or None
    if cv_text is None:
        return VacanciesByUserResponse(vacancies=[])

    cv_text = cv_text.strip();
    pinecone_rows = await list_user_vacancies_from_pinecone(user_id, cv_text=cv_text)
    vacancies_from_index = [row.vacancy for row in pinecone_rows]

    if not vacancies_from_index:
        return VacanciesByUserResponse(vacancies=[])

    try:
        rows_out = await rank_vacancies_by_cv(cv_text, vacancies_from_index)
    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Ranking failed: {e}") from e

    vacancies: list[VacancyResponse] = []
    for row in rows_out:
        vacancy = row.vacancy
        vacancies.append(
            VacancyResponse(
                id=vacancy.id,
                user_id=vacancy.user_id,
                title=vacancy.title,
                company=vacancy.company,
                summary=vacancy.summary or None,
                created_at=unknown_listing_created_at(),
                planned_stages=1,
                stages=[],
                match_score=row.match_score,
                reason=row.reason,
                tech_score=row.tech_score,
                years_score=row.years_score,
                other_score=row.other_score,
                domain_score=row.domain_score,
                aligned_skills=row.aligned_skills,
                not_aligned_skills=row.not_aligned_skills,
                meta_data=vacancy.meta_data,
            )
        )

    return VacanciesByUserResponse(vacancies=vacancies)