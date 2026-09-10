from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
import pandas as pd
from app.core.config import settings
from app.engines.risk_engine import run_full_risk_pipeline

router = APIRouter()

# In-memory storage for cached analysis results
_DATA_CACHE = {
    "df": None,
    "works": [],
    "works_map": {},
    "summary": {},
    "dup_pairs": [],
    "cohort_stats": {}
}

def load_and_run_pipeline():
    try:
        df = pd.read_csv(settings.DATA_PATH)
    except Exception as e:
        # Fallback to relative path if run from different cwd
        df = pd.read_csv("../data/synthetic_mplads_works.csv")
        
    # Replace NaN values with empty string or sensible defaults for clean JSON serialization
    df = df.fillna("")
    _DATA_CACHE["df"] = df
    works, summary, dup_pairs, cohort_stats = run_full_risk_pipeline(df)
    _DATA_CACHE["works"] = works
    _DATA_CACHE["works_map"] = {w["work_id"]: w for w in works}
    _DATA_CACHE["summary"] = summary
    _DATA_CACHE["dup_pairs"] = dup_pairs
    _DATA_CACHE["cohort_stats"] = cohort_stats
    print(f"[PIPELINE INITIALIZED] Loaded {len(works)} evaluated records.")

class RecalculateRequest(BaseModel):
    weight_financial: float = 30.0
    weight_delay: float = 30.0
    weight_duplicate: float = 25.0
    weight_compliance: float = 15.0

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "total_works": len(_DATA_CACHE["works"])
    }

@router.get("/summary")
def get_summary(district: Optional[str] = None, state: Optional[str] = None):
    """Returns high-level KPI metrics for executive overview."""
    works = _DATA_CACHE["works"]
    if state:
        works = [w for w in works if w["state"] == state]
    if district:
        works = [w for w in works if w["district"] == district]
        
    crit = sum(1 for w in works if w["risk_level"] == "CRITICAL")
    high = sum(1 for w in works if w["risk_level"] == "HIGH")
    med = sum(1 for w in works if w["risk_level"] == "MEDIUM")
    low = sum(1 for w in works if w["risk_level"] == "LOW")
    total_amt = sum(w["sanctioned_amount"] for w in works)
    flagged_amt = sum(w["sanctioned_amount"] for w in works if w["risk_level"] in ["CRITICAL", "HIGH"])
    
    return {
        "total_works": len(works),
        "critical_count": crit,
        "high_count": high,
        "medium_count": med,
        "low_count": low,
        "total_sanctioned_amount": round(total_amt, 2),
        "flagged_amount": round(flagged_amt, 2),
        "cost_anomalies_count": sum(1 for w in works if w["financial_risk"] >= 15),
        "stagnation_count": sum(1 for w in works if w["delay_risk"] >= 14),
        "duplicate_candidates_count": len(_DATA_CACHE["dup_pairs"]),
        "missing_docs_count": sum(1 for w in works if w["compliance_risk"] >= 5)
    }

@router.get("/works")
def get_works(
    state: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_score: Optional[int] = Query(None, ge=0, le=100),
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0)
):
    """Returns filtered and paginated list of works ordered by risk priority."""
    items = _DATA_CACHE["works"]
    
    if state:
        items = [w for w in items if w["state"].lower() == state.lower()]
    if district:
        items = [w for w in items if w["district"].lower() == district.lower()]
    if category:
        items = [w for w in items if w["work_category"].lower() == category.lower()]
    if risk_level:
        items = [w for w in items if w["risk_level"].upper() == risk_level.upper()]
    if min_score is not None:
        items = [w for w in items if w["overall_risk_score"] >= min_score]
    if search:
        s_lower = search.lower()
        items = [
            w for w in items 
            if s_lower in w["work_title"].lower() 
            or s_lower in w["work_id"].lower() 
            or s_lower in w["district"].lower()
            or s_lower in w.get("implementing_agency", "").lower()
        ]
        
    total = len(items)
    paginated = items[offset : offset + limit]
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": paginated
    }

@router.get("/works/{work_id}")
def get_work_by_id(work_id: str):
    """Returns complete record of a single project."""
    work = _DATA_CACHE["works_map"].get(work_id)
    if not work:
        raise HTTPException(status_code=404, detail=f"Work ID {work_id} not found.")
    return work

@router.get("/works/{work_id}/explanation")
def get_work_explanation(work_id: str):
    """Returns forensic explainability dossier for a specific project."""
    work = _DATA_CACHE["works_map"].get(work_id)
    if not work:
        raise HTTPException(status_code=404, detail=f"Work ID {work_id} not found.")
        
    c_eval = work.get("cost_evaluation", {})
    cohort_stats = c_eval.get("cohort_stats", None)
    
    # Check if there is an associated duplicate pair
    dup_match = None
    u_eval = work.get("duplicate_evaluation", {})
    if u_eval.get("has_candidate") and u_eval.get("paired_work_id"):
        paired_id = u_eval["paired_work_id"]
        paired_work = _DATA_CACHE["works_map"].get(paired_id)
        if paired_work:
            dup_match = {
                "paired_work_id": paired_id,
                "paired_work": paired_work,
                "distance_meters": u_eval.get("distance_meters"),
                "text_similarity": u_eval.get("text_similarity"),
                "combined_score": u_eval.get("combined_score")
            }
            
    return {
        "work_id": work["work_id"],
        "work_title": work["work_title"],
        "work_category": work["work_category"],
        "district": work["district"],
        "state": work["state"],
        "overall_risk_score": work["overall_risk_score"],
        "risk_level": work["risk_level"],
        "primary_risk_factor": work["primary_risk_factor"],
        "component_breakdown": {
            "financial_risk": {"score": work["financial_risk"], "max": 30},
            "delay_risk": {"score": work["delay_risk"], "max": 30},
            "duplicate_risk": {"score": work["duplicate_risk"], "max": 25},
            "compliance_risk": {"score": work["compliance_risk"], "max": 15}
        },
        "evidence_summary": work["evidence_summary"],
        "recommended_action": work["recommended_action"],
        "cost_evaluation": c_eval,
        "delay_evaluation": work.get("delay_evaluation", {}),
        "duplicate_evaluation": u_eval,
        "cohort_stats": cohort_stats,
        "duplicate_match": dup_match
    }

@router.get("/anomalies/duplicates")
def get_duplicate_candidates():
    """Returns candidate duplicate and overlapping work pairs for side-by-side verification."""
    return {
        "total_pairs": len(_DATA_CACHE["dup_pairs"]),
        "pairs": _DATA_CACHE["dup_pairs"]
    }

@router.get("/map/layers")
def get_map_layers(state: Optional[str] = None, district: Optional[str] = None):
    """Returns GeoJSON FeatureCollection of all works color-coded by risk."""
    works = _DATA_CACHE["works"]
    if state:
        works = [w for w in works if w["state"] == state]
    if district:
        works = [w for w in works if w["district"] == district]
        
    features = []
    for w in works:
        if w.get("latitude") and w.get("longitude"):
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [w["longitude"], w["latitude"]]
                },
                "properties": {
                    "work_id": w["work_id"],
                    "work_title": w["work_title"],
                    "work_category": w["work_category"],
                    "district": w["district"],
                    "state": w["state"],
                    "overall_risk_score": w["overall_risk_score"],
                    "risk_level": w["risk_level"],
                    "primary_risk_factor": w["primary_risk_factor"],
                    "sanctioned_amount": w["sanctioned_amount"],
                    "physical_progress": w["physical_progress"],
                    "financial_progress": w["financial_progress"]
                }
            })
            
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.post("/simulate/recalculate")
def recalculate_risk_scores(req: RecalculateRequest):
    """Dynamically re-evaluates all scores when hackathon judges adjust weight sliders."""
    df = _DATA_CACHE["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Data not loaded")
        
    works, summary, dup_pairs, cohort_stats = run_full_risk_pipeline(
        df,
        weight_financial=req.weight_financial,
        weight_delay=req.weight_delay,
        weight_duplicate=req.weight_duplicate,
        weight_compliance=req.weight_compliance
    )
    _DATA_CACHE["works"] = works
    _DATA_CACHE["works_map"] = {w["work_id"]: w for w in works}
    _DATA_CACHE["summary"] = summary
    _DATA_CACHE["dup_pairs"] = dup_pairs
    _DATA_CACHE["cohort_stats"] = cohort_stats
    
    return {
        "message": "Risk scores successfully recalculated",
        "new_summary": summary
    }
