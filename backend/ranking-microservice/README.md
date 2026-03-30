# Ranking Microservice

## What Is This For
- Builds ranked vacancy recommendations for a user.
- Pulls vacancy vectors/CV profile from Pinecone.
- Uses LLM-based scoring and returns normalized ranking output.

## Folder Structure
```text
ranking-microservice/
├── app/
│   ├── api/
│   │   └── routes.py                       # Ranking HTTP endpoints
│   ├── db/
│   │   └── session.py                      # Optional DB connectivity
│   ├── prompts/
│   │   ├── cv_prompt.py                    # CV text formatting prompt pieces
│   │   └── ranking_prompt.py               # Ranking model prompt templates
│   ├── schemas/
│   │   └── postgres_vacancy.py             # Ranking response models
│   ├── services/
│   │   ├── vector_store_service.py         # Pinecone fetch/query helpers
│   │   └── vacancies_ranking_service.py    # Ranking orchestration
│   ├── config.py                           # Env-based settings
│   ├── main.py                             # FastAPI app + startup checks
│   └── utils.py                            # Shared utility helpers
├── pyproject.toml                          # Dependencies and scripts
└── uv.lock                                 # uv lockfile
```

## Run
```bash
cd backend/ranking-microservice
uv sync
uv run ranking-microservice
```
