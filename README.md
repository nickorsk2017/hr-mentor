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

- Backend overview: [`backend/README.md`](backend/README.md)
- Frontend overview: [`frontend/main-app/README.md`](frontend/main-app/README.md)
- Gateway details: [`backend/gateway/README.md`](backend/gateway/README.md)
- CV service: [`backend/cv-microservice/README.md`](backend/cv-microservice/README.md)
- Vacancy service: [`backend/vacancy-microservice/README.md`](backend/vacancy-microservice/README.md)
- RAG index service: [`backend/rag-index-microservice/README.md`](backend/rag-index-microservice/README.md)
- Ranking service: [`backend/ranking-microservice/README.md`](backend/ranking-microservice/README.md)

## Shared Environment

Backend services use a shared env file:

- `backend/_common/.env`
- template config: `backend/_common/.env.example`


## How to Run the Project

Before running anything, **define `backend/_common/.env`** using the template at `backend/_common/.env.example` (copy it and fill in your own keys).

### 1. Run everything with Docker (recommended)

- Make sure Docker Desktop (or Docker Engine + Compose) is running.
- From the repo root, start the full stack:

```bash
docker compose up --build
```

- In VS Code / Cursor you can also use the **Docker** debug configuration:
  - Open the **Run and Debug** panel.
  - Select `Docker`.
  - Press the green **Run** / **Debug** button to build and start all services defined in `docker-compose.yml`.

Once started:

- Backend gateway: `http://localhost:8001`
- Frontend: `http://localhost:3000`

### 2. Run with VS Code / Cursor debug (Backend + Frontend)

- For this mode, you need also a local **PostgreSQL** and **RabbitMQ** running on your machine.

- Open **Run and Debug** in VS Code / Cursor.
- Choose the **compound configuration**:
  - `Backend + Frontend`
- Press the green **Run** / **Debug** button.

This will:

- Start all backend microservices via `uv run`:
  - `Gateway service`
  - `CV service`
  - `RAG index service`
  - `Ranking service`
  - `Vacancy service`
- Start the Next.js dev server:
  - `Frontend (Next.js dev)` on `http://localhost:3000`
