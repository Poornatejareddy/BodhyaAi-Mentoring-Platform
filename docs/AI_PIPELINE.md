# AI Pipeline Architecture

This document outlines the machine learning, explainability (XAI), and generative RAG (Retrieval-Augmented Generation) pipelines in BodhyaAI.

---

## 1. End-to-End Execution Flow

The system processes student data through a series of model inferences:

```
[Raw Student Metrics]
        │
        ▼ (risk-svc)
[XGBoost Classifies Risk Level (High/Med/Low)]
        │
        ▼ (xai-svc)
[SHAP Calculates Feature Importance Weights]
        │
        ▼ (llm-svc)
[Sentence Transformers Encodes Query] ◄──► [Query FAISS Vector Store]
        │
        ▼
[Context-Enriched Prompt Crafted]
        │
        ▼
[Google Gemini Model Generates Study Plan / Report]
```

---

## 2. Risk Prediction Pipeline (`risk-svc`)

The system maps **21 student features** spanning three distinct dimensions:

### Academic Metrics
*   `GPA`: Cumulative grade point average.
*   `Attendance`: Percentage of classes attended.
*   `Backlogs`: Number of current active backlog exams.
*   `MidtermGrades`: Average midterm performance.

### Socio-Economic Inputs
*   `FamilyIncome`: Household income bracket.
*   `ParentEducation`: Educational level attained by parents.
*   `TravelTime`: Time in minutes spent commuting to school.
*   `FinancialSupport`: Availability of grants, scholarships, or parental support.

### Behavioral Data
*   `StudyHours`: Hours spent studying outside classes per week.
*   `SocialHours`: Weekly time spent socializing.
*   `Absences`: Unexcused class absences.
*   `Extracurriculars`: Level of participation in student clubs.

### Model Execution
The `risk-svc` loads a pre-trained **XGBoost Classifier** model. It returns:
1.  **Risk Rating**: `HIGH`, `MEDIUM`, or `LOW`.
2.  **Attrition Probability**: Value between `0.0` and `1.0`.

---

## 3. Explainability Pipeline (`xai-svc`)

To make machine learning actionable for mentors, black-box decisions must be transparent:

*   **Technology**: SHAP (SHapley Additive exPlanations).
*   **Execution**:
    1.  Uses a `TreeExplainer` calibrated on the XGBoost training dataset.
    2.  For a given student's input features, SHAP computes a contribution value for each attribute.
    3.  **Positive SHAP value**: Increases risk prediction (e.g., poor attendance, low GPA).
    4.  **Negative SHAP value**: Decreases risk prediction (e.g., high study hours, strong financial support).
*   **Visual Output**: The controller returns coordinates to render a SHAP Force Plot on the UI, showing which factors pull the student over the risk line.

---

## 4. LLM & Retrieval-Augmented Generation (RAG) (`llm-svc`)

When a student requires a study plan or a mentor requests a cohort report, the RAG engine compiles context:

### A. Semantic Search Indexing
*   **Knowledge Base**: University academic guides, study skill handbooks (covering the Cornell and Pomodoro methods), and counseling manuals.
*   **Embedding Model**: `sentence-transformers/all-MiniLM-L6-v2` (running locally).
*   **Vector Store**: **FAISS** (Facebook AI Similarity Search) index.

### B. Context Retrieval
When a request arrives, the `llm-svc`:
1.  Generates a search embedding for the student's primary risk factors (e.g., "poor time management study habits").
2.  Queries the FAISS index to find the top `K` most relevant study guides.
3.  Injects these guides into the prompt as verified reference context.

### C. Gemini Prompt Orchestration
*   **SDK**: Official Google GenAI Python SDK (`google-genai`).
*   **Model Cascade**: `gemini-3.5-flash` ➔ `gemini-3.5-flash-lite` ➔ `gemini-2.0-flash` ➔ `gemini-2.0-flash-lite`.
*   **Caching**: Caches the last successfully connected model to minimize fallback lookup latency on subsequent requests.
*   **Timeout Guard**: Ensures requests timeout appropriately (mapped from seconds to milliseconds for `http_options`).
