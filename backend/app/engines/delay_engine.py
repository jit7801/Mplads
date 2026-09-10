from datetime import datetime
import pandas as pd

def compute_delay_and_stagnation(df: pd.DataFrame, eval_date_str: str = "2024-09-15") -> dict:
    """
    Evaluates timeline drift, progress mismatches (financial expenditure outpacing physical milestones),
    and project dormancy clocks.
    Returns a dict mapping work_id to delay risk profile and explanation.
    """
    results = {}
    eval_date = datetime.strptime(eval_date_str, "%Y-%m-%d")
    
    for _, row in df.iterrows():
        w_id = row["work_id"]
        phys_prog = float(row.get("physical_progress", 0.0))
        fin_prog = float(row.get("financial_progress", 0.0))
        status = row.get("status", "IN_PROGRESS")
        
        # Calculate Progress Gap
        progress_gap = fin_prog - phys_prog
        
        # Parse Dates
        last_update_str = row.get("last_update_date", "")
        exp_comp_str = row.get("expected_completion_date", "")
        
        days_dormant = 0
        if last_update_str:
            try:
                l_date = datetime.strptime(last_update_str, "%Y-%m-%d")
                days_dormant = max(0, (eval_date - l_date).days)
            except Exception:
                days_dormant = 0
                
        days_overdue = 0
        if exp_comp_str and status != "COMPLETED":
            try:
                e_date = datetime.strptime(exp_comp_str, "%Y-%m-%d")
                days_overdue = max(0, (eval_date - e_date).days)
            except Exception:
                days_overdue = 0
                
        # Score calculation (Max 30 points)
        score = 0
        explanation_parts = []
        is_stagnant = False
        
        # Factor 1: Financial vs Physical Mismatch (Max 14 pts)
        if progress_gap >= 35.0:
            score += 14
            is_stagnant = True
            explanation_parts.append(
                f"Financial progress ({fin_prog:.1f}%) significantly outpaces verified physical progress ({phys_prog:.1f}%) with a {progress_gap:.1f}% mismatch gap."
            )
        elif progress_gap >= 20.0:
            score += 9
            explanation_parts.append(
                f"Financial expenditure ({fin_prog:.1f}%) is substantially ahead of physical completion ({phys_prog:.1f}%)."
            )
        elif progress_gap >= 10.0:
            score += 4
            explanation_parts.append(
                f"Mild progress disparity ({progress_gap:.1f}% gap between finance and physical progress)."
            )
        else:
            if status == "COMPLETED":
                explanation_parts.append("Milestones fully completed and balanced.")
            else:
                explanation_parts.append("Financial drawdown corresponds proportionally with physical work.")
                
        # Factor 2: Inactivity Clock (Max 8 pts)
        if days_dormant >= 90 and status != "COMPLETED":
            score += 8
            is_stagnant = True
            explanation_parts.append(f"No inspection or progress update recorded for {days_dormant} days.")
        elif days_dormant >= 45 and status != "COMPLETED":
            score += 4
            explanation_parts.append(f"No milestone updates recorded for {days_dormant} days.")
            
        # Factor 3: Deadline Overrun (Max 8 pts)
        if days_overdue >= 120:
            score += 8
            explanation_parts.append(f"Target completion deadline exceeded by {days_overdue} days.")
        elif days_overdue >= 45:
            score += 4
            explanation_parts.append(f"Project is currently {days_overdue} days behind scheduled deadline.")
            
        results[w_id] = {
            "delay_risk_score": min(score, 30),
            "max_score": 30,
            "physical_progress": phys_prog,
            "financial_progress": fin_prog,
            "progress_gap": round(progress_gap, 2),
            "days_dormant": days_dormant,
            "days_overdue": days_overdue,
            "is_stagnant": is_stagnant,
            "explanation": " ".join(explanation_parts)
        }
        
    return results
