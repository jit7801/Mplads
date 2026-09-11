# MPLADS Risk Intelligence Platform

> **Explainable Risk Intelligence & Decision Support Layer for MPLADS Scheme (SIH26102)**  
> Empirical anomaly detection, geospatial duplicate indexing, and explainable decision support for Members of Parliament and District Authorities to monitor public development works, track fund utilization, and prioritize cases for human verification.

---

## 📌 Core Mission & Governance Principles

The **MPLADS Risk Intelligence Platform** operates on ten foundational government-technology principles:

1. **Detects Risk, Not Guilt**: The system identifies risk signals and statistical anomalies; it does **not** claim to automatically prove fraud or wrongdoing.
2. **Explainable AI (XAI)**: Every risk alert provides empirical, transparent justifications (peer medians, Modified Z-scores, distance metres, progress gaps, missing certificates) rather than black-box outputs.
3. **Advisory Decisions**: All generated action directives are advisory. Final authority and administrative decisions remain exclusively with authorized human officers.
4. **Data Coverage & Integrity**: Operates on official MPLADS records combined with structured benchmark cohorts, ensuring accurate evaluation of real-world reporting delays, cost variations, and contractor concentration.
5. **Calibrated Statistical Methods**: Uses robust statistics (MAD, Modified Z-score, Haversine spatial trees, sub-word TF-IDF) with unsupervised machine learning (Isolation Forest) as a secondary analytical indicator.
6. **Strict Policy Governance**: Rejection of unnormalized risk weights ($\sum = 100$) and removal of arbitrary punitive actions (e.g. replaced "Freeze funds" with *"Review fund-release eligibility according to applicable rules"*).
7. **Two-Stage Candidate Pruning**: Scalable $O(N \log N)$ spatial indexing (`BallTree`) to prune candidate pairs before computing expensive string similarities.
8. **Multi-Tier Cohort Fallbacks**: Prevents misleading scores on small sample sizes by cascading from district to state to national cohorts.
9. **Role Scoping & Privacy**: Distinct views for District Magistrates, State Nodal Officers, MPs, Central Ministry, and Citizens (with citizen views strictly scoped to public asset data).
10. **Extensible Production Roadmap**: Ready for authorized government database integration (PostgreSQL / PostGIS and Jan Parichay Single Sign-On).

---

## 🚀 Key Modules & AI Engines

```
MPLADS / Authorized Data
          ↓
[ 1. Ingestion Data Validator ]
   - Work ID uniqueness & format checks
   - Non-negative expenditure & budget bounds
   - India coordinate bounding box (Lat: 8–37.5°N, Lon: 68–97.5°E)
   - Temporal chronology (Sanction ≥ Rec, Start ≥ Sanction, Completion ≥ Start)
   - Status consistency checks (Completed vs Ongoing)
          ↓
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 2. Cost Engine  │ 3. Delay Engine │ 4. Duplicate    │ 5. Compliance   │
│                 │                 │    Engine       │    Engine       │
│ • District/     │ • Centralized   │ • O(N log N)    │ • Disaggregated │
│   State/National│   Eval Date     │   BallTree      │   statutory     │
│   cohort tiers  │ • Fiscal vs     │   Spatial Index │   signals       │
│ • Unit cost     │   physical gap  │ • Sub-word      │ • Completion UC,│
│   normalization │ • Dormancy &    │   TF-IDF        │   Asset Reg,    │
│ • Robust MAD &  │   overdue       │   char-ngrams   │   Geo photo     │
│   Modified Z    │   clocks        │ • Possible      │ • 0–15 score    │
│ • Isolation     │ • 0–30 delay    │   Overlap       │   breakdown     │
│   Forest (XAI)  │   score         │   Candidate     │                 │
│ • 0–30 score    │                 │ • 0–25 score    │                 │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
          ↓
[ 6. Unified Risk Engine ]
   - 0–100 Risk Priority Score (Low: 0–29, Medium: 30–59, High: 60–79, Critical: 80–100)
   - Forensic Evidence Checklist
   - Advisory Administrative Recommendations
          ↓
[ 7. Priority Queue & Decision Support ]
   - Field Inspection Directives
   - Lok Sabha 543 MP Allocation Directory
   - Interactive GIS Leaflet Map
```

---

## 🛠️ Tech Stack

- **Backend**: Python 3.12+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn (`BallTree`, `TfidfVectorizer`, `IsolationForest`), Pytest
- **Frontend**: React 19, Vite 8, TailwindCSS, Lucide Icons, Leaflet / React-Leaflet, Recharts
- **Data Architecture**: In-memory analytical cache with isolated repository abstractions ready for PostGIS / PostgreSQL migration.

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run full automated test suite (21 tests)
python3 -m pytest tests -v

# Start FastAPI server (runs on http://localhost:8001)
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```
API Documentation:
- Swagger UI: [http://localhost:8001/docs](http://localhost:8001/docs)
- ReDoc: [http://localhost:8001/redoc](http://localhost:8001/redoc)

### 3. Frontend Setup
```bash
# From workspace root or inside frontend/
npm run dev

# Or for production bundle build:
npm run build
```
Access the dashboard at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Verification & Test Suite

Run the full automated test suite covering all modules:
```bash
python3 -m pytest backend/tests -v
```

### Coverage Summary (21 / 21 Passed):
- `test_validation.py`: Negative amounts detection, India coordinate bounding checks, temporal chronology consistency, clean record pass-through.
- `test_engines.py`: Haversine distance, multi-tier cohort fallback, zero-MAD safe handling, unit cost extraction, delay stagnation, centralized evaluation date configuration, BallTree duplicate indexing, compliance signal disaggregation, unified risk scoring, and 543 MP allocation calculations.
- `test_api.py`: REST endpoint contracts (`/health`, `/summary`, `/works`, `/explanation`, `/map/layers`, `/mps`, `/states`), coordinate bounds in GeoJSON, and strict Pydantic model weight validation ($\sum = 100$).

---

## ⚖️ Governance & Ethical Safeguards

- **No Guilt Inferences**: Outputs indicate **Risk Priority Score**, never "Fraud Probability".
- **No Automatic Punitive Actions**: Directives use *"Review fund-release eligibility according to applicable rules"*, never "Freeze funds".
- **Human in the Loop**: AI ranks and prioritizes; authorized officers inspect, verify, and decide.
- **Audit Trail**: Every inspection notice generates a verifiable order draft with ground verification officer assignment.

---

## 📄 License & Attribution
Developed for the **Smart India Hackathon (SIH26102)** problem statement on explainable risk intelligence and decision support for public MPLADS development works.
