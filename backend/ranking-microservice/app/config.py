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

    app_name: str = "ai-ranking-microservice"
    port: int = 8004

    # Optional: same pattern as cv-microservice (verify DB on startup when set)
    database_url: str;

    # OpenAI — used for embeddings (LangChain OpenAIEmbeddings)
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    # Optional down-projection for text-embedding-3* models (e.g. 1024 for a 1024-d index)
    openai_embedding_dimensions: int = 1536

    # Pinecone
    pinecone_api_key: str = ""
    pinecone_index: str = ""
    pinecone_cv_namespace: str = "cvs"
    # Max vectors returned per user for GET /v1/vacancies (semantic query + metadata filter)
    pinecone_user_vacancies_top_k: int = 2000

    # Groq — used for CV-vacancy ranking chat model
    groq_api_key: str = ""
    groq_chat_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"


settings = Settings()
