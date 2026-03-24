from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "ai-matching-microservice"
    port: int = 8001

    # Optional: same pattern as cv-microservice (verify DB on startup when set)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_hr"

    # OpenAI — used for embeddings (LangChain OpenAIEmbeddings)
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    # Optional down-projection for text-embedding-3* models (e.g. 1024 for a 1024-d index)
    openai_embedding_dimensions: int = 1536

    # Pinecone
    pinecone_api_key: str = ""
    pinecone_index_name: str = ""
    pinecone_namespace: str = "vacancies"


settings = Settings()
