from __future__ import annotations

import re


_TAG_RE = re.compile(r"<[^>]+>")


def strip_html_to_text(html: str) -> str:
    """Minimal HTML stripping for embedding (no extra deps)."""
    text = _TAG_RE.sub(" ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()
