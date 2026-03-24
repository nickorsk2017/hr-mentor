from __future__ import annotations

import asyncio

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from ..config import settings
from app.prompts.index_to_vector_db import EXTRACT_JOB_DESCRIPTION_PROMPT, EXTRACT_JOB_FIELDS
from ..schemas.job_extraction import ExtractedJobDescription
from .text_utils import strip_html_to_text


def _build_user_message(
    title: str,
    company: str | None,
    description_html: str,
) -> str:
    plain = strip_html_to_text(description_html)
    parts = [
        f"Job title (as entered): {title or '(empty)'}",
        f"Company: {company or '(unknown)'}",
        "",
        "Job description:",
        plain or "(empty)",
    ]
    return "\n".join(parts)


def _extract_sync(
    title: str,
    company: str | None,
    description: str,
) -> ExtractedJobDescription:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for extraction)")

    llm = ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )
    structured = llm.with_structured_output(ExtractedJobDescription)

    return structured.invoke(
        [
            SystemMessage(content=EXTRACT_JOB_DESCRIPTION_PROMPT.format(FIELDS=EXTRACT_JOB_FIELDS)),
            HumanMessage(
                content=_build_user_message(title, company, description),
            ),
        ]
    )


async def extract_job_description(
    title: str,
    company: str | None,
    description: str,
) -> ExtractedJobDescription:
    return await asyncio.to_thread(_extract_sync, title, company, description)
