# RAG Index Microservice

## What Is This For
- Converts CVs and vacancies into vector-index records.
- Extracts structured fields from text/HTML with LLM prompts.
- Upserts/deletes vectors in Pinecone for downstream ranking/search.

## Folder Structure
```text
rag-index-microservice/
├── app/
│   ├── api/
│   │   └── routes.py                          # Indexing HTTP endpoints
│   ├── prompts/
│   │   └── index_to_vector_db.py              # Extraction prompt templates
│   ├── schemas/
│   │   ├── cv_extraction.py                   # CV extraction schema
│   │   └── vacancy_index.py                   # Vacancy extraction schema
│   ├── services/
│   │   ├── cv_data_extraction_service.py      # CV extraction flow
│   │   ├── cv_vector_index_service.py         # CV vector upsert/delete
│   │   ├── vacancy_data_extraction_service.py # Vacancy extraction flow
│   │   └── vacancy_vector_index_service.py    # Vacancy vector upsert/delete
│   ├── config.py                              # Env-based settings
│   ├── main.py                                # FastAPI app entrypoint
│   └── utils.py                               # HTML/text helpers
├── pyproject.toml                             # Dependencies and scripts
└── uv.lock                                    # uv lockfile
```

## Run
```bash
cd backend/rag-index-microservice
uv sync
uv run rag-index-microservice
```
