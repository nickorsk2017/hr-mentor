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
cp .env.example .env
uv sync
uv run gateway-microservice
```
