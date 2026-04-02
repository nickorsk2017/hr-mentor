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

    app_name: str = "rag-index-microservice"
    port: int = 8003

    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_embedding_dimensions: int = 1536

    pinecone_api_key: str = ""
    pinecone_index: str = ""

    # RabbitMQ (for async indexing from gateway events)
    rabbitmq_url: str = "amqp://guest:guest@localhost:5672/"
    rabbitmq_exchange: str = "ai-mentor_events"
    rabbitmq_cv_index_routing_key: str = "cv.index"
    rabbitmq_vacancy_index_routing_key: str = "vacancy.index"
    rabbitmq_cv_index_delete_routing_key: str = "cv.index.delete"
    rabbitmq_vacancy_index_delete_routing_key: str = "vacancy.index.delete"
    rabbitmq_cv_index_queue: str = "rag.cv.index.queue"
    rabbitmq_vacancy_index_queue: str = "rag.vacancy.index.queue"
    rabbitmq_cv_index_delete_queue: str = "rag.cv.index.delete.queue"
    rabbitmq_vacancy_index_delete_queue: str = "rag.vacancy.index.delete.queue"


settings = Settings()
