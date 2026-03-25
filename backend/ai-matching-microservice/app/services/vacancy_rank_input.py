from __future__ import annotations

from typing import Any
from dataclasses import dataclass
from uuid import UUID


@dataclass
class VacancyRankInput:
    """Minimal vacancy shape for CV ranking and API mapping (ORM-agnostic)."""

    id: UUID
    user_id: UUID
    title: str
    company: str | None
    summary: str
    meta_data: dict[str, Any]
    reason: str | None = None
