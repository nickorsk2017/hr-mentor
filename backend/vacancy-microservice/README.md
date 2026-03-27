# vacancy-microservice

FastAPI service for vacancy CRUD and interview-stage tracking.

## Endpoints

- `GET /v1/health` – health check
- `POST /v1/vacancies` – create vacancy
- `PUT /v1/vacancies/{vacancy_id}` – update vacancy
- `GET /v1/vacancies?user_id=<uuid>` – list user vacancies
- `DELETE /v1/vacancies/{vacancy_id}?user_id=<uuid>` – delete vacancy

## Run locally

```bash
cp .env.example .env
# Set DATABASE_URL (e.g. postgresql+asyncpg://user:pass@localhost:5432/ai_hr)

uv sync   # or: pip install .
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database migrations (Alembic)

Migrations are centralized in `backend/common/db_models_and_migrations`.
This service keeps `alembic.ini` wired to that shared migration project.

```bash
cd backend/vacancy-microservice
alembic upgrade head
```

Create a new revision after model changes:

```bash
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Notes

- Schema is managed with Alembic; startup only checks that PostgreSQL is reachable.

## Create vacancy request body

```json
{
  "user_id": "00000000-0000-0000-0000-000000000000",
  "title": "Senior Backend Engineer",
  "company": "Acme Corp",
  "description": "Role details",
  "planned_stages": 3,
  "stages": []
}
```

