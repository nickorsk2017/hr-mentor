from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UpsertCVRequest(BaseModel):
    user_id: UUID
    cv_text: str


class CVResponse(BaseModel):
    id: UUID
    user_id: UUID
    cv_text: str
    created_at: datetime
