# AI HR Mentor

## What This Project Is

AI HR Mentor is a full-stack app for:

- editing and storing CVs
- managing vacancies and interview stages
- indexing CV/vacancy data in Pinecone
- ranking vacancies against a user CV

The project is split into `frontend/` (Next.js UI) and `backend/` (FastAPI microservices).

## Project Structure

```text
ai-hr-agent/
├── frontend/
│   └── main-app/                 # Next.js frontend
├── backend/
│   ├── gateway/                  # API gateway (entrypoint for frontend)
│   ├── cv-microservice/          # CV storage service
│   ├── vacancy-microservice/     # Vacancy CRUD service
│   ├── rag-index-microservice/   # CV/vacancy extraction + Pinecone indexing
│   ├── ranking-microservice/     # CV-to-vacancy ranking service
│   ├── _common/                  # Shared schemas, DB models, shared env
│   └── README.md                 # Backend overview
└── makefile                      # Top-level install/run helpers
```

## Main Docs

- Backend overview: `backend/README.md`
- Frontend overview: `frontend/main-app/README.md`
- Gateway details: `backend/gateway/README.md`
- CV service: `backend/cv-microservice/README.md`
- Vacancy service: `backend/vacancy-microservice/README.md`
- RAG index service: `backend/rag-index-microservice/README.md`
- Ranking service: `backend/ranking-microservice/README.md`

## Shared Environment

Backend services use a shared env file:

- `backend/_common/.env`
- template config: `backend/_common/.env.example`

Frontend uses:

- `frontend/main-app/.env`
- template config: `frontend/main-app/.env.example`

## Quick Start

```bash
# from project root
make install-deps
make start-backend-microservices
```

In another terminal:

```bash
cd frontend/main-app
pnpm dev
```
