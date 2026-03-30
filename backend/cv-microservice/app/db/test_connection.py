from __future__ import annotations

import asyncio

import asyncpg

from app.config import settings


async def test() -> None:
    conn = await asyncpg.connect(settings.database_url)
    print("connected")
    await conn.close()


def main() -> int:
    asyncio.run(test())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
