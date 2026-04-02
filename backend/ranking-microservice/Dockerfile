FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# We expect build context to be backend/, so copy shared code and service
COPY ./_common /app/backend/_common
COPY ./ranking-microservice /app/backend/ranking-microservice

WORKDIR /app/backend/ranking-microservice
ENV PYTHONPATH=/app/backend

RUN pip install --upgrade pip setuptools wheel && pip install .

EXPOSE 8004

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8004"]

