# CV Microservice

## What Is This For
- Stores and returns user CV records in PostgreSQL.
- Provides CV CRUD endpoints used by the gateway.
- Includes a DB connectivity test command for local debugging.

## Folder Structure
```text
cv-microservice/
├── app/
│   ├── api/
│   │   └── routes.py            # CV HTTP endpoints
│   ├── db/
│   │   ├── session.py           # Async SQLAlchemy engine/session
│   │   └── test_connection.py   # Manual DB connection script
│   ├── models/                  # ORM model exports
│   ├── schemas/                 # API schema exports
│   ├── services/
│   │   └── cv_service.py        # Business logic for CV save/load
│   ├── config.py                # Env-based settings
│   └── main.py                  # FastAPI app + startup checks
├── cv_runner.py                 # Console-script bootstrap
├── pyproject.toml               # Dependencies and scripts
└── uv.lock                      # uv lockfile
```

## Run
```bash
cd backend/cv-microservice
uv sync
uv run cv-microservice
```
