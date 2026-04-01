from __future__ import annotations

import re


_TAG_RE = re.compile(r"<[^>]+>")


def strip_html_to_text(html: str) -> str:
    """
    Minimal HTML-to-text converter for embedding/logging.

    - Removes HTML tags
    - Preserves line breaks
    - Normalizes spaces within lines
    """
    # Replace tags with a newline so block elements roughly keep separation
    text = _TAG_RE.sub("\n", html)
    # Normalize spaces/tabs but keep explicit newlines
    text = re.sub(r"[ \t]+", " ", text)
    # Collapse 3+ consecutive newlines down to max 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Trim whitespace on each line and drop empty lines at the extremes
    lines = [line.strip() for line in text.splitlines()]
    # Remove leading/trailing empty lines but keep internal empties
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return "\n".join(lines)
