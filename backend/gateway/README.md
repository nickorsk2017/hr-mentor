# Gateway Microservice

## What Is This For
- Exposes one public API for the frontend.
- Proxies requests to backend services: CV, vacancy, ranking, and RAG index.
- Handles cross-service orchestration (for example: save CV then trigger CV indexing).

## Folder Structure
```text
gateway/
├── app/
│   ├── api/
│   │   └── routes.py          # Public HTTP routes and orchestration calls
│   ├── services/
│   │   └── proxy_service.py   # HTTP forwarding helper to other services
│   ├── config.py              # Env-based service URLs and settings
│   └── main.py                # FastAPI app factory + uvicorn entrypoint
├── pyproject.toml             # Dependencies and `gateway` script
└── uv.lock                    # uv lockfile
```

## Run
```bash
cd backend/gateway
uv sync
uv run gateway
```
# gateway-microservice

FastAPI API gateway that exposes all methods from CV, vacancy, ranking, and rag-index microservices.

## Endpoints

- `GET /health`
- `PUT /cvs`
- `GET /cvs/{cv_id}`
- `POST /vacancies`
- `PUT /vacancies/{vacancy_id}`
- `GET /vacancies`
- `DELETE /vacancies/{vacancy_id}`
- `GET /v1/rankings/health`
- `GET /v1/rankings?user_id=<uuid>`
- `GET /v1/vacancies/health`
- `POST /v1/vacancies/index`
- `DELETE /v1/vacancies/index/{vacancy_id}`

## Run locally

```bash
cd backend/gateway-microservice
uv sync
uv run gateway-microservice
```
