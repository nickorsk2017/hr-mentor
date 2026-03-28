# ai-ranking-microservice

FastAPI service for vacancy **ranking**: Pinecone listing by user, CV-aware ranking (Groq/LangChain), Postgres CV lookup.

Vacancy **indexing** (LLM extract → embed → Pinecone upsert/delete) lives in **`rag-index-microservice`** (same stack: FastAPI, LangChain, OpenAI embeddings, Pinecone).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/rankings/health` | Config flags |
| `GET` | `/v1/rankings?user_id={uuid}` | List vacancies from Pinecone; rank with CV when present |

## Run

Configuration is read from **`backend/_common/.env`** (shared with other backend services):

```bash
cp ../_common/.env.example ../_common/.env
# edit ../_common/.env
```

Then:

```bash
uv sync
uv run ranking-microservice
# or: uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Environment

Variables are defined in **`backend/_common/.env`** (and overridden by process environment if set).

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL for `cvs` (CV text for ranking) |
| `GROQ_API_KEY` / `GROQ_CHAT_MODEL` | CV–vacancy ranking |
| `OPENAI_API_KEY` | Pinecone listing embeddings |
| `OPENAI_EMBEDDING_MODEL` | Default `text-embedding-3-small` |
| `OPENAI_EMBEDDING_DIMENSIONS` | Must match Pinecone index dimension |
| `PINECONE_*` | Index + namespace |
| `PINECONE_USER_VACANCIES_TOP_K` | Max hits per user for list query |

For indexing vacancies, run **`rag-index-microservice`** (port **8002** by default) and set `NEXT_PUBLIC_RAG_INDEX_MICROSERVICE_URL` on the frontend.
