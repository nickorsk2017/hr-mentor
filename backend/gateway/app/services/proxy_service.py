from __future__ import annotations

from typing import Any

import httpx
from fastapi import HTTPException

from app.config import settings


async def forward_json(
    *,
    method: str,
    base_url: str,
    path: str,
    params: dict[str, Any] | None = None,
    json_body: Any | None = None,
) -> Any:
    url = f"{base_url.rstrip('/')}{path}"
    timeout = httpx.Timeout(settings.request_timeout_seconds)

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            res = await client.request(
                method=method,
                url=url,
                params=params,
                json=json_body,
            )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail=f"Upstream unavailable: {exc}") from exc

    if res.status_code >= 400:
        detail: Any
        try:
            detail = res.json()
        except ValueError:
            detail = res.text
        raise HTTPException(status_code=res.status_code, detail=detail)

    try:
        return res.json()
    except ValueError:
        return {"detail": res.text}
