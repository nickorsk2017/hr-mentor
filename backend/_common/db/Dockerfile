FROM python:3.11-slim

WORKDIR /app

# install uv
RUN pip install uv

# copy shared backend code (including env_paths) and db project
# build context is backend/, so _common is at ./_common
COPY ./_common /app/backend/_common

WORKDIR /app/backend/_common/db
ENV PYTHONPATH=/app/backend

# install dependencies from pyproject.toml
RUN uv sync

CMD ["uv", "run", "alembic", "upgrade", "head"]