from pathlib import Path
import sys

_COMMON_ROOT = Path(__file__).resolve().parents[3] / "_common"
if str(_COMMON_ROOT) not in sys.path:
    sys.path.insert(0, str(_COMMON_ROOT))

from db.models.cv import CV
from db.models.vacancy import Vacancy

__all__ = ["CV", "Vacancy"]