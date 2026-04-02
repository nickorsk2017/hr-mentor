FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# We expect build context to be backend/, so copy shared code and service
COPY ./_common /app/backend/_common
COPY ./rag-index-microservice /app/backend/rag-index-microservice

WORKDIR /app/backend/rag-index-microservice
ENV PYTHONPATH=/app/backend

RUN pip install --upgrade pip setuptools wheel && pip install .

EXPOSE 8003

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]

