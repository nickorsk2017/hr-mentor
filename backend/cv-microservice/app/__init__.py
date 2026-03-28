# common modules imports
from pathlib import Path
import sys

_COMMON_ROOT = Path(__file__).resolve().parents[2]
if str(_COMMON_ROOT) not in sys.path:
    sys.path.insert(0, str(_COMMON_ROOT))
