from __future__ import annotations

import asyncio
import json
import math
import uuid
from datetime import datetime, timezone
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from app.config import settings
from app.services.vacancy_rank_input import VacancyRankInput


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
    text = (md.get("text") or "").strip()
    if text:
        return text
    ext = md.get("extracted")
    if isinstance(ext, dict):
        summary = (ext.get("summary") or "").strip()
        if summary:
            return summary

    raw = md.get("extracted_json")
    if isinstance(raw, str) and raw.strip():
        try:
            data = json.loads(raw)
            summary = (data.get("summary") or "").strip()
            if summary:
                return summary
        except json.JSONDecodeError:
            pass

    title = (md.get("input_title") or md.get("title") or "").strip()
    role = (md.get("role") or "").strip()
    parts = [p for p in (title, role) if p]
    return "\n".join(parts) if parts else ""


def _metadata_to_rank_input(md: dict[str, Any]) -> VacancyRankInput | None:
    md = _resolved_list_metadata(md)
    vid_raw = md.get("vacancy_id") or md.get("id")
    uid_raw = md.get("user_id")
    if not vid_raw or not uid_raw:
        return None
    try:
        vid = uuid.UUID(str(vid_raw).strip())
        uid = uuid.UUID(str(uid_raw).strip())
    except ValueError:
        return None
    title = str(md.get("input_title") or md.get("title") or "").strip()
    company = md.get("company")
    company_str = str(company).strip() if company is not None else None
    if company_str == "":
        company_str = None

    summary = _get_summary_from_meta_data(md)

    return VacancyRankInput(
        id=vid,
        user_id=uid,
        title=title,
        company=company_str,
        summary=summary,
        meta_data=md,
    )


def _query_user_vacancies_sync(user_id: str, query_text: str) -> list[tuple[VacancyRankInput, float | None]]:
    if not settings.pinecone_api_key or not settings.pinecone_index_name:
        raise RuntimeError("PINECONE_API_KEY and PINECONE_INDEX_NAME must be set")

    text = (query_text or "").strip() or "general professional job opportunities"
    emb = _build_langchain_embeddings()
    vector = emb.embed_query(text)

    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)
    top_k = max(1, int(settings.pinecone_user_vacancies_top_k))

    flt: dict[str, Any] = {"user_id": {"$eq": user_id}}

    res = index.query(
        vector=vector,
        filter=flt,
        top_k=top_k,
        include_metadata=True,
        namespace=settings.pinecone_namespace,
    )

    out: list[tuple[VacancyRankInput, float | None]] = []
    for m in res.matches or []:
        meta = m.metadata or {}
        item = _metadata_to_rank_input(meta)
        if item is None:
            continue
        out.append((item, m.score))
    return out


async def list_user_vacancies_from_pinecone(
    user_id: uuid.UUID,
    query_text_for_embedding: str,
) -> list[tuple[VacancyRankInput, int | None]]:
    rows = await asyncio.to_thread(
        _query_user_vacancies_sync,
        str(user_id),
        query_text_for_embedding,
    )
    return [(item, _pinecone_score_to_match_score(score)) for item, score in rows]


def unknown_listing_created_at() -> datetime:
    """Pinecone vacancy metadata has no ``created_at``; stable sentinel for API contract."""
    return datetime.fromtimestamp(0, tz=timezone.utc)
