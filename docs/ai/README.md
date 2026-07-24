# AI service analysis

## Risk service (`risk-svc`)

FastAPI loads a joblib pipeline, label encoder, categorical encoders, and uses an XGBoost classifier exposed at `POST /predict`. Inputs are the `riskInputs` fields (CGPA, attendance, backlogs, study/wellbeing and socioeconomic inputs). It returns class label, maximum class probability, contributions, and model name. A deterministic override sets **High** risk when attendance <75, CGPA <6, or backlogs >=2. SHAP `TreeExplainer` contributions are computed where artifacts permit.

Mathematically, the classifier estimates \(P(Y=k|x)\); the returned confidence is \(\max_k P(Y=k|x)\), not calibrated certainty. The override replaces this with 0.99, which is a policy flag rather than a statistically validated probability.

## Cognitive service (`cog-svc`)

Five saved models predict trait scores from survey input, normalize scores to 0–100, and derive learning style, strengths, growth areas, and career suggestions using fixed threshold rules. This is **experimental**: derived learning styles/career compatibility are rules, not validated causal recommendations.

## XAI service (`xai-svc`)

Loads risk/cognitive artifacts separately and exposes feature importance and SHAP-derived explanations. It overlaps risk-service explanation functionality; version/model/preprocessing drift is a material risk unless both services consume the same versioned artifact contract.

## LLM service (`llm-svc`)

Uses Google GenAI with preferred Gemini fallback order, retries, a cached successful model, and a FAISS-backed RAG engine seeded from local documents. Prompts include role-aware mentoring instructions. It lacks demonstrated prompt-injection controls, content moderation, citation verification, PII redaction, evaluation harness, token/cost budgets, or durable conversation policy.
