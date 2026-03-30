from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.routes import router
from app.config import settings
from app.db.session import engine


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
    app.include_router(router)

    @app.on_event("startup")
    async def _startup() -> None:
        await init_db()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
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
