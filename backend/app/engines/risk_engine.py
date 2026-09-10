import pandas as pd
from app.engines.cost_engine import compute_cost_anomalies
from app.engines.delay_engine import compute_delay_and_stagnation
from app.engines.duplicate_engine import compute_duplicates_and_overlaps

def compute_compliance_risk(row: pd.Series) -> tuple[int, list[str]]:
    """Evaluates documentation completeness and statutory compliance."""
    score = 0
    reasons = []
    status = row.get("status", "")
    fin_prog = float(row.get("financial_progress", 0.0))
    
    comp_cert = bool(row.get("completion_certificate", False))
    util_cert = bool(row.get("utilization_certificate", False))
    photo = bool(row.get("photo_available", False))
    asset_reg = bool(row.get("asset_register_entry", False))
    
    if status == "COMPLETED" and not comp_cert:
        score += 5
        reasons.append("Project marked complete but Completion Certificate is missing.")
        
    if fin_prog >= 75.0 and not util_cert:
        score += 5
        reasons.append(f"Financial disbursement reached {fin_prog:.1f}% without submitted Utilization Certificate.")
        
    if not photo:
        score += 3
        reasons.append("No geo-tagged physical progress photograph uploaded to portal.")
        
    if not asset_reg:
        score += 2
        reasons.append("Work not yet formally entered in District Asset Register.")
        
    return min(score, 15), reasons

def run_full_risk_pipeline(
    df: pd.DataFrame,
    weight_financial: float = 30.0,
    weight_delay: float = 30.0,
    weight_duplicate: float = 25.0,
    weight_compliance: float = 15.0
) -> tuple[list[dict], dict, list[dict], dict]:
    """
    Executes all three analytical engines and compliance checks,
    synthesizing an explainable 0-100 Unified Risk Score for every project.
    """
    cost_res, cohort_stats = compute_cost_anomalies(df)
    delay_res = compute_delay_and_stagnation(df)
    dup_res, dup_pairs = compute_duplicates_and_overlaps(df)
    
    combined_works = []
    
    total_weight = weight_financial + weight_delay + weight_duplicate + weight_compliance
    w_fin_norm = weight_financial / 30.0
    w_del_norm = weight_delay / 30.0
    w_dup_norm = weight_duplicate / 25.0
    w_cmp_norm = weight_compliance / 15.0
    
    for _, row in df.iterrows():
        w_id = row["work_id"]
        c_eval = cost_res.get(w_id, {"financial_risk_score": 0, "explanation": ""})
        d_eval = delay_res.get(w_id, {"delay_risk_score": 0, "explanation": ""})
        u_eval = dup_res.get(w_id, {"duplicate_risk_score": 0, "explanation": ""})
        
        comp_score_raw, comp_reasons = compute_compliance_risk(row)
        
        fin_score = round(c_eval["financial_risk_score"] * w_fin_norm)
        del_score = round(d_eval["delay_risk_score"] * w_del_norm)
        dup_score = round(u_eval["duplicate_risk_score"] * w_dup_norm)
        cmp_score = round(comp_score_raw * w_cmp_norm)
        
        total_score = min(100, max(0, fin_score + del_score + dup_score + cmp_score))
        
        if total_score >= 80:
            level = "CRITICAL"
        elif total_score >= 60:
            level = "HIGH"
        elif total_score >= 30:
            level = "MEDIUM"
        else:
            level = "LOW"
            
        # Compile forensic evidence bullet points
        evidence = []
        if c_eval["financial_risk_score"] >= 15:
            evidence.append(c_eval["explanation"])
        if d_eval["delay_risk_score"] >= 12:
            evidence.append(d_eval["explanation"])
        if u_eval["duplicate_risk_score"] >= 10:
            evidence.append(u_eval["explanation"])
        evidence.extend(comp_reasons)
        
        if not evidence:
            evidence.append("Work metrics and milestone progress track within expected cohort parameters.")
            
        # Determine primary risk driver
        scores_map = {
            "Cost Anomaly": fin_score,
            "Delay & Stagnation": del_score,
            "Duplicate Overlap": dup_score,
            "Compliance Deficit": cmp_score
        }
        primary_driver = max(scores_map, key=scores_map.get)
        if total_score < 30:
            primary_driver = "Routine Oversight"
            
        # Formulate actionable inspection recommendation
        actions = []
        if u_eval["duplicate_risk_score"] >= 10:
            actions.append("Dispatch field verification officer to verify whether nearby project is a separate physical asset.")
        if d_eval["delay_risk_score"] >= 15:
            actions.append("Issue administrative inquiry regarding progress disparity and stalled milestones.")
        if c_eval["financial_risk_score"] >= 18:
            actions.append("Re-audit bill of quantities (BOQ) and rate approvals against District Schedule of Rates (DSR).")
        if comp_score_raw >= 5:
            actions.append("Freeze further fund releases pending submission of statutory Utilization/Completion certificates.")
            
        rec_action = " ".join(actions) if actions else "Maintain standard periodic oversight."
        
        work_record = {
            **row.to_dict(),
            "overall_risk_score": total_score,
            "risk_level": level,
            "financial_risk": fin_score,
            "delay_risk": del_score,
            "duplicate_risk": dup_score,
            "compliance_risk": cmp_score,
            "primary_risk_factor": primary_driver,
            "evidence_summary": evidence,
            "recommended_action": rec_action,
            "cost_evaluation": c_eval,
            "delay_evaluation": d_eval,
            "duplicate_evaluation": u_eval,
            "compliance_reasons": comp_reasons
        }
        combined_works.append(work_record)
        
    # Sort combined works by overall risk score descending
    combined_works.sort(key=lambda x: x["overall_risk_score"], reverse=True)
    
    # Calculate executive summary statistics
    summary = {
        "total_works": len(combined_works),
        "critical_count": sum(1 for w in combined_works if w["risk_level"] == "CRITICAL"),
        "high_count": sum(1 for w in combined_works if w["risk_level"] == "HIGH"),
        "medium_count": sum(1 for w in combined_works if w["risk_level"] == "MEDIUM"),
        "low_count": sum(1 for w in combined_works if w["risk_level"] == "LOW"),
        "total_sanctioned_amount": round(sum(w["sanctioned_amount"] for w in combined_works), 2),
        "flagged_amount": round(sum(w["sanctioned_amount"] for w in combined_works if w["risk_level"] in ["CRITICAL", "HIGH"]), 2),
        "cost_anomalies_count": sum(1 for w in combined_works if w["financial_risk"] >= 15),
        "stagnation_count": sum(1 for w in combined_works if w["delay_risk"] >= 14),
        "duplicate_candidates_count": len(dup_pairs),
        "missing_docs_count": sum(1 for w in combined_works if w["compliance_risk"] >= 5)
    }
    
    return combined_works, summary, dup_pairs, cohort_stats
