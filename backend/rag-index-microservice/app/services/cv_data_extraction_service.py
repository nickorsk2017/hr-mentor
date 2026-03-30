from __future__ import annotations


from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import settings
from app.prompts.index_to_vector_db import (
    EXTRACT_CV_FOR_INDEX_FIELDS,
    EXTRACT_CV_FOR_INDEX_PROMPT,
)
from app.schemas.cv_extraction import CvExtractionRecord
from app.utils import strip_html_to_text


def _get_llm_client() -> ChatOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not set (required for CV extraction)")

    return ChatOpenAI(
        model=settings.openai_chat_model,
        api_key=settings.openai_api_key,
        temperature=0,
    )

async def extract_cv_data_for_index(cv_html: str) -> CvExtractionRecord:
    """
    Use OpenAI GPT-4o-mini to derive summary, skills, and years_expereance from raw CV text.
    """
    plain_cv = strip_html_to_text(cv_html)


    llm = _get_llm_client()
    structured = llm.with_structured_output(CvExtractionRecord)

    return structured.invoke(
        [
            SystemMessage(
                content=EXTRACT_CV_FOR_INDEX_PROMPT.format(
                    FIELDS=EXTRACT_CV_FOR_INDEX_FIELDS,
                ),
            ),
            HumanMessage(content=plain_cv),
        ]
    )
