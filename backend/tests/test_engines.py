# pyrefly: ignore [missing-import]
import pytest
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.engines.cost_engine import compute_cost_anomalies
from app.engines.delay_engine import compute_delay_and_stagnation
from app.engines.duplicate_engine import compute_duplicates_and_overlaps, haversine_distance_meters
from app.engines.risk_engine import run_full_risk_pipeline

@pytest.fixture
def sample_df():
    data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/synthetic_mplads_works.csv"))
    return pd.read_csv(data_path)

def test_haversine_distance():
    # Test known distance ~35m between planted points
    d = haversine_distance_meters(26.915000, 75.790000, 26.915250, 75.790250)
    assert 30.0 < d < 45.0

def test_cost_anomaly_flagged(sample_df):
    results, cohort_stats = compute_cost_anomalies(sample_df)
    # Work 42 should have cost ratio ~1.8x and high financial risk
    w42_cost = results["MPLAD-RJ-2024-0042"]
    assert w42_cost["financial_risk_score"] >= 25
    assert w42_cost["cost_ratio"] >= 1.6

def test_delay_stagnation_flagged(sample_df):
    results = compute_delay_and_stagnation(sample_df)
    w42_delay = results["MPLAD-RJ-2024-0042"]
    assert w42_delay["delay_risk_score"] >= 25
    assert w42_delay["is_stagnant"] is True
    assert w42_delay["progress_gap"] >= 35.0

def test_duplicate_detection(sample_df):
    per_work, candidate_pairs = compute_duplicates_and_overlaps(sample_df)
    w42_dup = per_work["MPLAD-RJ-2024-0042"]
    assert w42_dup["has_candidate"] is True
    assert w42_dup["paired_work_id"] == "MPLAD-RJ-2024-0089"
    assert w42_dup["distance_meters"] < 50.0

def test_unified_risk_score_flagship(sample_df):
    works, summary, dup_pairs, cohort_stats = run_full_risk_pipeline(sample_df)
    works_map = {w["work_id"]: w for w in works}
    w42 = works_map["MPLAD-RJ-2024-0042"]
    assert w42["overall_risk_score"] >= 80
    assert w42["risk_level"] == "CRITICAL"
    assert len(w42["evidence_summary"]) >= 4
