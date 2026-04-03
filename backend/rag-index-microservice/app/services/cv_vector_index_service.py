from __future__ import annotations

import asyncio
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from app.config import settings
from _common.schemas.vacancy_index import (
    CvIndexPayload,
    CvIndexResponse,
    DeleteCvIndexResponse,
)
from app.services.cv_data_extraction_service import extract_cv_data_for_index
from app.utils import strip_html_to_text

pc = Pinecone(api_key=settings.pinecone_api_key)
index = pc.Index(settings.pinecone_index)


def _vector_id_for_user(user_id: str) -> str:
    uid = user_id.strip()
    if not uid:
        raise ValueError("user_id is required for CV vector id")
    return f"cv:{uid}"


def _build_embeddings_client() -> OpenAIEmbeddings:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for embeddings)")

    kwargs: dict[str, Any] = {
        "model": settings.openai_embedding_model,
        "api_key": settings.openai_api_key,
    }

    if settings.openai_embedding_dimensions is not None:
        kwargs["dimensions"] = int(settings.openai_embedding_dimensions)
    return OpenAIEmbeddings(**kwargs)


def _embed_text(text: str) -> list[float]:
    emb = _build_embeddings_client()
    return emb.embed_query(text)


def _text_for_embedding(summary: str, skills: list[str], years_expereance: float) -> str:
    summary = summary.strip()
    skills_line = ", ".join(s.strip() for s in skills if s and str(s).strip())
    parts = [summary] if summary else []
    
    if skills_line:
        parts.append(f"Skills: {skills_line}")
    parts.append(f"Years of experience: {years_expereance}")
    text = "\n".join(parts)
    if not text.strip():
        raise ValueError("Nothing to embed after extraction")
    return text


def _upsert_cv_vectors(vectors: list[dict[str, Any]]) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        raise RuntimeError("PINECONE_API_KEY and pinecone_index must be set")
    try:
        ns = "cvs"
        index.upsert(vectors=vectors, namespace=ns)
    except Exception as exc:
        msg = str(exc)
        if "does not match the dimension of the index" in msg:
            raise RuntimeError(
                "Embedding dimension does not match Pinecone index dimension. "
                "Set OPENAI_EMBEDDING_DIMENSIONS to your index dimension "
                "(e.g. 1024), or recreate the Pinecone index to match the embedding model."
            ) from exc
        raise


def _delete_cv_vectors(vector_ids: list[str]) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        raise RuntimeError("PINECONE_API_KEY and pinecone_index must be set")
    if not vector_ids:
        return
    index.delete(ids=vector_ids, namespace="cvs")


async def add_to_index(payload: CvIndexPayload) -> CvIndexResponse:
    extracted = await extract_cv_data_for_index(payload.cv_text)
    summary = (extracted.summary or "").strip()
    skills = [s.strip() for s in extracted.skills if s and str(s).strip()]
    years = float(extracted.years_expereance)

    embed_source = _text_for_embedding(summary, skills, years)
    embedding = await asyncio.to_thread(_embed_text, embed_source)

    uid = payload.user_id.strip()
    vid = _vector_id_for_user(uid)
    
    metadata: dict[str, Any] = {
        "kind": "cv",
        "id": uid,
        "user_id": uid,
        "summary": summary,
        "years_expereance": years,
        "skills": skills,
    }

    await asyncio.to_thread(
        _upsert_cv_vectors,
        [{"id": vid, "values": embedding, "metadata": metadata}],
    )

    return CvIndexResponse(
        id=uid,
        user_id=uid,
        skills=skills,
        summary=summary,
        years_expereance=years,
        vector_id=vid,
        dimensions=len(embedding),
        namespace="cvs",
    )


async def delete_cv_index(user_id: str) -> DeleteCvIndexResponse:
    uid = user_id.strip()
    if not uid:
        raise ValueError("user_id is required")
    vid = _vector_id_for_user(uid)
    await asyncio.to_thread(_delete_cv_vectors, [vid])
    return DeleteCvIndexResponse(
        user_id=uid,
        vector_id=vid,
        deleted=True,
        namespace="cvs",
    )
