from fastapi import APIRouter
from uuid import UUID

from app.services.cv_service import upsert_cv, get_cv
from _common.schemas.cv import UpsertCVRequest, CVResponse

router = APIRouter()


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}
    

@router.put("/cvs", response_model=CVResponse)
async def upsert_cv_endpoint(req: UpsertCVRequest) -> CVResponse:
    return await upsert_cv(req)


@router.get("/cvs/{cv_id}", response_model=CVResponse)
async def get_cv_endpoint(cv_id: UUID) -> CVResponse:
    return await get_cv(cv_id)
