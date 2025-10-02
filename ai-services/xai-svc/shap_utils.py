import shap
import numpy as np
import pandas as pd

def get_shap_values(pipeline, X):
    # 1. Extract the actual model
    model = pipeline.named_steps['clf']

    # 2. Preprocess input features using pipeline's scaler
    if 'scaler' in pipeline.named_steps:
        X_transformed = pipeline.named_steps['scaler'].transform(X)
    else:
        X_transformed = X.values

    # 3. Create SHAP explainer for tree model
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_transformed)

    # 4. For classification, shap_values is a list per class; take mean across classes
    if isinstance(shap_values, list):
        shap_values = np.mean(np.array(shap_values), axis=0)

    # 5. Compute mean absolute SHAP values per feature
    mean_abs_shap = np.abs(shap_values).mean(axis=0)

    # 6. Return as DataFrame
    feature_importance = pd.DataFrame({
        "feature": X.columns,
        "shap_value": mean_abs_shap
    }).sort_values(by="shap_value", ascending=False)

    return feature_importance.to_dict(orient="records")
