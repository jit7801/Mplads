# MPLADS Risk Intelligence Platform

> **Explainable Risk Intelligence Layer for MPLADS Scheme (SIH26102)**  
> AI-powered auditing, anomaly detection, and decision-support system for Members of Parliament and District Authorities to monitor MPLADS development works, track fund utilization, and prevent fiscal leakages.

---

## 📌 Executive Summary

The **MPLADS Risk Intelligence Platform** provides district administrators and Member of Parliament (MP) representatives with explainable, actionable insights into public development works. It identifies cost anomalies, delays, physical vs. financial progress mismatches, and potential duplicate/overlapping works before funds are disbursed.

### Core Objectives
* **Pre-empt Waste & Corruption**: Flag high-risk works and duplicate projects before funds are irreversibly committed.
* **Objective Anomaly Detection**: Benchmark project estimates against historical peer medians across similar work categories and geography.
* **Explainable AI**: Provide transparent risk breakdowns with exact mathematical justifications, evidence checklists, and inspection directives rather than black-box scores.
* **End-to-End Governance**: Empower field officers with one-click official verification notices and audit tracking.

---

## 🚀 Key Modules & AI Engines

### 1. Cost & Financial Anomaly Engine
* **Peer Group Baselining**: Calculates dynamic median costs and standard deviations across matching work categories within districts.
* **Modified Z-Score & Ratio Testing**: Identifies works deviating drastically (e.g., >80% over median cost) without technical justification.
* **Financial Mismatch Detection**: Flags projects where financial expenditure heavily outpaces verified ground physical completion (e.g., 82% spent vs. 44% physically built).

### 2. Delay & Dormancy Analytics
* **Lifecycle Milestone Tracking**: Monitors elapsed time from recommendation to administrative sanction, technical sanction, contractor award, and completion.
* **Staleness / Dormancy Detection**: Highlights stalled projects with zero recorded physical activity over 90+ days.

### 3. Geospatial & Semantic Duplicate Inspector
* **Haversine Proximity Clustering**: Calculates precise geographic distance between project coordinates to detect overlapping sites (e.g., works within 150m radius).
* **TF-IDF & N-gram Text Similarity**: Compares work titles, descriptions, and implementing agencies to surface duplicate sanctions under varied naming conventions.
* **Dual-Pane Work Dossier**: Interactive side-by-side comparison for field auditors with synchronized maps.

### 4. Unified Risk Scoring & Policy Calibration
* **Weighted Multi-Dimensional Risk**: Integrates financial, delay, duplication, and compliance risk factors into a normalized 0–100 risk score.
* **Interactive Policy Weight Tuner**: Allows district collectors to recalibrate engine sensitivities based on local priority directives.

### 5. Field Verification Directives & Audit Registry
* **Official Order Generation**: Instantly exports standardized field inspection notices with pre-filled work IDs, risk indicators, and site officer assignments.
* **Immutable Audit Trail**: Tracks historical directives and resolution logs for legislative review.

---

## 🛠️ Architecture & Tech Stack

```
voip2/
├── backend/                  # FastAPI Application
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (/works, /analytics, /duplicates, /reports)
│   │   ├── core/             # Configuration and policy thresholds
│   │   └── engines/          # Risk, Cost, Delay, and Duplicate algorithms
│   ├── tests/                # Pytest engine validation suite
│   ├── main.py               # Application entrypoint & startup pipeline
│   └── requirements.txt      # Python dependencies
├── frontend/                 # Modern React Dashboard
│   ├── src/
│   │   ├── components/       # UI Views (Overview, Dossier, Map, Duplicates, Policy)
│   │   ├── api/              # API Client & endpoint hooks
│   │   └── App.jsx           # Root layout & routing
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite build configuration
├── data/                     # Seed datasets & synthetic test distributions
├── scripts/                  # Data generators & migration scripts
└── walkthrough.md            # Detailed visual verification & UI walkthrough
```

### Technology Highlights
* **Backend**: Python 3.12+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-learn, Pytest
* **Frontend**: React 19, Vite, TailwindCSS, Lucide Icons, Leaflet / React-Leaflet, Recharts

---

## ⚡ Quickstart Guide

### Prerequisites
* Python 3.10+
* Node.js 18+ and npm

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# (Optional) Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend test suite
pytest tests/

# Launch API server (runs on http://localhost:8001)
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive API documentation will be available at:
* Swagger UI: [http://localhost:8001/docs](http://localhost:8001/docs)
* Redoc: [http://localhost:8001/redoc](http://localhost:8001/redoc)

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install packages
npm install

# Launch Vite development server (runs on http://localhost:5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to access the dashboard.

---

## 🧪 Verification & Testing

Run the automated backend test suite to verify algorithm correctness across all four intelligence modules:

```bash
python3 -m pytest backend/tests -v
```

Tests validate:
* Cost anomaly IQR/median outlier classification
* Milestone delay and stagnation penalty curves
* Haversine distance and TF-IDF duplicate scoring
* Unified risk normalization and policy weight bounds

---

## 📄 License & Attribution

Developed for the **Smart India Hackathon (SIH26102)** problem statement on MPLADS project intelligence and monitoring.
