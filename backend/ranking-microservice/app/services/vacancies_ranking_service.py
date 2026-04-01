from __future__ import annotations

import asyncio
import json
from dataclasses import dataclass, field
from uuid import UUID
from typing import Any
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.schemas.postgres_vacancy import (
    Vacancy as VacancyResponse,
    VacanciesByUserResponse,
)

from app.config import settings
from app.prompts.ranking_prompt import (
    VACANCIES_RANK_PROMPT,
    CV_VACANCY_RANK_USER_TEMPLATE,
    SENIORITY_RULES_PROMPT,
    ADVICE_RULES_PROMPT
)
from app.schemas import RankingResponse, VacancyFromIndex
from app.utils import strip_html_to_text

from app.services.vector_store_service import (
    get_cv_profile_text_and_skills_from_pinecone,
    get_index_vacancies_from_pinecone,
    unknown_listing_created_at,
)


@dataclass
class VacancyRankingRow:

    vacancy: VacancyFromIndex
    match_score: int | None = None
    advice: str | None = None
    tech_score: int | None = None
    seniority_score: int | None = None
    other_score: int | None = None
    domain_score: int | None = None
    aligned_skills: list[str] = field(default_factory=list)
    not_aligned_skills: list[str] = field(default_factory=list)
    summary: str | None = None

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
            "advice": self.advice,
            "tech_score": self.tech_score,
            "seniority_score": self.seniority_score,
            "other_score": self.other_score,
            "domain_score": self.domain_score,
            "aligned_skills": self.aligned_skills,
            "not_aligned_skills": self.not_aligned_skills,
            "summary": self.summary,
        }

def _vacancy_block(v: VacancyFromIndex, cv_skills: list[str]) -> str:
    plain_summary = strip_html_to_text(v.summary or "")
    company = v.company or "(unknown)"
    vacancy_skills_raw = (v.meta_data or {}).get("skills")
    vacancy_skills = _normalize_skills_from_metadata(vacancy_skills_raw)

    cv_skill_lowercase = {s.lower() for s in cv_skills}
    aligned = sorted({s for s in vacancy_skills if s.lower() in cv_skill_lowercase})
    not_aligned = sorted({s for s in vacancy_skills if s.lower() not in cv_skill_lowercase})

    json_formatted = """
    {{
        "vacancy_id": "{vacancy_id}",
        "title": "{title}",
        "company": "{company}",
        "summary": "{summary}",
        "aligned_skills": {aligned_skills},
        "not_aligned_skills": {not_aligned_skills}
    }},
    """

    return json_formatted.format(
        vacancy_id=v.id,
        title=v.title or "(untitled)",
        company=company,
        summary=plain_summary,
        skills=json.dumps(vacancy_skills),
        aligned_skills=json.dumps(aligned),
        not_aligned_skills=json.dumps(not_aligned),
    )


def _get_ranking_data_llm(cv_text: str, cv_skills: list[str], vacancies_from_index: list[VacancyFromIndex]) -> RankingResponse:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")

    llm = ChatGroq(
        model=settings.groq_chat_model,
        api_key=settings.groq_api_key,
        temperature=0,
        response_format={"type": "json_object"},
    )

    blocks = "\n".join(_vacancy_block(vacancy_from_index, cv_skills) for vacancy_from_index in vacancies_from_index)

    cv_plane_text = strip_html_to_text(cv_text)

    cv_and_vacancies_list_prompt = CV_VACANCY_RANK_USER_TEMPLATE.format(
        cv_text=cv_plane_text,
        vacancy_blocks=blocks,
    )

    print('--------------------------------')
    print(VACANCIES_RANK_PROMPT)
    print(cv_and_vacancies_list_prompt)
    print('--------------------------------')

    raw = llm.invoke(
        [
            SystemMessage(content=VACANCIES_RANK_PROMPT),
            SystemMessage(content=SENIORITY_RULES_PROMPT),
            SystemMessage(content=ADVICE_RULES_PROMPT),
            HumanMessage(content=cv_and_vacancies_list_prompt),
        ]
    )

    data = json.loads(raw.content)
    return RankingResponse.model_validate(data)


def _opt_score(v: int | None) -> int | None:
    if v is None:
        return None
    return max(0, min(100, int(v)))


def _normalize_skills_from_metadata(raw: Any) -> list[str]:
    """Normalize skills field from vacancy metadata into a flat list of strings."""
    if raw is None:
        return []
    if isinstance(raw, list):
        return [str(s).strip() for s in raw if s is not None and str(s).strip()]
    if isinstance(raw, str) and raw.strip():
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                return [str(s).strip() for s in parsed if str(s).strip()]
        except json.JSONDecodeError:
            # Fall back to treating raw string as a single skill
            return [raw.strip()]
    return []


def _merge_ranking(
    vacancies_from_index: list[VacancyFromIndex],
    ranking_data_llm: RankingResponse,
    cv_skills: list[str],
) -> list[VacancyRankingRow]:
    by_id: dict[str, VacancyFromIndex] = {str(r.id): r for r in vacancies_from_index}
    seen: set[str] = set()
    result: list[VacancyRankingRow] = []

    cv_skill_lowercase = {s.lower() for s in cv_skills}

    for item in ranking_data_llm.rankings:
        key = item.vacancy_id
        if key and key in by_id and key not in seen:
            vacancy = by_id[key]

            advice = (item.advice or "").strip() or None
            seniority_score = item.seniority_score
            other_score = item.other_score
            domain_score = item.domain_score
            summary = item.summary
            # Compute aligned / not-aligned skills based on CV vs vacancy metadata
            vacancy_skills_raw = (vacancy.meta_data or {}).get("skills")
            vacancy_skills = _normalize_skills_from_metadata(vacancy_skills_raw)

            aligned = sorted({s for s in vacancy_skills if s.lower() in cv_skill_lowercase})
            not_aligned = sorted({s for s in vacancy_skills if s.lower() not in cv_skill_lowercase})

            tech_score = round((len(aligned) / (len(aligned) + len(not_aligned))) * 100)
            match_score = round((tech_score + seniority_score + other_score) / (3 if other_score else 2))

            result.append(
                VacancyRankingRow(
                    vacancy=vacancy,
                    match_score=match_score,
                    advice=advice,
                    tech_score=tech_score,
                    seniority_score=seniority_score,
                    other_score=other_score,
                    domain_score=domain_score,
                    aligned_skills=aligned,
                    not_aligned_skills=not_aligned,
                    summary=summary,
                )
            )
            seen.add(key)

    return result


async def rank_vacancies_by_cv(
    cv_text: str,
    cv_skills: list[str],
    vacancies_from_index: list[VacancyFromIndex],
) -> list[VacancyRankingRow]:
    if not vacancies_from_index:
        return []

    result_llm = await asyncio.to_thread(_get_ranking_data_llm, cv_text, cv_skills, vacancies_from_index)
    if result_llm is None:
        raise RuntimeError("Ranking returned empty result")

    merged = _merge_ranking(vacancies_from_index, result_llm, cv_skills)
    return merged


async def get_vacancies_by_user_id(user_id: UUID) -> VacanciesByUserResponse:
    cv_text, cv_skills = await get_cv_profile_text_and_skills_from_pinecone(user_id)
    if not cv_text:
        return VacanciesByUserResponse(vacancies=[])
        
    pinecone_rows = await get_index_vacancies_from_pinecone(user_id, cv_text=cv_text)
    vacancies_from_index = [row.vacancy for row in pinecone_rows]

    if not vacancies_from_index:
        return VacanciesByUserResponse(vacancies=[])

    try:
        rows_out = await rank_vacancies_by_cv(cv_text, cv_skills, vacancies_from_index)
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
                advice=row.advice,
                tech_score=row.tech_score,
                seniority_score=row.seniority_score,
                other_score=row.other_score,
                domain_score=row.domain_score,
                aligned_skills=row.aligned_skills,
                not_aligned_skills=row.not_aligned_skills,
                meta_data=vacancy.meta_data,
            )
        )

    return VacanciesByUserResponse(vacancies=vacancies)