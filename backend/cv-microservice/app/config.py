from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "cv-microservice"
    port: int = 8003
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_hr"


settings = Settings()
