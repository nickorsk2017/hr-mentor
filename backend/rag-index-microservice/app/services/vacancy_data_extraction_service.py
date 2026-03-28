from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import settings
from app.prompts.index_to_vector_db import EXTRACT_JOB_DESCRIPTION_PROMPT, EXTRACT_JOB_FIELDS
from app.schemas.vacancy_index import VacancyIndexRecord
from app.utils import strip_html_to_text


def _build_prompt(
    title: str,
    company: str | None,
    description_html: str,
) -> str:
    description = strip_html_to_text(description_html)
    parts = [
        f"Job title : {title or '(empty)'}",
        f"Company: {company or '(unknown)'}",
        "Job description:",
        description or "(empty)",
    ]
    return "\n".join(parts)


async def extract_vacancy_data_for_index(
    title: str,
    company: str | None,
    description: str,
) -> VacancyIndexRecord:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for extraction)")

    llm = ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )
    structured = llm.with_structured_output(VacancyIndexRecord)

    return structured.invoke(
        [
            SystemMessage(content=EXTRACT_JOB_DESCRIPTION_PROMPT.format(FIELDS=EXTRACT_JOB_FIELDS)),
            HumanMessage(
                content=_build_prompt(title, company, description),
            ),
        ]
    )