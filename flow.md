# Explainable Risk Intelligence Layer for MPLADS (ERIL)
## System Flow & Architecture Specification (`flow.md`)

This document details the operational, data, algorithmic, and interaction flows of the **Explainable Risk Intelligence Layer (ERIL)** built for **SIH26102 (MPLAD Scheme Anomaly, Fraud & Inefficiency Detection)**.

---

### 1. High-Level End-to-End Architectural Flow

```
+---------------------------------------------------------------------------------------------+
|                                    1. DATA INGESTION & HYBRID SEED                           |
|  - Real Public MPLADS/eSAKSHI data exports (data.gov.in / Ministry reports)                |
|  - Synthetic Data Generator (seed_data.py) generating 500+ realistic Indian constituency    |
|    works with strictly labeled provenance (`REAL_PUBLIC` vs `SYNTHETIC_SIMULATED`)         |
+----------------------------------------------+----------------------------------------------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------+
|                                    2. DATA SANITIZATION & ETL                               |
|  - Validation: Geo-bounding box check (India bounds: Lat 8.0°-37.0°N, Lon 68.0°-97.0°E)     |
|  - Type casting: Dates, currency parsing (INR Lakhs/Crores), progress percentage normalization|
|  - Missing coordinate fallback: Ward/Village clustering                                     |
+----------------------------------------------+----------------------------------------------+
                                               |
                                               v
+---------------------------------------------------------------------------------------------+
|                             3. ANALYTICAL ENGINES EXECUTION (PARALLEL)                      |
|                                                                                             |
|  +---------------------------+ +----------------------------+ +---------------------------+ |
|  |     MODULE 1: COST        | |      MODULE 2: DELAY       | |    MODULE 3: DUPLICATE    | |
|  | - Cohort Stratification   | | - Milestone drift tracking | | - Spatial Bounding (<=150m)| |
|  |   (Category x District)   | | - Inactivity Clock (days)  | | - Char/Word TF-IDF n-grams| |
|  | - Cohort Median & MAD     | | - Progress Gap (% Fin - %  | | - Cosine Similarity       | |
|  | - Modified Z-Score        | |   Phys)                    | | - Budget & Agency Match   | |
|  | - Isolation Forest        | | - Milestone S-Curve drift  | | - Weighted Duplicate Index| |
|  +-------------+-------------+ +--------------+-------------+ +-------------+-------------+ |
|                |                              |                             |               |
|                +------------------------------+-----------------------------+               |
|                                               |                                             |
+-----------------------------------------------+---------------------------------------------+
                                                v
+---------------------------------------------------------------------------------------------+
|                             4. UNIFIED RISK ENGINE (URS SYNTHESIZER)                        |
|  - Weighted aggregation: Financial (30%) + Delay (30%) + Duplicate (25%) + Compliance (15%) |
|  - Normalization to 0-100 scale: LOW (0-29), MEDIUM (30-59), HIGH (60-79), CRITICAL (80-100)|
|  - Explainability Generator: Compiles empirical bullet points (No "black box" claims)       |
|  - Action Engine: Formulates specific official inspection directives                        |
+-----------------------------------------------+---------------------------------------------+
                                                |
                                                v
+---------------------------------------------------------------------------------------------+
|                                    5. FASTAPI SERVICE LAYER                                 |
|  - RESTful Endpoints: /summary, /works, /works/{id}/explanation, /duplicates, /map/layers   |
|  - Parameterized simulation: /simulate/recalculate (judge-adjustable weight sliders)        |
+-----------------------------------------------+---------------------------------------------+
                                                |
                                                v
+---------------------------------------------------------------------------------------------+
|                               6. PRESENTATION LAYER (REACT + VITE)                          |
|  - Screen 1: Executive Command Center & Priority Triage Queue                               |
|  - Screen 2: Risk Work List (Multi-faceted filtering & search)                              |
|  - Screen 3: Forensic Risk Dossier Modal (Radar breakdown, timeline, peer box-plot, notice) |
|  - Screen 4: Side-by-Side Duplicate Candidate Inspector (Dual-map, attribute delta)         |
|  - Screen 5: Full-Screen Geospatial Risk Intelligence Map                                   |
|  - Role-Based Scopes: District Authority, State Nodal, MP, Ministry, Citizen                |
+---------------------------------------------------------------------------------------------+
```

---

### 2. Module Execution Details

#### 2.1 Module 1: Cost Outlier Detection Flow
1. **Stratification**: All works are grouped by `(work_category, district)`. If a cohort has fewer than 5 records, it falls back to `(work_category, state)` to maintain statistical validity.
2. **Median & MAD Calculation**:
   - $\tilde{C} = \text{Median}(\text{Costs})$
   - $\text{MAD} = \text{Median}(|C_i - \tilde{C}|)$
3. **Modified Z-Score Calculation**:
   - $M_i = \frac{0.6745 \cdot (C_i - \tilde{C})}{\text{MAD} + 10^{-6}}$
4. **Isolation Forest Validation**: A multi-dimensional feature vector `[sanctioned_amount, estimated_cost, cost_per_progress_unit]` is evaluated via `IsolationForest(contamination=0.08)`.
5. **Score Allocation**:
   - If Cost Ratio $\ge 2.0\times$ or $M_i \ge 3.5 \implies 26\text{--}30$ pts.
   - If Cost Ratio $\ge 1.5\times$ or $M_i \ge 2.5 \implies 18\text{--}25$ pts.
   - If Cost Ratio $\ge 1.25\times$ or $M_i \ge 1.5 \implies 10\text{--}17$ pts.
   - Normal baseline $\implies 0\text{--}9$ pts.
   - Expenditure overshoot penalty ($>115\%$ of sanction): $+5$ pts.

#### 2.2 Module 2: Delay & Stagnation Detection Flow
1. **Progress Gap Calculation**:
   - $\text{Gap}_{\text{prog}} = \text{Financial Progress } (\%) - \text{Physical Progress } (\%)$
   - Severe Mismatch ($\ge 35\%$ gap): $+14$ pts.
   - Moderate Mismatch ($20\text{--}35\%$ gap): $+9$ pts.
   - Mild Mismatch ($10\text{--}20\%$ gap): $+4$ pts.
2. **Inactivity Clock Calculation**:
   - $\Delta_{\text{dormant}} = \text{Current Date} - \text{Last Update Date}$
   - Dormancy $\ge 90$ days: $+8$ pts.
   - Dormancy $45\text{--}89$ days: $+4$ pts.
3. **Target Date Overrun**:
   - Days overdue beyond expected completion date:
   - Overdue $> 180$ days: $+8$ pts.
   - Overdue $60\text{--}180$ days: $+4$ pts.
4. Total delay score capped at 30 points.

#### 2.3 Module 3: Duplicate & Overlap Detection Flow
1. **Stage 1 (Spatial Candidate Pruning)**:
   - All works within the same district are evaluated via spatial coordinates.
   - Pairs with $\text{Haversine Distance} \le 150\text{ metres}$ are extracted as candidates. Works further than 150m are immediately pruned, eliminating $99\%$ of $O(N^2)$ candidate pairs.
2. **Stage 2 (Multi-Attribute Similarity Scoring)**:
   - **Text Cosine Similarity ($S_{\text{text}}$)**: Character/word n-grams $(1, 3)$ vectorization of `work_title` and `work_description`.
   - **Geographic Proximity Factor ($S_{\text{geo}}$)**: $\max(0, 1 - \frac{\text{Distance}}{150})$.
   - **Category Match ($S_{\text{cat}}$)**: $1.0$ if matching, else $0.0$.
   - **Agency Match ($S_{\text{agency}}$)**: $1.0$ if matching, else $0.0$.
   - **Budget Proximity ($S_{\text{cost}}$)**: $\frac{\min(\text{Cost}_A, \text{Cost}_B)}{\max(\text{Cost}_A, \text{Cost}_B)}$.
3. **Weighted Duplicate Index (WDI)**:
   - $\text{WDI} = 0.45 \cdot S_{\text{text}} + 0.25 \cdot S_{\text{geo}} + 0.15 \cdot S_{\text{cat}} + 0.10 \cdot S_{\text{agency}} + 0.05 \cdot S_{\text{cost}}$
4. **Duplicate Risk Points**:
   - $\text{Score} = \text{Round}(\text{WDI} \times 25)$ (0 to 25 points).

#### 2.4 Module 4: Compliance & Documentation Deficit Flow
- Missing Completion Certificate when status is COMPLETED: $+5$ pts.
- Financial disbursement $>75\%$ without Utilization Certificate: $+5$ pts.
- Absence of geo-tagged physical progress photograph: $+3$ pts.
- Missing entry in District Asset Register: $+2$ pts.
- Total compliance score capped at 15 points.

---

### 3. User Interaction & Operational Flow

```
[District Magistrate / Auditor Logs In]
                   |
                   v
[Navigates to Risk Command Center]
  - Observes: 14 Critical Works requiring immediate scrutiny today
  - Views high-priority alert queue
                   |
                   v
[Clicks Top High-Risk Work (e.g. MPLAD-RJ-2024-0042)]
  - System opens Forensic Evidence Dossier
  - Displays:
    * URS Score: 86/100 (CRITICAL)
    * Component gauge breakdown
    * 5 quantitative evidence bullet points (Cost 1.90x, 38% progress gap, 102 days dormant)
    * Interactive peer cost distribution chart
    * Financial vs Physical progress bar comparison
                   |
                   v
[Explores Geospatial Duplicate Alert]
  - Clicks "Investigate Duplicate Candidate"
  - Screen transitions to Side-by-Side Diff Workspace
  - Inspects Work A vs Work B with linked map markers (35.4m distance)
                   |
                   v
[Takes Administrative Action]
  - Clicks "Generate Field Inquiry Notice"
  - Downloads pre-formatted official notice with specific inquiry questions for field engineers
  - Marks status as "FIELD_INSPECTION_ORDERED"
```
