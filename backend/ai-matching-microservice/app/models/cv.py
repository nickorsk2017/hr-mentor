from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db.base import Base


class CV(Base):
    """Maps to cv-microservice `cvs` table."""

    __tablename__ = "cvs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(nullable=False)
    cv_text: Mapped[str] = mapped_column(Text, nullable=False, default="")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default="now()",
    )
