from __future__ import annotations

import asyncio
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from app.config import settings
from _common.schemas.vacancy_index import (
    VacancyIndexPayload,
    VacancyIndexResponse,
    DeleteVacancyIndexResponse,
)
from app.services.vacancy_data_extraction_service import extract_vacancy_data_for_index


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


def _build_vacancy_embedding_data(text: str) -> list[float]:
    emb = _build_embeddings_client()
    return emb.embed_query(text)


def _upsert_vacancy_to_vector_db(vectors: list[dict[str, Any]]) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        raise RuntimeError("PINECONE_API_KEY and pinecone_index must be set")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)

    try:
        index.upsert(
            vectors=vectors,
            namespace="vacancies",
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


def _sanitize_metadata_value(value: Any) -> str | int | float | bool | list[str]:
    """Pinecone metadata supports scalar values and list[str], never null."""
    if value is None:
        return ""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float, str)):
        return value
    if isinstance(value, list):
        return [str(v) for v in value if v is not None]
    return str(value)


def _sanitize_metadata(md: dict[str, Any]) -> dict[str, str | int | float | bool | list[str]]:
    return {k: _sanitize_metadata_value(v) for k, v in md.items()}


def _delete_vacancy_from_index(vacancy_id: str) -> None:
    if not settings.pinecone_api_key or not settings.pinecone_index:
        raise RuntimeError("PINECONE_API_KEY and pinecone_index must be set")
    pc = Pinecone(api_key=settings.pinecone_api_key)
    index = pc.Index(settings.pinecone_index)
    index.delete(
        filter={"vacancy_id": {"$eq": vacancy_id}},
        namespace="vacancies",
    )


async def add_vacancy_to_index(req: VacancyIndexPayload) -> VacancyIndexResponse:
    extracted_vacancy_data = await extract_vacancy_data_for_index(
        req.title,
        req.company,
        req.description,
    )
    summary = extracted_vacancy_data.summary
    extracted_vacancy_data = extracted_vacancy_data.model_dump(mode="json")
  
    embedding = await asyncio.to_thread(_build_vacancy_embedding_data, summary)

    metadata = {
        "kind": "vacancy",
        "user_id": req.user_id,
        "vacancy_id": req.vacancy_id,
        "company": (req.company or "").strip(),
        "summary": summary,
        **extracted_vacancy_data,
    }
    metadata = _sanitize_metadata(metadata)

    await asyncio.to_thread(
        _upsert_vacancy_to_vector_db,
        [{"id": req.vacancy_id, "values": embedding, "metadata": metadata}],
    )

    return VacancyIndexResponse(
        vacancy_id=req.vacancy_id,
        dimensions=len(embedding),
        namespace="vacancies",
        summary=summary,
        extracted=extracted_vacancy_data,
    )


async def delete_vacancy_index(vacancy_id: str) -> DeleteVacancyIndexResponse:
    if not vacancy_id.strip():
        raise ValueError("vacancy_id is required")
    await asyncio.to_thread(_delete_vacancy_from_index, vacancy_id)
    
    return DeleteVacancyIndexResponse(
        vacancy_id=vacancy_id,
        deleted=True,
        namespace="vacancies",
    )
