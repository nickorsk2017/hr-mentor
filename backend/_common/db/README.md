# db-models-and-migrations

Shared SQLAlchemy models and Alembic migrations for backend microservices.

## Contents

- `base.py` - shared declarative `Base`
- `models/` - table models (`cvs`, `vacancies`)
- `alembic/` - migration environment and versions

## Run migrations

From this project:

```bash
cd backend/_common/db_models_and_migrations
alembic upgrade head
```

Uses **`backend/_common/.env`** for `DATABASE_URL` (see `alembic/env.py`).
