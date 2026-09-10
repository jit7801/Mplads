import os

class Settings:
    PROJECT_NAME: str = "Explainable Risk Intelligence Layer for MPLADS"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Base Data Paths
    DATA_PATH: str = os.getenv("MPLADS_DATA_PATH", "data/synthetic_mplads_works.csv")
    
    # Default Risk Dimension Weights (Total = 100)
    WEIGHT_FINANCIAL: int = 30
    WEIGHT_DELAY: int = 30
    WEIGHT_DUPLICATE: int = 25
    WEIGHT_COMPLIANCE: int = 15
    
    # Cost Anomaly Thresholds
    COST_EXTREME_RATIO: float = 1.80
    COST_HIGH_RATIO: float = 1.45
    MODIFIED_Z_THRESHOLD: float = 2.5
    
    # Progress & Delay Thresholds
    GAP_CRITICAL: float = 30.0   # 30% progress gap
    GAP_HIGH: float = 18.0       # 18% progress gap
    DORMANCY_DAYS_STALE: int = 90
    
    # Duplicate Thresholds
    SPATIAL_RADIUS_METERS: float = 150.0
    DUPLICATE_ALERT_THRESHOLD: float = 0.70

settings = Settings()
