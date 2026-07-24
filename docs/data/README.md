# Dataset and model-data assessment

The repository contains saved artifacts (`ai-services/models`) and data-generation/training utilities (including `cog-svc/data_gen.py` and `train_bigfive_model.py`), but does not provide a governed, versioned institutional training dataset or data card. The safest classification is **synthetic/generated or demonstration-oriented unless separately evidenced**.

Synthetic data is useful for exercising schemas and interfaces without exposing students. It cannot establish prevalence, missingness, cohort drift, causal relationships, fairness, or calibration in a real institution. Models may learn the generator’s assumptions rather than student outcomes.

Before any institutional use: obtain legal basis and consent where required; define labels/outcomes; build longitudinal, de-identified data pipelines; split by time and institution; report calibration, recall/precision by cohort, false-alert burden, and fairness; monitor drift; and permit human override/appeal. Never infer protected traits or use psychometric outputs for punitive action.
