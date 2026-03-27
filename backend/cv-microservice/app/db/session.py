from __future__ import annotations

from sqlalchemy.engine import make_url
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from ..config import settings


def _normalize_database_url(raw: str) -> str:
    url = make_url(raw)

    if url.drivername in {"postgresql", "postgres"}:
        url = url.set(drivername="postgresql+asyncpg")
        return str(url)

    if "psycopg2" in url.drivername or url.drivername.endswith("+psycopg"):
        raise ValueError(
            "DATABASE_URL must use an async driver. "
            "Use: postgresql+asyncpg://user:pass@host:5432/dbname"
        )

    return str(url)


engine = create_async_engine(_normalize_database_url(settings.database_url), echo=False)
SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)
