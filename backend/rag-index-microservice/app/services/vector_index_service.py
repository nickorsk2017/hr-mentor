from __future__ import annotations

import asyncio
from typing import Any

from langchain_openai import OpenAIEmbeddings
from pinecone import Pinecone

from app.config import settings
from app.schemas.indexing import (
    VacancyIndexRequest,
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


def _build_embedding_vacancy_data(text: str) -> list[float]:
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
    extracted_vacancy_data = await extract_vacancy_data_for_index(
        req.title,
        req.company,
        req.description,
    )
    summary = extracted_vacancy_data.summary
    extracted_vacancy_data = extracted_vacancy_data.model_dump(mode="json")
  
    embedding = await asyncio.to_thread(_build_embedding_vacancy_data, summary)

    metadata = {
        "kind": "vacancy",
        "user_id": req.user_id,
        "vacancy_id": req.vacancy_id,
        "company": req.company,
        "summary": summary,
        **extracted_vacancy_data,
    }

    print(f"metadata")
    print(metadata)

    await asyncio.to_thread(
        _upsert_to_vector_db,
        [{"id": req.vacancy_id, "values": embedding, "metadata": metadata}],
    )

    return VacancyIndexResponse(
        vacancy_id=req.vacancy_id,
        dimensions=len(embedding),
        namespace=settings.pinecone_namespace,
        summary=summary,
        extracted=extracted_vacancy_data,
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
