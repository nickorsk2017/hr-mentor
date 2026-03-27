# cv-microservice

FastAPI service for storing CVs.

## Endpoints

- `GET /health` - health check
- `PUT /cvs` - create CV (expects JSON body)
- `GET /cvs/{cv_id}` - fetch CV

## Run locally

```bash
cp .env.example .env
# Set DATABASE_URL (e.g. postgresql+asyncpg://user:pass@localhost:5432/ai_hr)

uv sync   # or: pip install .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8003
```
