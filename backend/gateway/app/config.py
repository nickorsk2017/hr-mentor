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

    app_name: str = "gateway-microservice"
    port: int = 8001

    cv_microservice_url: str = "http://localhost:8002"
    rag_index_microservice_url: str = "http://localhost:8003"
    ranking_microservice_url: str = "http://localhost:8004"
    vacancy_microservice_url: str = "http://localhost:8005"

    # RabbitMQ (for async indexing/broadcast)
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_exchange: str = "ai-mentor_events"
    rabbitmq_cv_index_routing_key: str = "cv.index"
    rabbitmq_vacancy_index_routing_key: str = "vacancy.index"

    request_timeout_seconds: float = 30.0


settings = Settings()
