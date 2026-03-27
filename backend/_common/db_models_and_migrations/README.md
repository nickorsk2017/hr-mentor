# db-models-and-migrations

Shared SQLAlchemy models and Alembic migrations for backend microservices.

## Contents

- `base.py` - shared declarative `Base`
- `models/` - table models (`cvs`, `vacancies`)
- `alembic/` - migration environment and versions

## Run migrations

From this project:

```bash
cd backend/common/db_models_and_migrations
cp .env.example .env
alembic upgrade head
```

Or from a service that points to this migration project (for example `vacancy-microservice`):

```bash
cd backend/vacancy-microservice
alembic upgrade head
```
