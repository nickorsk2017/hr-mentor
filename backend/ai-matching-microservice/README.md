# ai-matching-microservice

FastAPI service for vacancy **AI extraction** and **Pinecone** indexing:

- **LangChain + OpenAI** — structured job extraction (`EXTRACT_JOB_DESCRIPTION_PROMPT`)
- **OpenAI embeddings** — vector from **`short_description`** only
- **Pinecone** — one vector per `vacancy_id`; metadata includes `text` (= short description) and `extracted_json`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/vacancies/health` | Config flags |
| `GET` | `/v1/vacancies?user_id={uuid}` | List vacancies from Pinecone (filter `user_id`); LangChain embeds CV or neutral text; if CV exists in Postgres, OpenAI re-ranks and sets `match_score` |
| `POST` | `/v1/vacancies/index` | Extract fields → embed `short_description` → upsert |
| `DELETE` | `/v1/vacancies/index/{vacancy_id}` | Remove vectors for `vacancy_id` |

## Run

```bash
cp .env.example .env
uv sync
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

## Index payload (`POST /v1/vacancies/index`)

```json
{
  "user_id": "uuid",
  "vacancy_id": "uuid",
  "title": "…",
  "company": "…",
  "description": "<p>…</p>"
}
```

Response includes `text` (embedded string) and `extracted` (full structured dict).

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL (`postgresql+asyncpg://…`); same DB as cv-microservice for `cvs` (CV text for ranking) |
| `PINECONE_USER_VACANCIES_TOP_K` | Max hits per user for the list query (default `2000`) |
| `OPENAI_API_KEY` | Required |
| `OPENAI_CHAT_MODEL` | Default `gpt-4o-mini` (extraction) |
| `OPENAI_EMBEDDING_MODEL` | Default `text-embedding-3-small` |
| `OPENAI_EMBEDDING_DIMENSIONS` | Optional; must match Pinecone index dimension |
| `PINECONE_*` | Index + namespace |
