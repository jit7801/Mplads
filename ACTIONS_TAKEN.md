# MPLADS Risk Intelligence Platform — Comprehensive Audit & Actions Taken Report

**Date**: September 12, 2026  
**Repository**: [jit7801/Mplads](https://github.com/jit7801/Mplads)  
**Status**: All systems operational, verified, and passing tests (21/21 Pytest suite passed, Frontend clean build)

---

## 1. Executive Summary

This report documents the end-to-end technical audit, architectural hardening, and algorithmic enhancements performed on the **MPLADS Risk Intelligence & eSAKSHI Decision Support Platform**.

The platform is designed to:
> **Detect risk signals → explain why a work is flagged → prioritize it → recommend human administrative verification.**

The system does **not** claim to prove guilt or fraud; all final decisions and administrative enforcement remain with authorized human officers.

---

## 2. Inventory of Files Changed

| Component | File Path | Action | Description |
|:---|:---|:---:|:---|
| **Core Config** | [`backend/app/core/config.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/core/config.py) | **MODIFIED** | Added centralized evaluation date resolution, configurable threshold parameters, and CORS whitelist. |
| **Validation Layer** | [`backend/app/engines/data_validator.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/data_validator.py) | **NEW** | Added ingestion validation for IDs, amounts, percentages, India coordinates (8–37.5°N, 68–97.5°E), chronology, and status consistency. |
| **Compliance Engine** | [`backend/app/engines/compliance_engine.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/compliance_engine.py) | **NEW** | Disaggregated statutory compliance indicators (completion cert, utilization cert, photo, asset register, audit cert). |
| **Cost Engine** | [`backend/app/engines/cost_engine.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/cost_engine.py) | **MODIFIED** | Implemented multi-tier cohort fallback (District → State → National → Insufficient), unit cost normalization, robust zero-MAD handler, and transparent Isolation Forest signal. |
| **Delay Engine** | [`backend/app/engines/delay_engine.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/delay_engine.py) | **MODIFIED** | Injected centralized evaluation date, configurable dormancy/overrun thresholds, and clear physical-fiscal divergence explanations. |
| **Duplicate Engine** | [`backend/app/engines/duplicate_engine.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/duplicate_engine.py) | **MODIFIED** | Implemented $O(N \log N)$ `BallTree` spatial candidate indexing, sub-word TF-IDF n-grams, and advisory governance labeling (`POSSIBLE DUPLICATE / OVERLAP — VERIFY`). |
| **Unified Risk Engine**| [`backend/app/engines/risk_engine.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/engines/risk_engine.py) | **MODIFIED** | Integrated data validator and compliance engine, normalized weight scaling, and replaced punitive instructions with advisory recommendations. |
| **API Router** | [`backend/app/api/v1/router.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/app/api/v1/router.py) | **MODIFIED** | Added strict Pydantic model validation ($\sum \text{weights} = 100$), GeoJSON coordinate filtering, and structured logging. |
| **App Entrypoint** | [`backend/main.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/main.py) | **MODIFIED** | Configured restricted CORS origins, structured logging, and provenance metadata on root. |
| **Test Suites** | [`backend/tests/test_engines.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/tests/test_engines.py) | **MODIFIED** | Added tests for zero-MAD cohorts, unit normalization, centralized date, BallTree duplicates, and compliance signals. |
| | [`backend/tests/test_validation.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/tests/test_validation.py) | **NEW** | Validates bounds, chronology errors, negative amounts, and clean record pass-through. |
| | [`backend/tests/test_api.py`](file:///Users/jiteshvishnoi/Desktop/voip2/backend/tests/test_api.py) | **NEW** | Smoke tests covering REST endpoints, GeoJSON coordinate bounds, and strict weight sum validation rejection. |
| **Frontend UI** | [`frontend/src/components/Header.jsx`](file:///Users/jiteshvishnoi/Desktop/voip2/frontend/src/components/Header.jsx) | **MODIFIED** | Added "eSAKSHI Decision Support" badge and administrative role selector. |
| | [`frontend/src/components/SettingsModal.jsx`](file:///Users/jiteshvishnoi/Desktop/voip2/frontend/src/components/SettingsModal.jsx) | **MODIFIED** | Added pre-submission validation preventing invalid policy weight sums. |
| | [`frontend/src/components/CitizenView.jsx`](file:///Users/jiteshvishnoi/Desktop/voip2/frontend/src/components/CitizenView.jsx) | **MODIFIED** | Removed unused import and ensured strict scoping of public asset attributes. |
| **Documentation** | [`README.md`](file:///Users/jiteshvishnoi/Desktop/voip2/README.md) | **MODIFIED** | Rewritten with governance principles, architecture diagrams, testing commands, and ethical guidelines. |
| | [`decisions.md`](file:///Users/jiteshvishnoi/Desktop/voip2/decisions.md) | **MODIFIED** | Added ADRs 6 through 10 covering centralized dates, validation layer, BallTree indexing, compliance signals, and advisory framing. |
| | [`flow.md`](file:///Users/jiteshvishnoi/Desktop/voip2/flow.md) | **MODIFIED** | Updated data pipeline flow diagram with validator, compliance engine, and BallTree indexing. |

---

## 3. Key Issues Fixed & Root Cause Analysis

1. **Hard-Coded Evaluation Date**:
   - *Issue*: `eval_date_str = "2024-09-15"` was hard-coded in `delay_engine.py`, causing time-drift and inconsistent evaluation when running in different environments.
   - *Fix*: Centralized evaluation date in `Settings.EVALUATION_DATE` with support for `"today"`, `"now"`, or environment variables (`MPLADS_EVALUATION_DATE`), while preserving `"2024-09-15"` as the deterministic reference anchor for reproducible benchmark demonstrations.
2. **Missing Ingestion Validation Layer**:
   - *Issue*: Raw CSV records were parsed directly without bounds checking, permitting impossible dates (completion before start) and out-of-bounds coordinates to silently enter analytical pipelines.
   - *Fix*: Created `data_validator.py` executing prior to risk scoring, flagging data quality anomalies into `data_quality_warnings` without destructively mutating raw data.
3. **Fragile Peer Cohort Sizes in Cost Engine**:
   - *Issue*: Single-project cohorts in sparse districts caused $1.0\times$ ratios, false zero-MAD calculations, and misleading anomaly scores.
   - *Fix*: Built multi-tier cascading fallback: $\text{Category} \times \text{District} \to \text{Category} \times \text{State} \to \text{Category} \to \text{INSUFFICIENT\_PEER\_DATA}$ ($N < 5$), with robust zero-MAD safe handling and unit cost normalization (cost per metre, cost per classroom).
4. **$O(N^2)$ Pairwise Duplicate Bottleneck**:
   - *Issue*: Nested loops checked every project pair within a district, calculating string metrics without candidate pruning.
   - *Fix*: Implemented $O(N \log N)$ `BallTree` spatial candidate indexing with Haversine metrics in radians, computing sub-word character n-gram TF-IDF cosine similarity exclusively on candidate pairs within `SPATIAL_RADIUS_METERS` (150m).
5. **Non-Advisory Phrasing & Administrative Due Process**:
   - *Issue*: System generated automatic punitive directives such as *"Freeze further fund releases..."*.
   - *Fix*: Converted all directives to advisory administrative recommendations: *"Review fund-release eligibility according to applicable rules and pending statutory documentation"*, adding disclaimers that all decisions rest with competent administrative authorities.
6. **Strict Policy Weight Validation ($\sum = 100$)**:
   - *Issue*: Slider inputs that did not sum to 100 were accepted without validation.
   - *Fix*: Implemented Pydantic `@model_validator` in `RecalculateRequest` raising HTTP 422 errors if $\sum \ne 100$, and added frontend UI validation in `SettingsModal.jsx`.
7. **CORS & Environment Governance**:
   - *Issue*: Wide-open `allow_origins=["*"]` and lack of structured API governance.
   - *Fix*: Restricted CORS to configured origin whitelist, added `eSAKSHI Decision Support` status badge in header, and aligned data pipeline source metadata.

---

## 4. Machine Learning & Statistical Methods

- **Modified Z-Score with MAD**:
  $$M_i = \frac{0.6745 \times (x_i - \tilde{x})}{\text{MAD}}$$
  Where $\text{MAD} = \text{median}(|x_i - \tilde{x}|)$. Provides robust outlier detection resilient to extreme values, unlike classical mean/standard-deviation Z-scores.
- **BallTree Spatial Indexing**:
  Transforms coordinates $(lat, lon)$ into radians on the unit sphere and queries `tree.query_radius` in $O(N \log N)$ time, avoiding quadratic pairwise distance computations.
- **Sub-word Character n-gram TF-IDF**:
  Extracts sub-word character n-grams $(3, 5)$ across project titles to account for transliteration variations, spelling differences, and compound administrative names common across Indian public works tenders.
- **Unsupervised Isolation Forest**:
  Employed strictly as an unsupervised secondary multivariate indicator across financial and progress dimensions. Transparently surfaced in forensic dossiers without claiming to predict fraud.

---

## 5. Security, Role Scoping & Governance

- **CORS Restriction**: Whitelists authorized origins (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`, `http://127.0.0.1:8001`) with environment variable overrides (`MPLADS_CORS_ORIGINS`).
- **Role Boundary Clarification**: Clarified that frontend role selection is an MVP demonstration simulator. In production, roles are authenticated via National Government Single Sign-On (e.Pramaan / Jan Parichay).
- **Citizen Portal Data Scoping**: Restricted Citizen view strictly to public asset information (sanctioned amounts, physical completion %, executing agency, ground photographs), concealing internal risk scores.

---

## 6. Testing & Build Verification

### Automated Pytest Suite:
```bash
python3 -m pytest backend/tests -v
```
**Result**: **21 passed in 1.49s (100% success rate)**
- `test_haversine_distance` — PASSED
- `test_cost_anomaly_flagged` — PASSED
- `test_cost_zero_mad_and_fallback_cohorts` — PASSED
- `test_extract_unit_metric` — PASSED
- `test_delay_stagnation_flagged` — PASSED
- `test_centralized_eval_date` — PASSED
- `test_duplicate_detection_balltree` — PASSED
- `test_compliance_engine_disaggregated_signals` — PASSED
- `test_unified_risk_score_flagship` — PASSED
- `test_mp_allocations_and_metrics` — PASSED
- `test_validator_detects_negative_amounts` — PASSED
- `test_validator_detects_out_of_bounds_coordinates` — PASSED
- `test_validator_detects_chronology_inconsistencies` — PASSED
- `test_validator_clean_records` — PASSED
- `test_health_check_endpoint` — PASSED
- `test_summary_endpoint` — PASSED
- `test_works_endpoint_and_pagination` — PASSED
- `test_work_by_id_and_explanation` — PASSED
- `test_map_layers_coordinate_bounds` — PASSED
- `test_mps_and_states_endpoints` — PASSED
- `test_recalculate_request_validation` — PASSED

### Frontend Build:
```bash
npm run build
# 1,913 modules transformed, 0 errors, production bundle compiled in 351ms
```

### Live Endpoint Smoke Check:
- `GET http://localhost:8001/api/v1/health` -> `200 OK` (Healthy, 520 works, evaluation date 2024-09-15)
- `GET http://localhost:8001/api/v1/summary` -> `200 OK`
- `GET http://localhost:8001/api/v1/works/MPLAD-RJ-2024-0042/explanation` -> `200 OK` (Critical Risk Score 84/100, advisory directives)
- `GET http://localhost:5173` -> `200 OK`

---

## 7. SIH Judge-Ready Presentations

### 30-Second Elevator Pitch
> *"The MPLADS Risk Intelligence Platform is an explainable decision-support system that flags risk signals before public funds are disbursed. Instead of black-box algorithms claiming to prove fraud, our system uses robust statistical benchmarking, spatial trees, and sub-word NLP to prioritize suspicious projects for human verification. Every alert is backed by mathematical justifications, missing statutory documents, and standardized field inspection notices."*

### 1-Minute Pitch
> *"Monitoring thousands of constituency development works under MPLADS poses a major challenge for district authorities. Our platform solves this through an explainable multi-engine architecture:
> 1. Our Ingestion Validator catches chronological errors and invalid coordinates.
> 2. Our Cost Engine benchmarks project estimates against fine-grained local peer medians using Modified Z-scores and unit-cost normalization.
> 3. Our Delay Engine identifies fiscal-physical progress mismatches where money is drawn down far ahead of verified ground work.
> 4. Our Duplicate Engine uses BallTrees and sub-word TF-IDF to detect overlapping assets within 150 metres.
> 5. Our Compliance Engine audits missing statutory certificates.
> These combine into a 0–100 Risk Priority Score with one-click official inspection notices. It detects risk, not guilt, keeping final authority in the hands of designated administrative officers."*

### Scalability Explanation
> *"To scale to all 543 Lok Sabha constituencies, our duplicate engine employs BallTree spatial indexing with Haversine distance in radians, reducing candidate search from $O(N^2)$ to $O(N \log N)$. Expensive NLP string matching is executed only on geographically proximate candidates. In production, our in-memory cache architecture transitions seamlessly to PostgreSQL / PostGIS spatial indexing with zero disruption to analytical engine logic."*
