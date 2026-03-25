from __future__ import annotations

import asyncio
import json
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from ..config import settings
from ..schemas.matching import (
    VacancyIndexRequest,
    VacancyIndexResponse,
    DeleteVacancyIndexResponse,
)
from app.schemas.job_extraction import ExtractedJobDescription
from app.services.job_extraction_service import extract_job_description


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


def _embed_sync(text: str) -> list[float]:
    emb = _build_embeddings_client()
    return emb.embed_query(text)


def _upsert_to_vector_db(vectors: list[dict[str, Any]]) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index_name:
        raise RuntimeError("PINECONE_API_KEY and PINECONE_INDEX_NAME must be set")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index_name)

    try:
        index.upsert(
            vectors=vectors,
            namespace=settings.pinecone_namespace,
        )
    except Exception as exc:
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


async def add_to_index(req: VacancyIndexRequest) -> VacancyIndexResponse:
    extracted = await extract_job_description(
        req.title,
        req.company,
        req.description,
    )
    extracted_dump = extracted.model_dump(mode="json")
    summary = (extracted.summary or "").strip()

    values = await asyncio.to_thread(_embed_sync, summary)

    metadata = {
        "kind": "vacancy",
        "user_id": req.user_id,
        "vacancy_id": req.vacancy_id,
        "company": req.company,
        "summary": summary,
        **extracted.model_dump(mode="json")
    }

    await asyncio.to_thread(
        _upsert_to_vector_db,
        [{"id": req.vacancy_id, "values": values, "metadata": metadata}],
    )

    return VacancyIndexResponse(
        vacancy_id=req.vacancy_id,
        dimensions=len(values),
        namespace=settings.pinecone_namespace,
        summary=summary,
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
