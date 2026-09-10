import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

def compute_cost_anomalies(df: pd.DataFrame) -> dict:
    """
    Evaluates cost outliers through peer cohort stratification (Category x District),
    robust Modified Z-scores (using Median Absolute Deviation), and Isolation Forest.
    Returns a dict mapping work_id to cost risk profile and explanation.
    """
    results = {}
    
    # Stratify by (work_category, district)
    cohort_groups = df.groupby(["work_category", "district"])
    
    # Global fallback cohorts by category
    category_medians = df.groupby("work_category")["sanctioned_amount"].median().to_dict()
    
    # Store cohort summary statistics for frontend box-plot visualization
    cohort_summaries = {}
    
    for (category, district), group in cohort_groups:
        cohort_name = f"{category} — {district}"
        n_samples = len(group)
        costs = group["sanctioned_amount"].values
        
        cohort_median = float(np.median(costs))
        cohort_min = float(np.min(costs))
        cohort_max = float(np.max(costs))
        cohort_q25 = float(np.percentile(costs, 25))
        cohort_q75 = float(np.percentile(costs, 75))
        
        # Calculate Median Absolute Deviation (MAD)
        mad = float(np.median(np.abs(costs - cohort_median)))
        if mad == 0.0:
            mad = cohort_median * 0.1  # Fallback to prevent zero division
            
        cohort_summaries[cohort_name] = {
            "cohort_name": cohort_name,
            "category": category,
            "district": district,
            "sample_size": n_samples,
            "min": round(cohort_min, 2),
            "q25": round(cohort_q25, 2),
            "median": round(cohort_median, 2),
            "q75": round(cohort_q75, 2),
            "max": round(cohort_max, 2)
        }
        
        # Fit Isolation Forest if group has sufficient records, else use default scores
        iso_scores = np.zeros(n_samples)
        if n_samples >= 8:
            features = np.column_stack([
                costs,
                group["estimated_cost"].values,
                group["actual_expenditure"].values / np.maximum(group["physical_progress"].values, 1.0)
            ])
            iso = IsolationForest(contamination=0.10, random_state=42)
            iso.fit(features)
            iso_preds = iso.predict(features) # -1 for anomaly, 1 for normal
        else:
            iso_preds = np.ones(n_samples)
            
        for idx, (_, row) in enumerate(group.iterrows()):
            w_id = row["work_id"]
            cost = float(row["sanctioned_amount"])
            
            # Robust statistical metrics
            ratio = cost / (cohort_median if cohort_median > 0 else 1.0)
            mod_z = 0.6745 * (cost - cohort_median) / (mad + 1e-6)
            is_iso_anomaly = bool(iso_preds[idx] == -1)
            
            # Scoring allocation (Max 30 points)
            score = 0
            explanation_parts = []
            
            if ratio >= 1.80 or mod_z >= 3.2:
                score = 27
                explanation_parts.append(
                    f"Sanctioned cost of ₹{cost/100000:.2f}L is {ratio:.2f}× the median (₹{cohort_median/100000:.2f}L) of {n_samples} comparable {category.lower()} in {district}. Modified Z-score is {mod_z:.2f}."
                )
            elif ratio >= 1.45 or mod_z >= 2.2:
                score = 19
                explanation_parts.append(
                    f"Sanctioned cost of ₹{cost/100000:.2f}L is {ratio:.2f}× peer median (₹{cohort_median/100000:.2f}L), showing elevated expenditure."
                )
            elif ratio >= 1.20 or mod_z >= 1.4:
                score = 11
                explanation_parts.append(
                    f"Cost is moderately above the peer median ({ratio:.2f}×)."
                )
            else:
                score = 4
                explanation_parts.append(
                    f"Cost of ₹{cost/100000:.2f}L aligns with peer median (₹{cohort_median/100000:.2f}L) in {district}."
                )
                
            # Check for expenditure overshoot penalty
            actual_exp = float(row.get("actual_expenditure", 0))
            if actual_exp > 1.15 * cost:
                score = min(30, score + 4)
                explanation_parts.append(f"Actual expenditure exceeded sanctioned budget by {((actual_exp/cost)-1)*100:.1f}%.")
                
            results[w_id] = {
                "financial_risk_score": min(score, 30),
                "max_score": 30,
                "cohort_name": cohort_name,
                "cohort_median": round(cohort_median, 2),
                "work_cost": round(cost, 2),
                "cost_ratio": round(ratio, 2),
                "modified_z_score": round(mod_z, 2),
                "isolation_forest_anomaly": is_iso_anomaly,
                "cohort_stats": cohort_summaries[cohort_name],
                "explanation": " ".join(explanation_parts)
            }
            
    return results, cohort_summaries
