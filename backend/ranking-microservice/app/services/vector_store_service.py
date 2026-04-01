from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any
from app.prompts.cv_prompt import CV_RANK
import uuid
import asyncio

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from app.config import settings
from app.schemas import VacancyFromIndex


@dataclass
class VacancyVectorSearchRow:
    vacancy: VacancyFromIndex
    raw_score: float | None = None
    match_score: int | None = None


def _build_langchain_embeddings() -> OpenAIEmbeddings:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for Pinecone vacancy listing)")
    kwargs: dict[str, Any] = {
        "model": settings.openai_embedding_model,
        "api_key": settings.openai_api_key,
    }
    if settings.openai_embedding_dimensions is not None:
        kwargs["dimensions"] = int(settings.openai_embedding_dimensions)
    return OpenAIEmbeddings(**kwargs)


def _pinecone_score_to_match_score(score: float | None) -> int | None:
    if score is None or (isinstance(score, float) and math.isnan(score)):
        return None
    s = float(score)
    if s <= 1.0 + 1e-6:
        return max(0, min(100, int(round(s * 100))))
    return max(0, min(100, int(round(s))))


def _resolved_list_metadata(md: dict[str, Any]) -> dict[str, Any]:
    """Prefer canonical JSON in ``meta_data`` (new upserts); fall back to legacy flat metadata."""
    blob = md.get("meta_data")
    if isinstance(blob, str) and blob.strip():
        try:
            parsed = json.loads(blob)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            pass
    return md


def _get_summary_from_meta_data(md: dict[str, Any]) -> str:
    summary = md.get("summary")
    return summary or ""


def _metadata_pinecone_to_object(md: dict[str, Any]) -> VacancyFromIndex | None:
    metadata = _resolved_list_metadata(md)
    vacancy_id = metadata.get("vacancy_id") or md.get("id")
    user_id = metadata.get("user_id")
    if not user_id or not user_id:
        return None
    title = metadata.get("title")
    company = metadata.get("company")

    summary = _get_summary_from_meta_data(md)

    return VacancyFromIndex(
        id=vacancy_id,
        user_id=user_id,
        title=title,
        company=company,
        summary=summary,
        meta_data=md,
    )


def _query_user_vacancies(user_id: str, cv_text: str) -> list[VacancyVectorSearchRow]:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        raise RuntimeError("PINECONE_API_KEY and pinecone_index must be set")

    text = (cv_text or "").strip()
    emb = _build_langchain_embeddings()
    vector = emb.embed_query(text)

    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)
    top_k = max(1, int(settings.pinecone_user_vacancies_top_k))

    flt: dict[str, Any] = {"user_id": {"$eq": user_id}}

    res = index.query(
        vector=vector,
        filter=flt,
        top_k=top_k,
        include_metadata=True,
        namespace="vacancies",
    )

    result: list[VacancyVectorSearchRow] = []
    for m in res.matches or []:
        meta = m.metadata or {}
        item = _metadata_pinecone_to_object(meta)
        if item is None:
            continue
        result.append(VacancyVectorSearchRow(vacancy=item, raw_score=m.score))
    return result


def _cv_vector_id(user_id: str) -> str:
    return f"cv:{user_id.strip()}"


def _normalize_skills_from_metadata(raw: Any) -> list[str]:
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
            pass
        return [raw.strip()]
    return []


def format_cv_index_metadata_as_text(metadata: dict[str, Any]) -> str:
    """Build ranking / embedding text from Pinecone CV upsert metadata (summary, skills, years)."""
    summary = str(metadata.get("summary") or "").strip()
    skills = _normalize_skills_from_metadata(metadata.get("skills"))
    years = metadata.get("years_expereance")
    if years is None:
        years = metadata.get("years_experience")

    skills_str = json.dumps(skills)
    return CV_RANK.format(summary=summary, skills=skills_str, years_experience=years)


def _fetch_cv_index_metadata_sync(user_id: str) -> dict[str, Any] | None:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        return None
    uid = user_id.strip()
    if not uid:
        return None

    vid = _cv_vector_id(uid)
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)
    res = index.fetch(ids=[vid], namespace=settings.pinecone_cv_namespace)

    vectors = getattr(res, "vectors", None) or {}
    rec = vectors.get(vid)

    if rec is None:
        return None
    md = getattr(rec, "metadata", None)
    if not md:
        return None
    return dict(md)


async def get_cv_profile_text_from_pinecone(user_id: uuid.UUID) -> str | None:
    """Backward-compatible helper: return only formatted CV text, or ``None``."""
    text, _ = await get_cv_profile_text_and_skills_from_pinecone(user_id)
    return text


async def get_cv_profile_text_and_skills_from_pinecone(
    user_id: uuid.UUID,
) -> tuple[str | None, list[str]]:
    meta_data = await asyncio.to_thread(_fetch_cv_index_metadata_sync, str(user_id))
    if not meta_data:
        return None, []

    skills = _normalize_skills_from_metadata(meta_data.get("skills"))
    text = format_cv_index_metadata_as_text(meta_data)
    return text, skills


async def get_index_vacancies_from_pinecone(
    user_id: uuid.UUID,
    cv_text: str,
) -> list[VacancyVectorSearchRow]:
    rows = await asyncio.to_thread(
        _query_user_vacancies,
        str(user_id),
        cv_text,
    )
    return [
        VacancyVectorSearchRow(
            vacancy=row.vacancy,
            raw_score=row.raw_score,
            match_score=_pinecone_score_to_match_score(row.raw_score),
        )
        for row in rows
    ]


def unknown_listing_created_at() -> datetime:
    """Pinecone vacancy metadata has no ``created_at``; stable sentinel for API contract."""
    return datetime.fromtimestamp(0, tz=timezone.utc)
