from __future__ import annotations

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import engine_from_config, pool

# Project root (parent of alembic/)
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT.parent) not in sys.path:
    sys.path.insert(0, str(_ROOT.parent))

from db_models_and_migrations.base import Base  # noqa: E402
from db_models_and_migrations.models import cv as _cv  # noqa: F401, E402
from db_models_and_migrations.models import vacancy as _vacancy  # noqa: F401, E402


class _Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_hr"


config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def get_sync_database_url() -> str:
    """
    Alembic runs synchronously; use psycopg2 instead of asyncpg.
    Priority:
      1) DATABASE_URL env var
      2) .env in current working directory (service-level migration flow)
      3) .env in this common project
    """
    env_url = os.getenv("DATABASE_URL")
    if env_url:
        url = env_url
    else:
        cwd_env = Path.cwd() / ".env"
        project_env = _ROOT / ".env"
        env_file = cwd_env if cwd_env.exists() else project_env
        url = _Settings(_env_file=env_file).database_url

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
