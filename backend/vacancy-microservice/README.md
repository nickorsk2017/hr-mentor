# vacancy-microservice

FastAPI service for vacancy CRUD and interview-stage tracking.

## Endpoints

- `GET /health` – health check
- `POST /vacancies` – create vacancy
- `PUT /vacancies/{vacancy_id}` – update vacancy
- `GET /vacancies?user_id=<uuid>` – list user vacancies
- `DELETE /vacancies/{vacancy_id}?user_id=<uuid>` – delete vacancy

## Run locally

Configuration is read from **`backend/_common/.env`** (shared with other backend services):

```bash
cp ../_common/.env.example ../_common/.env
# edit ../_common/.env — set DATABASE_URL, PORT (optional), etc.
```

Then:

```bash
uv sync
uv run vacancy-microservice
# or: uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database migrations (Alembic)

Migrations live in **`backend/_common/db_models_and_migrations`**. They use the same **`backend/_common/.env`** for `DATABASE_URL` (sync driver is applied in Alembic).

```bash
cd ../_common/db_models_and_migrations
alembic upgrade head
```

Create a new revision after model changes:

```bash
cd ../_common/db_models_and_migrations
alembic revision --autogenerate -m "describe change"
alembic upgrade head
```

## Notes

- Startup checks that PostgreSQL is reachable; schema comes from Alembic.

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
