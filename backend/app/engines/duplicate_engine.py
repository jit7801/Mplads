import math
import re
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ABBREVIATION_MAP = {
    r"\bcc\b": "cement concrete",
    r"\bc\.c\.\b": "cement concrete",
    r"\bbt\b": "bituminous tar",
    r"\bro\b": "reverse osmosis water",
    r"\bups\b": "upper primary school",
    r"\bghs\b": "government high school",
    r"\brd\b": "road",
    r"\bln\b": "lane",
    r"\bw\b": "ward",
    r"\bwd\b": "ward",
    r"\bno\b": "number"
}

def normalize_title(text: str) -> str:
    """Normalizes text and expands common Indian public works abbreviations."""
    if not text or not isinstance(text, str):
        return ""
    text_clean = text.lower()
    for pattern, replacement in ABBREVIATION_MAP.items():
        text_clean = re.sub(pattern, replacement, text_clean)
    text_clean = re.sub(r"[^\w\s]", " ", text_clean)
    return " ".join(text_clean.split())

def haversine_distance_meters(lat1, lon1, lat2, lon2) -> float:
    """Calculates great-circle distance between two points on the Earth in metres."""
    if any(coord is None or np.isnan(coord) for coord in (lat1, lon1, lat2, lon2)):
        return 999999.0
    R = 6371000.0  # Earth's radius in metres
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def compute_duplicates_and_overlaps(df: pd.DataFrame, max_dist_meters: float = 150.0) -> tuple[dict, list]:
    """
    Two-stage duplicate and overlapping asset detection:
    1. Geospatial candidate pruning (distance <= 150 metres within district)
    2. Multi-attribute similarity scoring (normalized char-ngram TF-IDF, Category, Agency, Budget)
    """
    per_work = {}
    candidate_pairs = []
    
    for _, row in df.iterrows():
        per_work[row["work_id"]] = {
            "duplicate_risk_score": 0,
            "max_score": 25,
            "has_candidate": False,
            "paired_work_id": None,
            "paired_title": None,
            "distance_meters": None,
            "text_similarity": 0.0,
            "combined_score": 0.0,
            "explanation": "No overlapping or duplicate projects detected in immediate vicinity."
        }
        
    district_groups = df.groupby("district")
    
    for district, group in district_groups:
        records = group.to_dict("records")
        n = len(records)
        if n < 2:
            continue
            
        normalized_titles = [normalize_title(r["work_title"]) for r in records]
        
        # Use sub-word character n-grams to handle transliteration variances and compound words
        tfidf = TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))
        try:
            tfidf_matrix = tfidf.fit_transform(normalized_titles)
            text_sim_matrix = cosine_similarity(tfidf_matrix)
        except Exception:
            text_sim_matrix = np.zeros((n, n))
            
        for i in range(n):
            r_a = records[i]
            id_a = r_a["work_id"]
            lat_a, lon_a = r_a["latitude"], r_a["longitude"]
            cost_a = float(r_a["sanctioned_amount"])
            
            for j in range(i + 1, n):
                r_b = records[j]
                id_b = r_b["work_id"]
                lat_b, lon_b = r_b["latitude"], r_b["longitude"]
                cost_b = float(r_b["sanctioned_amount"])
                
                # STAGE 1: Spatial Pruning
                dist_m = haversine_distance_meters(lat_a, lon_a, lat_b, lon_b)
                if dist_m > max_dist_meters:
                    continue  # Prune out pairs beyond 150m
                    
                # STAGE 2: Multi-Attribute Matching
                s_geo = max(0.0, 1.0 - (dist_m / max_dist_meters))
                s_text = float(text_sim_matrix[i, j])
                s_cat = 1.0 if r_a.get("work_category") == r_b.get("work_category") else 0.0
                s_agency = 1.0 if r_a.get("implementing_agency") == r_b.get("implementing_agency") else 0.0
                s_cost = min(cost_a, cost_b) / max(cost_a, cost_b) if max(cost_a, cost_b) > 0 else 1.0
                
                # Weighted Duplicate Index (WDI)
                wdi = (0.40 * s_text) + (0.30 * s_geo) + (0.15 * s_cat) + (0.10 * s_agency) + (0.05 * s_cost)
                pair_score = min(25, round(wdi * 25))
                
                pair_record = {
                    "pair_id": f"{id_a}__{id_b}",
                    "work_a": r_a,
                    "work_b": r_b,
                    "distance_meters": round(dist_m, 1),
                    "text_similarity": round(s_text * 100, 1),
                    "combined_score": round(wdi * 100, 1),
                    "duplicate_risk_score": pair_score,
                    "same_category": bool(s_cat == 1.0),
                    "same_agency": bool(s_agency == 1.0),
                    "cost_ratio": round(s_cost, 2),
                    "verification_status": "PENDING_VERIFICATION",
                    "explanation": (
                        f"Potential co-located asset located {dist_m:.1f}m away. "
                        f"Text similarity between scope descriptions is {s_text*100:.1f}%. "
                        f"{'Assigned to identical implementing agency.' if s_agency else 'Assigned to different agencies.'}"
                    )
                }
                candidate_pairs.append(pair_record)
                
                for cur_id, other_r, other_id in [(id_a, r_b, id_b), (id_b, r_a, id_a)]:
                    if pair_score > per_work[cur_id]["duplicate_risk_score"]:
                        per_work[cur_id] = {
                            "duplicate_risk_score": pair_score,
                            "max_score": 25,
                            "has_candidate": True,
                            "paired_work_id": other_id,
                            "paired_title": other_r["work_title"],
                            "distance_meters": round(dist_m, 1),
                            "text_similarity": round(s_text * 100, 1),
                            "combined_score": round(wdi * 100, 1),
                            "explanation": (
                                f"Located {dist_m:.1f}m from {other_id} ('{other_r['work_title']}') "
                                f"with {s_text*100:.1f}% semantic match. Both assigned to {other_r['implementing_agency']}."
                            )
                        }
                        
    candidate_pairs.sort(key=lambda x: x["combined_score"], reverse=True)
    return per_work, candidate_pairs
