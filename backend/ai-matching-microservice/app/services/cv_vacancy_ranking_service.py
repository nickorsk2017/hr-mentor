from __future__ import annotations

import asyncio
import json
import uuid

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

from app.config import settings
from app.prompts.cv_vacancy_ranking import (
    CV_VACANCY_RANK_SYSTEM,
    CV_VACANCY_RANK_USER_TEMPLATE,
)
from app.schemas.cv_vacancy_ranking import CVVacancyRankingResult
from app.services.text_utils import strip_html_to_text
from app.services.vacancy_rank_input import VacancyRankInput

_MAX_CV_CHARS = 14_000
_MAX_DESC_CHARS = 1_200
_MAX_VACANCIES_PER_LLM_CALL = 40


def _truncate(s: str, max_len: int) -> str:
    s = s.strip()
    if len(s) <= max_len:
        return s
    return s[: max_len - 1].rstrip() + "…"


def _vacancy_block(v: VacancyRankInput) -> str:
    plain = strip_html_to_text(v.summary or "")
    plain = _truncate(plain, _MAX_DESC_CHARS)
    company = v.company or "(unknown)"
    skills = v.meta_data.get("skills", [])

    return (
        f"- id: {v.id}\n"
        f"- title: {v.title or '(untitled)'}\n"
        f"- company: {company}\n"
        f"- summary:\n{plain or '(empty)'}\n"
        f"- skills: {json.dumps(skills, indent=2)}\n"
    )


def _rank_sync(cv_text: str, rows: list[VacancyRankInput]) -> CVVacancyRankingResult:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set (required for CV–vacancy ranking)")

    llm = ChatGroq(
        model=settings.groq_chat_model,
        api_key=settings.groq_api_key,
        temperature=0,
        model_kwargs={"response_format": {"type": "json_object"}},
    )

    blocks = "\n".join(_vacancy_block(v) for v in rows)

    cv = _truncate(strip_html_to_text(cv_text), _MAX_CV_CHARS)

    user_content = CV_VACANCY_RANK_USER_TEMPLATE.format(
        cv_text=cv,
        vacancy_blocks=blocks,
    )

    raw = llm.invoke(
        [
            SystemMessage(content=CV_VACANCY_RANK_SYSTEM),
            HumanMessage(content=user_content),
        ]
    )

    data = json.loads(raw.content)

    print("DATA:")
    print(data)

    return CVVacancyRankingResult.model_validate(data)


def _safe_uuid_key(raw: str) -> str | None:
    try:
        return str(uuid.UUID((raw or "").strip()))
    except ValueError:
        return None


def _opt_score(v: int | None) -> int | None:
    if v is None:
        return None
    return max(0, min(100, int(v)))


def _normalized_skills(raw: list[str] | None) -> list[str]:
    if not raw:
        return []
    out: list[str] = []
    for x in raw:
        s = str(x).strip()
        if s:
            out.append(s)
    return out


def _merge_ranking(
    rows: list[VacancyRankInput],
    result: CVVacancyRankingResult,
) -> list[
    tuple[
        VacancyRankInput,
        int,
        str | None,
        int | None,
        int | None,
        int | None,
        int | None,
        list[str],
        list[str],
    ]
]:
    by_id: dict[str, VacancyRankInput] = {str(r.id): r for r in rows}
    seen: set[str] = set()
    out: list[
        tuple[
            VacancyRankInput,
            int,
            str | None,
            int | None,
            int | None,
            int | None,
            int | None,
            list[str],
            list[str],
        ]
    ] = []

    for item in result.rankings:
        key = _safe_uuid_key(item.vacancy_id)
        if key and key in by_id and key not in seen:
            score = max(0, min(100, int(item.match_score)))
            why = (item.reason or "").strip() or None
            ts = _opt_score(item.tech_score)
            ys = _opt_score(item.years_score)
            os_ = _opt_score(item.other_score)
            ds = _opt_score(item.domain_score)
            skills = _normalized_skills(item.aligned_skills)
            not_skills = _normalized_skills(item.not_aligned_skills)
            out.append((by_id[key], score, why, ts, ys, os_, ds, skills, not_skills))
            seen.add(key)

    for r in rows:
        sid = str(r.id)
        if sid not in seen:
            out.append((r, 50, None, None, None, None, None, [], []))
            seen.add(sid)

    return out


async def rank_vacancies_by_cv(
    cv_text: str,
    rows: list[VacancyRankInput],
) -> list[
    tuple[
        VacancyRankInput,
        int | None,
        str | None,
        int | None,
        int | None,
        int | None,
        int | None,
        list[str],
        list[str],
    ]
]:
    """
    Returns rows reordered best match first, with integer match_score per row.
    If ``rows`` is empty, returns [].
    """
    if not rows:
        return []

    result = await asyncio.to_thread(_rank_sync, cv_text.strip(), rows)
    if result is None:
        raise RuntimeError("OpenAI ranking returned empty result")

    merged = _merge_ranking(rows, result)
    return merged
