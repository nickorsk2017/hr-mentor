from __future__ import annotations

from uuid import UUID

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.cv import CV as CVModel
from app.schemas.postgres_vacancy import (
    VacancyRowResponse,
    VacanciesByUserResponse,
)
from app.services.cv_vacancy_ranking_service import rank_vacancies_by_cv
from app.services.pinecone_user_vacancies_service import (
    list_user_vacancies_from_pinecone,
    unknown_listing_created_at,
)
from app.services.vacancy_rank_input import VacancyRankInput


def _to_row_from_rank(
    v: VacancyRankInput,
    match_score: int | None,
    reason: str | None = None,
    *,
    tech_score: int | None = None,
    years_score: int | None = None,
    other_score: int | None = None,
    domain_score: int | None = None,
    aligned_skills: list[str] | None = None,
    not_aligned_skills: list[str] | None = None,
) -> VacancyRowResponse:
    skills = aligned_skills if aligned_skills is not None else []
    not_skills = not_aligned_skills if not_aligned_skills is not None else []

    return VacancyRowResponse(
        id=v.id,
        user_id=v.user_id,
        title=v.title,
        company=v.company,
        summary=v.summary,
        created_at=unknown_listing_created_at(),
        planned_stages=1,
        stages=[],
        match_score=match_score,
        reason=reason,
        tech_score=tech_score,
        years_score=years_score,
        other_score=other_score,
        domain_score=domain_score,
        aligned_skills=skills,
        not_aligned_skills=not_skills,
        meta_data=v.meta_data,
    )


async def get_vacancies_by_user_id(user_id: UUID) -> VacanciesByUserResponse:
    async with SessionLocal() as db:
        cv_result = await db.execute(
            select(CVModel)
            .where(CVModel.user_id == user_id)
            .order_by(CVModel.created_at.desc())
            .limit(1)
        )
        cv_row = cv_result.scalar_one_or_none()
        cv_text = (cv_row.cv_text if cv_row else "") or ""

    embed_query = cv_text.strip() or "general professional job opportunities"
    pinecone_rows = await list_user_vacancies_from_pinecone(user_id, embed_query)
    rank_inputs = [item for item, _ in pinecone_rows]

    if not rank_inputs:
        return VacanciesByUserResponse(vacancies=[])

    try:
        ranked = await rank_vacancies_by_cv(cv_text, rank_inputs)
    except RuntimeError:
        raise
    except Exception as e:
        raise RuntimeError(f"Ranking failed: {e}") from e

    return VacanciesByUserResponse(
        vacancies=[
            _to_row_from_rank(
                v,
                score,
                why,
                tech_score=ts,
                years_score=ys,
                other_score=os_,
                domain_score=ds,
                aligned_skills=skills,
                not_aligned_skills=not_skills,
            )
            for v, score, why, ts, ys, os_, ds, skills, not_skills in ranked
        ],
    )
