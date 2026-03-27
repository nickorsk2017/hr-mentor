from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "gateway-microservice"
    port: int = 8004

    cv_microservice_url: str = "http://localhost:8003"
    vacancy_microservice_url: str = "http://localhost:8000"
    ranking_microservice_url: str = "http://localhost:8001"
    rag_index_microservice_url: str = "http://localhost:8002"

    request_timeout_seconds: float = 30.0


settings = Settings()
