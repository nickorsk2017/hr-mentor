# Backend Overview

## What Is In This Folder

This `backend/` directory contains five FastAPI microservices plus shared code in `_common`.

## Microservices

- `gateway` (`:8001`)  
  Public API entrypoint for the frontend. Proxies requests to other services and coordinates cross-service actions (for example, save CV then trigger indexing).

- `cv-microservice` (`:8002`)  
  Stores and returns CV records in PostgreSQL.

- `rag-index-microservice` (`:8003`)  
  Extracts structured data from CV/vacancy text, creates embeddings, and upserts/deletes vectors in Pinecone.

- `ranking-microservice` (`:8004`)  
  Reads CV/vacancy vectors from Pinecone and produces ranked vacancy recommendations with LLM-based scoring.

- `vacancy-microservice` (`:8005`)  
  CRUD for vacancies and interview stages in PostgreSQL.

## Shared `_common` Folder

`_common` contains code and data used by multiple services:

- shared schemas (request/response and index payloads)
- shared DB models/migrations (`_common/db`)
- shared env path helper (`_common/env_paths.py`)

## Shared Environment File: `_common/.env`

Most services load settings from:

`backend/_common/.env`

Use the template at:

`backend/_common/.env.example`

Key shared variables include:

- `DATABASE_URL`
- `OPENAI_API_KEY`
- `OPENAI_EMBEDDING_MODEL`
- `OPENAI_EMBEDDING_DIMENSIONS`
- `OPENAI_CHAT_MODEL`
- `PINECONE_API_KEY`
- `PINECONE_INDEX`
- `PINECONE_INDEX_CVS_NAME`
- `PINECONE_CV_NAMESPACE`
- `GROQ_API_KEY`
- `GROQ_CHAT_MODEL`

## See Also

Each microservice has its own README with folder structure and run instructions:

- `backend/gateway/README.md`
- `backend/cv-microservice/README.md`
- `backend/rag-index-microservice/README.md`
- `backend/ranking-microservice/README.md`
- `backend/vacancy-microservice/README.md`
