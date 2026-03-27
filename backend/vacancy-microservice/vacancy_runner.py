from __future__ import annotations

from pathlib import Path
import sys


def main() -> int:
    # Ensure local service package has import priority over other installed `app` packages.
    project_root = Path(__file__).resolve().parent
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    from app.main import main as app_main

    return app_main()
