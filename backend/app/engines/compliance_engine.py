from typing import Dict, Any, Tuple, List
import pandas as pd

def evaluate_work_compliance(row: pd.Series | dict) -> Dict[str, Any]:
    """
    Evaluates documentation completeness and statutory compliance per project.
    Returns disaggregated boolean signals, score (max 15), and explicit statutory reasons.
    """
    status = str(row.get("status", "")).strip().upper()
    
    try:
        fin_prog = float(row.get("financial_progress", 0.0))
    except (ValueError, TypeError):
        fin_prog = 0.0
        
    try:
        phys_prog = float(row.get("physical_progress", 0.0))
    except (ValueError, TypeError):
        phys_prog = 0.0

    comp_cert = bool(row.get("completion_certificate", False))
    util_cert = bool(row.get("utilization_certificate", False))
    audit_cert = bool(row.get("audit_certificate", False))
    photo = bool(row.get("photo_available", False))
    asset_reg = bool(row.get("asset_register_entry", False))
    
    # 1. Disaggregated statutory signals
    missing_completion_cert = (status == "COMPLETED" and not comp_cert)
    missing_utilization_cert = (fin_prog >= 75.0 and not util_cert)
    missing_audit_cert = (status == "COMPLETED" and not audit_cert)
    missing_photo_evidence = not photo
    missing_asset_register = not asset_reg
    inconsistent_completion = (status == "COMPLETED" and phys_prog < 95.0)
    
    score = 0
    reasons: List[str] = []
    
    if missing_completion_cert:
        score += 5
        reasons.append("Project marked complete but statutory Completion Certificate is missing from records.")
        
    if missing_utilization_cert:
        score += 5
        reasons.append(f"Financial disbursement reached {fin_prog:.1f}% without submitted Utilization Certificate (UC).")
        
    if missing_photo_evidence:
        score += 3
        reasons.append("No geo-tagged physical progress photograph uploaded to official portal.")
        
    if missing_asset_register:
        score += 2
        reasons.append("Work asset not yet formally registered in District Asset Register.")
        
    if missing_audit_cert:
        score += 2
        reasons.append("Statutory third-party social audit certificate not recorded for completed work.")
        
    if inconsistent_completion:
        score += 3
        reasons.append(f"Work status recorded as COMPLETED while physical progress is only {phys_prog:.1f}%.")
        
    final_score = min(score, 15)
    
    return {
        "compliance_risk_score": final_score,
        "max_score": 15,
        "signals": {
            "missing_completion_certificate": missing_completion_cert,
            "missing_utilization_certificate": missing_utilization_cert,
            "missing_audit_certificate": missing_audit_cert,
            "missing_photo": missing_photo_evidence,
            "missing_asset_register": missing_asset_register,
            "inconsistent_completion": inconsistent_completion
        },
        "reasons": reasons if reasons else ["Statutory documentation and certificates fully in compliance."]
    }

def compute_compliance_signals(df: pd.DataFrame) -> Dict[str, Dict[str, Any]]:
    """
    Computes compliance signals across all projects in the DataFrame.
    Returns mapping of work_id -> compliance profile.
    """
    results = {}
    for _, row in df.iterrows():
        w_id = str(row["work_id"]).strip()
        results[w_id] = evaluate_work_compliance(row)
    return results
