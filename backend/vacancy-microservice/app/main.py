from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from .api.routes import router as api_router
from .db.session import engine
from .config import settings


async def init_db() -> None:
    """Verify PostgreSQL is reachable. Apply schema with `alembic upgrade head`."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
    except Exception as e:
        msg = str(e)
        if "InvalidCatalogNameError" in msg or "does not exist" in msg:
            raise RuntimeError(
                "PostgreSQL database does not exist. "
                "Create it (e.g. `createdb ai_hr`) or update DATABASE_URL."
            ) from e
        raise


def create_app() -> FastAPI:
    app = FastAPI(title=settings.app_name)
    app.include_router(api_router)

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
    """
    Console-script entrypoint used by `vacancy-microservice`.
    """
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.port)
    return 0

