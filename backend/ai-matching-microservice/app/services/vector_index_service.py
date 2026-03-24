from __future__ import annotations

import asyncio
import json
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from ..config import settings
from ..schemas.matching import (
    AiIndexRequest,
    AiIndexResponse,
    DeleteVacancyIndexResponse,
)
from ..schemas.job_extraction import ExtractedJobDescription
from .job_extraction_service import extract_job_description
from .text_utils import strip_html_to_text


def _build_embeddings_client() -> OpenAIEmbeddings:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for embeddings)")

    kwargs: dict[str, Any] = {
        "model": settings.openai_embedding_model,
        "api_key": settings.openai_api_key,
        "chunk_size": 1200,
    }
    
    if settings.openai_embedding_dimensions is not None:
        kwargs["dimensions"] = settings.openai_embedding_dimensions

    return OpenAIEmbeddings(**kwargs)


def _embed_sync(text: str) -> list[float]:
    emb = _build_embeddings_client()
    return emb.embed_query(text)


def _metadata_for_vector(
    vacancy_id: str,
    input_title: str,
    company: str | None,
    short_description: str,
    extracted: ExtractedJobDescription,
) -> dict[str, Any]:
    """Pinecone metadata: `text` = short_description; full extraction as JSON string."""
    extracted_dump = extracted.model_dump(mode="json")
    skills = extracted_dump.get("skills") or []
    categories = extracted_dump.get("categories") or []
    if not isinstance(skills, list):
        skills = []
    if not isinstance(categories, list):
        categories = []
    skills_str = [str(s)[:256] for s in skills[:50]]
    categories_str = [str(c)[:128] for c in categories[:20]]


    meta: dict[str, Any] = {
        "kind": "vacancy",
        "vacancy_id": vacancy_id,
        "input_title": (input_title or "")[:512],
        "text": (short_description or "")[:8000],
        "extracted_json": json.dumps(extracted_dump, ensure_ascii=False)[:39000],
        **extracted_dump,
        "skills": skills_str,
        "categories": categories_str,
    }
    
    if company:
        meta["company"] = company[:512]
    return meta


def _upsert_sync(vectors: list[dict[str, Any]]) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index_name:
        raise RuntimeError("PINECONE_API_KEY and PINECONE_INDEX_NAME must be set")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)

    try:
        index.upsert(
            vectors=vectors,
            namespace=settings.pinecone_namespace,
        )
    except Exception as exc:  # noqa: BLE001
        msg = str(exc)
        if "does not match the dimension of the index" in msg:
            raise RuntimeError(
                "Embedding dimension does not match Pinecone index dimension. "
                "Set OPENAI_EMBEDDING_DIMENSIONS to your index dimension "
                "(e.g. 1024), or recreate the Pinecone index to match the embedding model."
            ) from exc
        raise


def _delete_sync(vacancy_id: str) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index_name:
        raise RuntimeError("PINECONE_API_KEY and PINECONE_INDEX_NAME must be set")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)
    index.delete(
        filter={"vacancy_id": {"$eq": vacancy_id}},
        namespace=settings.pinecone_namespace,
    )


async def index_vacancy_ai(req: AiIndexRequest) -> AiIndexResponse:
    extracted = await extract_job_description(
        req.title,
        req.company,
        req.description,
    )
    extracted_dump = extracted.model_dump(mode="json")
    short = (extracted.short_description or "").strip()

    values = await asyncio.to_thread(_embed_sync, short)
    metadata = _metadata_for_vector(
        req.vacancy_id,
        req.title,
        req.company,
        short,
        extracted,
    )
    await asyncio.to_thread(
        _upsert_sync,
        [{"id": req.vacancy_id, "values": values, "metadata": metadata}],
    )

    return AiIndexResponse(
        vacancy_id=req.vacancy_id,
        dimensions=len(values),
        namespace=settings.pinecone_namespace,
        text=short,
        extracted=extracted_dump,
    )


async def delete_vacancy_index(vacancy_id: str) -> DeleteVacancyIndexResponse:
    if not vacancy_id.strip():
        raise ValueError("vacancy_id is required")
    await asyncio.to_thread(_delete_sync, vacancy_id)
    return DeleteVacancyIndexResponse(
        vacancy_id=vacancy_id,
        deleted=True,
        namespace=settings.pinecone_namespace,
    )
