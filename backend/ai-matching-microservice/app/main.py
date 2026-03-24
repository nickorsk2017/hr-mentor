from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .api.ai_routes import router as ai_router
from .api.routes import router as matching_router
from .config import settings
from .db.session import engine


async def init_db() -> None:
    """Verify PostgreSQL is reachable (same pattern as cv-microservice)."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        msg = str(e)
        if "InvalidCatalogNameError" in msg or "does not exist" in msg:
            raise RuntimeError(
                "PostgreSQL database does not exist. "
                "Create it or update DATABASE_URL, or ignore if you only use Pinecone."
            ) from e
        raise


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.include_router(matching_router, prefix="/v1")
    app.include_router(ai_router, prefix="/ai")

    @app.on_event("startup")
    async def _startup() -> None:
        await init_db()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


app = create_app()


def main() -> int:
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port)
    return 0
