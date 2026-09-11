import os
from datetime import datetime, timezone
from pathlib import Path
from typing import List

def resolve_data_path() -> str:
    env_path = os.getenv("MPLADS_DATA_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    current_dir = Path(__file__).resolve().parent
    candidates = [
        current_dir.parent.parent / "data" / "synthetic_mplads_works.csv",
        current_dir.parent.parent.parent / "data" / "synthetic_mplads_works.csv",
        Path("data/synthetic_mplads_works.csv").resolve(),
        Path("../data/synthetic_mplads_works.csv").resolve(),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return "data/synthetic_mplads_works.csv"

def resolve_mp_data_path() -> str:
    env_path = os.getenv("MPLADS_MP_PATH")
    if env_path and os.path.exists(env_path):
        return env_path
    current_dir = Path(__file__).resolve().parent
    candidates = [
        current_dir.parent.parent / "data" / "mp_allocations.csv",
        current_dir.parent.parent.parent / "data" / "mp_allocations.csv",
        Path("data/mp_allocations.csv").resolve(),
        Path("../data/mp_allocations.csv").resolve(),
    ]
    for candidate in candidates:
        if candidate.exists():
            return str(candidate)
    return "data/mp_allocations.csv"

def resolve_evaluation_date() -> str:
    """
    Centralized evaluation date resolution.
    - 'today' or 'now': Uses the current UTC date (for live production).
    - Specific date string YYYY-MM-DD: Uses the specified date.
    - Default: '2024-09-15' (reproducible benchmark evaluation anchor for synthetic demonstration).
    """
    env_eval = os.getenv("MPLADS_EVALUATION_DATE", "2024-09-15").strip()
    if env_eval.lower() in ("today", "now", "auto"):
        return datetime.now(timezone.utc).strftime("%Y-%m-%d")
    return env_eval

def resolve_cors_origins() -> List[str]:
    raw = os.getenv("MPLADS_CORS_ORIGINS", "")
    if raw.strip():
        return [o.strip() for o in raw.split(",") if o.strip()]
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8001",
        "http://127.0.0.1:8001"
    ]

class Settings:
    PROJECT_NAME: str = "Explainable Risk Intelligence Layer for MPLADS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base Data Paths
    DATA_PATH: str = resolve_data_path()
    MP_DATA_PATH: str = resolve_mp_data_path()
    
    # Centralized Evaluation Date
    EVALUATION_DATE: str = resolve_evaluation_date()
    
    # Security & Networking
    CORS_ORIGINS: List[str] = resolve_cors_origins()
    
    # Default Risk Dimension Weights (Total = 100)
    WEIGHT_FINANCIAL: int = 30
    WEIGHT_DELAY: int = 30
    WEIGHT_DUPLICATE: int = 25
    WEIGHT_COMPLIANCE: int = 15
    
    # Cost Anomaly Thresholds & Cohort Settings
    MIN_PEER_SIZE: int = int(os.getenv("MPLADS_MIN_PEER_SIZE", "5"))
    COST_EXTREME_RATIO: float = float(os.getenv("MPLADS_COST_EXTREME_RATIO", "1.80"))
    COST_HIGH_RATIO: float = float(os.getenv("MPLADS_COST_HIGH_RATIO", "1.45"))
    COST_ELEVATED_RATIO: float = float(os.getenv("MPLADS_COST_ELEVATED_RATIO", "1.20"))
    MODIFIED_Z_THRESHOLD: float = float(os.getenv("MPLADS_MODIFIED_Z_THRESHOLD", "2.5"))
    
    # Progress & Delay Thresholds
    PROGRESS_GAP_CRITICAL: float = float(os.getenv("MPLADS_PROGRESS_GAP_CRITICAL", "30.0"))
    PROGRESS_GAP_WARNING: float = float(os.getenv("MPLADS_PROGRESS_GAP_WARNING", "15.0"))
    DORMANCY_WARNING_DAYS: int = int(os.getenv("MPLADS_DORMANCY_WARNING_DAYS", "45"))
    DORMANCY_CRITICAL_DAYS: int = int(os.getenv("MPLADS_DORMANCY_CRITICAL_DAYS", "90"))
    OVERDUE_WARNING_DAYS: int = int(os.getenv("MPLADS_OVERDUE_WARNING_DAYS", "45"))
    OVERDUE_CRITICAL_DAYS: int = int(os.getenv("MPLADS_OVERDUE_CRITICAL_DAYS", "120"))
    
    # Duplicate Thresholds & Weights
    SPATIAL_RADIUS_METERS: float = float(os.getenv("MPLADS_SPATIAL_RADIUS_METERS", "150.0"))
    DUPLICATE_ALERT_THRESHOLD: float = float(os.getenv("MPLADS_DUPLICATE_ALERT_THRESHOLD", "0.70"))
    DUP_WEIGHT_TEXT: float = 0.40
    DUP_WEIGHT_GEO: float = 0.30
    DUP_WEIGHT_CAT: float = 0.15
    DUP_WEIGHT_AGENCY: float = 0.10
    DUP_WEIGHT_COST: float = 0.05
    
    # Data Provenance & Source Label
    DATA_SOURCE_LABEL: str = os.getenv("MPLADS_DATA_SOURCE", "MPLADS_ESAKSHI_PIPELINE")
    IS_DEMO_MODE: bool = False

settings = Settings()
