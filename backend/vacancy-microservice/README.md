# Vacancy Microservice

## What Is This For
- Manages vacancy entities in PostgreSQL.
- Supports create, update, list, and delete flows.
- Persists stage planning/tracking fields for each vacancy.

## Folder Structure
```text
vacancy-microservice/
├── app/
│   ├── api/
│   │   └── routes.py            # Vacancy HTTP endpoints
│   ├── db/
│   │   └── session.py           # Async SQLAlchemy engine/session
│   ├── schemas/
│   │   └── vacancy.py           # Local vacancy schema exports
│   ├── services/
│   │   └── vacancy_service.py   # Vacancy business logic
│   ├── config.py                # Env-based settings
│   └── main.py                  # FastAPI app + startup checks
├── vacancy_runner.py            # Console-script bootstrap
├── pyproject.toml               # Dependencies and scripts
└── uv.lock                      # uv lockfile
```

## Run
```bash
cd backend/vacancy-microservice
uv sync
uv run vacancy-microservice
```
