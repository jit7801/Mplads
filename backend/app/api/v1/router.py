import os
import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field, model_validator
import pandas as pd
from app.core.config import settings
from app.engines.risk_engine import run_full_risk_pipeline

logger = logging.getLogger("mplads.api")
router = APIRouter()

# In-memory storage for cached analysis results
_DATA_CACHE: Dict[str, Any] = {
    "df": None,
    "works": [],
    "works_map": {},
    "summary": {},
    "dup_pairs": [],
    "cohort_stats": {},
    "mps_df": None,
    "mps_list": [],
    "mps_map": {}
}

def normalize_mp_token(name: str) -> str:
    """Strips honorifics, punctuation, and whitespace for robust MP matching."""
    s = str(name).strip().lower()
    for prefix in ("shri ", "smt ", "dr. ", "dr ", "hon. ", "hon'ble "):
        if s.startswith(prefix):
            s = s[len(prefix):].strip()
    return "".join(ch for ch in s if ch.isalnum())

def compute_mp_metrics(mps_df: pd.DataFrame, works: list[dict]) -> tuple[list[dict], dict]:
    # Index works by normalized MP token and by constituency token
    works_by_mp_token: Dict[str, list[dict]] = {}
    works_by_constituency: Dict[str, list[dict]] = {}
    
    for w in works:
        mp = str(w.get("mp_name", "")).strip()
        const = str(w.get("constituency", "")).strip()
        if mp:
            tok = normalize_mp_token(mp)
            if tok:
                works_by_mp_token.setdefault(tok, []).append(w)
        if const:
            c_tok = normalize_mp_token(const)
            if c_tok:
                works_by_constituency.setdefault(c_tok, []).append(w)
            
    mp_list = []
    mp_map = {}
    
    for _, row in mps_df.iterrows():
        mp_name = str(row.get("mp_name", "")).strip()
        state = str(row.get("state", "")).strip()
        constituency = str(row.get("constituency", "")).strip()
        raw_allocated = row.get("allocated_amount", 147000000.0)
        try:
            allocated = float(raw_allocated)
        except (ValueError, TypeError):
            allocated = 147000000.0
            
        # Match by normalized MP name first, then fallback to constituency
        mp_tok = normalize_mp_token(mp_name)
        const_tok = normalize_mp_token(constituency)
        mp_works = works_by_mp_token.get(mp_tok) or works_by_constituency.get(const_tok) or []
        
        total_sanctioned = sum(float(w.get("sanctioned_amount", 0.0)) for w in mp_works)
        total_spent = sum(float(w.get("actual_expenditure", 0.0)) for w in mp_works)
        high_risk_count = sum(1 for w in mp_works if w.get("risk_level") in ["CRITICAL", "HIGH"])
        avg_risk = round(sum(float(w.get("overall_risk_score", 0.0)) for w in mp_works) / len(mp_works), 1) if mp_works else 0.0
        util_rate = round((total_sanctioned / allocated * 100.0), 2) if allocated > 0 else 0.0
        rem_balance = round(max(0.0, allocated - total_sanctioned), 2)
        
        # Safe integer parsing for sr_no
        sr_val = row.get("sr_no", 0)
        try:
            sr_no = int(float(sr_val)) if pd.notna(sr_val) and str(sr_val).strip() != "" else 0
        except (ValueError, TypeError):
            sr_no = 0
            
        entry = {
            "sr_no": sr_no,
            "state": state,
            "mp_name": mp_name,
            "constituency": constituency,
            "allocated_amount": allocated,
            "total_works": len(mp_works),
            "total_sanctioned_amount": round(total_sanctioned, 2),
            "total_expenditure": round(total_spent, 2),
            "remaining_balance": rem_balance,
            "utilization_percentage": util_rate,
            "high_risk_works_count": high_risk_count,
            "average_risk_score": avg_risk
        }
        mp_list.append(entry)
        mp_map[mp_name.lower()] = entry
        if const_tok:
            mp_map[constituency.lower()] = entry
        
    return mp_list, mp_map

def load_and_run_pipeline():
    logger.info("Loading MPLADS analytical pipeline...")
    # Multi-candidate path search for works dataset
    df = None
    works_candidates = [
        settings.DATA_PATH,
        "data/synthetic_mplads_works.csv",
        "../data/synthetic_mplads_works.csv",
        "../../data/synthetic_mplads_works.csv"
    ]
    for c in works_candidates:
        if c and os.path.exists(c):
            try:
                df = pd.read_csv(c)
                break
            except Exception:
                continue
                
    if df is None:
        logger.error("Could not find works dataset in any standard candidate paths. Initializing empty.")
        df = pd.DataFrame()
        
    _DATA_CACHE["df"] = df
    works, summary, dup_pairs, cohort_stats = run_full_risk_pipeline(df)
    _DATA_CACHE["works"] = works
    _DATA_CACHE["works_map"] = {w["work_id"]: w for w in works}
    _DATA_CACHE["summary"] = summary
    _DATA_CACHE["dup_pairs"] = dup_pairs
    _DATA_CACHE["cohort_stats"] = cohort_stats
    
    # Multi-candidate path search for MP Allocations dataset
    mps_df = None
    mps_candidates = [
        settings.MP_DATA_PATH,
        "data/mp_allocations.csv",
        "../data/mp_allocations.csv",
        "../../data/mp_allocations.csv"
    ]
    for c in mps_candidates:
        if c and os.path.exists(c):
            try:
                mps_df = pd.read_csv(c)
                break
            except Exception:
                continue
                
    if mps_df is None:
        mps_df = pd.DataFrame()
            
    _DATA_CACHE["mps_df"] = mps_df
    if not mps_df.empty:
        mps_list, mps_map = compute_mp_metrics(mps_df, works)
        _DATA_CACHE["mps_list"] = mps_list
        _DATA_CACHE["mps_map"] = mps_map
        logger.info(f"[PIPELINE INITIALIZED] Loaded {len(works)} works & {len(mps_list)} MP records.")
    else:
        logger.info(f"[PIPELINE INITIALIZED] Loaded {len(works)} works.")

class RecalculateRequest(BaseModel):
    weight_financial: float = Field(30.0, ge=0.0, le=100.0, description="Financial Risk dimension weight")
    weight_delay: float = Field(30.0, ge=0.0, le=100.0, description="Delay & Stagnation dimension weight")
    weight_duplicate: float = Field(25.0, ge=0.0, le=100.0, description="Duplicate Overlap dimension weight")
    weight_compliance: float = Field(15.0, ge=0.0, le=100.0, description="Statutory Compliance dimension weight")

    @model_validator(mode="after")
    def validate_weights_sum(self):
        total = self.weight_financial + self.weight_delay + self.weight_duplicate + self.weight_compliance
        if abs(total - 100.0) > 0.01:
            raise ValueError(f"Total risk weights must sum to exactly 100.0. Current total is {total:.1f}.")
        return self

@router.get("/health")
def health_check():
    """Service liveness & pipeline readiness health check."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "total_works": len(_DATA_CACHE["works"]),
        "evaluation_date": settings.EVALUATION_DATE,
        "is_demo_mode": settings.IS_DEMO_MODE,
        "data_provenance": settings.DATA_SOURCE_LABEL
    }

@router.get("/summary")
def get_summary(district: Optional[str] = None, state: Optional[str] = None):
    """Returns high-level KPI metrics for executive overview with data provenance."""
    works = _DATA_CACHE["works"]
    if state:
        works = [w for w in works if w["state"].lower() == state.lower()]
    if district:
        works = [w for w in works if w["district"].lower() == district.lower()]
        
    crit = sum(1 for w in works if w["risk_level"] == "CRITICAL")
    high = sum(1 for w in works if w["risk_level"] == "HIGH")
    med = sum(1 for w in works if w["risk_level"] == "MEDIUM")
    low = sum(1 for w in works if w["risk_level"] == "LOW")
    total_amt = sum(float(w.get("sanctioned_amount", 0.0)) for w in works)
    flagged_amt = sum(float(w.get("sanctioned_amount", 0.0)) for w in works if w["risk_level"] in ["CRITICAL", "HIGH"])
    
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
        "missing_docs_count": sum(1 for w in works if w["compliance_risk"] >= 5),
        "evaluation_date": settings.EVALUATION_DATE,
        "data_provenance": settings.DATA_SOURCE_LABEL,
        "is_demo_mode": settings.IS_DEMO_MODE
    }

@router.get("/works")
def get_works(
    state: Optional[str] = None,
    district: Optional[str] = None,
    constituency: Optional[str] = None,
    mp_name: Optional[str] = None,
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    min_score: Optional[int] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    """Returns filtered and paginated list of works ordered by risk priority score."""
    items = _DATA_CACHE["works"]
    
    if state:
        items = [w for w in items if w["state"].lower() == state.lower()]
    if district:
        items = [w for w in items if w["district"].lower() == district.lower()]
    if constituency:
        items = [w for w in items if w.get("constituency", "").lower() == constituency.lower()]
    if mp_name:
        items = [w for w in items if mp_name.lower() in w.get("mp_name", "").lower()]
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
            or s_lower in w.get("constituency", "").lower()
            or s_lower in w.get("mp_name", "").lower()
            or s_lower in w.get("implementing_agency", "").lower()
            or s_lower in w.get("vendor", "").lower()
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
    work = _DATA_CACHE["works_map"].get(work_id.strip())
    if not work:
        raise HTTPException(status_code=404, detail=f"Work ID '{work_id}' not found.")
    return work

@router.get("/works/{work_id}/explanation")
def get_work_explanation(work_id: str):
    """Returns forensic explainability dossier for a specific project."""
    work = _DATA_CACHE["works_map"].get(work_id.strip())
    if not work:
        raise HTTPException(status_code=404, detail=f"Work ID '{work_id}' not found.")
        
    c_eval = work.get("cost_evaluation", {})
    u_eval = work.get("duplicate_evaluation", {})
    dup_match = None
    if u_eval.get("has_candidate") and u_eval.get("paired_work_id"):
        paired_id = u_eval["paired_work_id"]
        paired_work = _DATA_CACHE["works_map"].get(paired_id)
        if paired_work:
            dup_match = {
                "paired_work_id": paired_id,
                "paired_work": paired_work,
                "distance_meters": u_eval.get("distance_meters"),
                "text_similarity": u_eval.get("text_similarity"),
                "combined_score": u_eval.get("combined_score"),
                "verification_status": u_eval.get("verification_status")
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
        "compliance_evaluation": work.get("compliance_evaluation", {}),
        "duplicate_match": dup_match,
        "data_quality_warnings": work.get("data_quality_warnings", []),
        "data_source": work.get("data_source", settings.DATA_SOURCE_LABEL),
        "evaluation_date": settings.EVALUATION_DATE
    }

@router.get("/anomalies/duplicates")
def get_duplicate_candidates():
    """Returns spatial and semantic overlapping asset pairs for auditor inspection."""
    return {
        "total_pairs": len(_DATA_CACHE["dup_pairs"]),
        "duplicate_pairs": _DATA_CACHE["dup_pairs"]
    }

@router.get("/map/layers")
def get_map_layers(state: Optional[str] = None, district: Optional[str] = None):
    """Returns GeoJSON FeatureCollection of all works with valid coordinates, color-coded by risk."""
    works = _DATA_CACHE["works"]
    if state:
        works = [w for w in works if w["state"].lower() == state.lower()]
    if district:
        works = [w for w in works if w["district"].lower() == district.lower()]
        
    features = []
    for w in works:
        try:
            lat = float(w.get("latitude"))
            lon = float(w.get("longitude"))
            # Coordinate bounding check for India
            if 8.0 <= lat <= 37.5 and 68.0 <= lon <= 97.5:
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
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
        except (ValueError, TypeError):
            continue
            
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.post("/simulate/recalculate")
def recalculate_risk_scores(req: RecalculateRequest):
    """Dynamically re-evaluates all scores when policy sliders are adjusted. Rejects invalid weight totals."""
    df = _DATA_CACHE["df"]
    if df is None:
        raise HTTPException(status_code=500, detail="Underlying dataset not initialized.")
        
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
    
    # Recompute MP metrics
    mps_df = _DATA_CACHE.get("mps_df")
    if mps_df is not None and not mps_df.empty:
        mps_list, mps_map = compute_mp_metrics(mps_df, works)
        _DATA_CACHE["mps_list"] = mps_list
        _DATA_CACHE["mps_map"] = mps_map
        
    return {
        "message": "Risk scores successfully recalculated with calibrated policy weights",
        "calibrated_weights": {
            "financial": req.weight_financial,
            "delay": req.weight_delay,
            "duplicate": req.weight_duplicate,
            "compliance": req.weight_compliance
        },
        "new_summary": summary
    }

@router.get("/mps")
def get_mps(
    state: Optional[str] = None,
    search: Optional[str] = None,
    has_works: Optional[bool] = None,
    limit: int = 100,
    offset: int = 0
):
    """Returns directory of MPs with total allocations, sanctioned funds, expenditure, and risk profile."""
    items = _DATA_CACHE.get("mps_list", [])
    
    if state:
        items = [m for m in items if m["state"].lower() == state.lower()]
    if has_works is True:
        items = [m for m in items if m["total_works"] > 0]
    elif has_works is False:
        items = [m for m in items if m["total_works"] == 0]
    if search:
        s_lower = search.lower()
        items = [
            m for m in items 
            if s_lower in m["mp_name"].lower() 
            or s_lower in m["constituency"].lower() 
            or s_lower in m["state"].lower()
        ]
        
    total = len(items)
    paginated = items[offset : offset + limit]
    
    total_alloc = sum(m["allocated_amount"] for m in items)
    total_sanct = sum(m["total_sanctioned_amount"] for m in items)
    total_exp = sum(m["total_expenditure"] for m in items)
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "overview": {
            "total_mps": total,
            "total_allocated_amount": round(total_alloc, 2),
            "total_sanctioned_amount": round(total_sanct, 2),
            "total_expenditure": round(total_exp, 2),
            "overall_utilization_rate": round((total_sanct / total_alloc * 100.0), 2) if total_alloc > 0 else 0.0
        },
        "items": paginated
    }

@router.get("/mps/{mp_name}")
def get_mp_details(mp_name: str):
    """Returns full portfolio and risk dossiers of projects under a specific MP."""
    mp_key = mp_name.strip().lower()
    mp_meta = _DATA_CACHE.get("mps_map", {}).get(mp_key)
    
    if not mp_meta:
        for k, v in _DATA_CACHE.get("mps_map", {}).items():
            if mp_key in k or k in mp_key:
                mp_meta = v
                break
                
    if not mp_meta:
        raise HTTPException(status_code=404, detail=f"MP '{mp_name}' not found.")
        
    works = [w for w in _DATA_CACHE["works"] if mp_meta["mp_name"].lower() in str(w.get("mp_name", "")).lower()]
    
    return {
        "mp_profile": mp_meta,
        "total_works": len(works),
        "works": works
    }

@router.get("/states")
def get_state_summaries():
    """Returns state-wise summary of MP allocations, sanctioned projects, and risk metrics."""
    mps = _DATA_CACHE.get("mps_list", [])
    state_map: Dict[str, Dict[str, Any]] = {}
    for m in mps:
        st = m["state"]
        if st not in state_map:
            state_map[st] = {
                "state": st,
                "total_mps": 0,
                "total_allocated_amount": 0.0,
                "total_sanctioned_amount": 0.0,
                "total_expenditure": 0.0,
                "total_works": 0,
                "high_risk_works": 0
            }
        state_map[st]["total_mps"] += 1
        state_map[st]["total_allocated_amount"] += m["allocated_amount"]
        state_map[st]["total_sanctioned_amount"] += m["total_sanctioned_amount"]
        state_map[st]["total_expenditure"] += m["total_expenditure"]
        state_map[st]["total_works"] += m["total_works"]
        state_map[st]["high_risk_works"] += m["high_risk_works_count"]
        
    result = []
    for st, v in sorted(state_map.items()):
        alloc = v["total_allocated_amount"]
        sanct = v["total_sanctioned_amount"]
        v["utilization_percentage"] = round((sanct / alloc * 100.0), 2) if alloc > 0 else 0.0
        v["total_allocated_amount"] = round(alloc, 2)
        v["total_sanctioned_amount"] = round(sanct, 2)
        v["total_expenditure"] = round(v["total_expenditure"], 2)
        result.append(v)
        
    return {
        "total_states": len(result),
        "states": result
    }
