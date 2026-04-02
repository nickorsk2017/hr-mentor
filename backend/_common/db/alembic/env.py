from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import engine_from_config, pool

# Backend root (needed for `_common.*` imports)
_BACKEND_ROOT = Path(__file__).resolve().parents[3]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from _common.env_paths import COMMON_ENV_FILE

from _common.db.models.base import BaseModel


class _Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=COMMON_ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )
    database_url: str;


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = BaseModel.metadata


def get_sync_database_url() -> str:
    """
    Alembic runs synchronously; use psycopg2 instead of asyncpg.
    Priority:
      1) DATABASE_URL env var
      2) DATABASE_URL from ``backend/_common/.env`` (via pydantic-settings)
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        url = env_url
    else:
        url = _Settings().database_url

    if "+asyncpg" in url:
        return url.replace("+asyncpg", "+psycopg2", 1)
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url.removeprefix("postgresql://")
    return url


def run_migrations_offline() -> None:
    context.configure(
        url=get_sync_database_url(),
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_sync_database_url()

    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
