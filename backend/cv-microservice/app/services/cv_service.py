from __future__ import annotations

import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..db.session import SessionLocal
from ..models.cv import CV as CVModel
from ..schemas.cv import UpsertCVRequest, CVResponse


def health_check() -> dict:
    return {"status": "ok"}


async def _get_cv_or_404(db: AsyncSession, cv_id: uuid.UUID) -> CVModel:
    result = await db.execute(select(CVModel).where(CVModel.id == cv_id))
    cv = result.scalar_one_or_none()

    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


async def upsert_cv(req: UpsertCVRequest) -> CVResponse:
    cv_text = req.cv_text or ""

    async with SessionLocal() as db:
        cv = CVModel(user_id=req.user_id, cv_text=cv_text)
        db.add(cv)
        await db.commit()
        await db.refresh(cv)

        return CVResponse(
            id=cv.id,
            user_id=cv.user_id,
            cv_text=cv.cv_text,
            created_at=cv.created_at,
        )


async def get_cv(cv_id: uuid.UUID) -> CVResponse:
    async with SessionLocal() as db:
        cv = await _get_cv_or_404(db, cv_id)

        return CVResponse(
            id=cv.id,
            user_id=cv.user_id,
            cv_text=cv.cv_text,
            created_at=cv.created_at,
        )
