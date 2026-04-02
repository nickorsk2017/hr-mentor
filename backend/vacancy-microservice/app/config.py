from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

_COMMON_ENV = Path(__file__).resolve().parents[2] / "_common" / ".env"


class Settings(BaseSettings):
  model_config = SettingsConfigDict(
    env_file=_COMMON_ENV,
    env_file_encoding="utf-8",
    extra="ignore",
  )

  app_name: str = "vacancy-microservice"
  port: int = 8005
  database_url: str


settings = Settings()

