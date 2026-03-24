from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ..schemas.matching import (
    AiIndexRequest,
    AiIndexResponse,
    DeleteVacancyIndexResponse,
)
from ..services import vector_index_service

router = APIRouter()


@router.post("/index", response_model=AiIndexResponse)
async def ai_index_endpoint(body: AiIndexRequest) -> AiIndexResponse:
    """
    Extract structured job fields via OpenAI (LangChain), embed `short_description`,
    upsert one vector per vacancy into Pinecone (metadata includes full extracted JSON).
    """
    try:
        return await vector_index_service.index_vacancy_ai(body)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while indexing: {type(e).__name__}: {e}",
        ) from e


@router.delete("/index/{vacancy_id}", response_model=DeleteVacancyIndexResponse)
async def ai_delete_index_endpoint(vacancy_id: str) -> DeleteVacancyIndexResponse:
    try:
        return await vector_index_service.delete_vacancy_index(vacancy_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e
    except Exception as e:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"Upstream error while deleting from index: {type(e).__name__}: {e}",
        ) from e
