# Training Instructions for Enhanced Risk Model

## Quick Start

Run the automated training pipeline:
```bash
cd /home/poornatejareddy007/Desktop/BodhyaAI\ /bodhyai/ai-services/risk-svc
./train.sh
```

## Manual Training Steps

If you prefer to run steps individually:

### 1. Generate Dataset
```bash
python3 generate_dataset.py
```
This creates `datasets/academic_dataset_large.csv` with 50,000 student records.

### 2. Train Model
```bash
python3 train_academic_model.py
```
This will:
- Train XGBoost classifier
- Perform 5-fold cross-validation
- Generate SHAP interpretability plots
- Save model to `models/academic_risk_pipeline.pkl`

### 3. Verify Output
Check that these files were created:
```bash
ls -lh datasets/
ls -lh models/
```

Expected files in `models/`:
- academic_risk_pipeline.pkl
- label_encoder.pkl
- feature_encoders.pkl
- feature_importance.json
- confusion_matrix.png
- feature_importance.png
- shap_summary_High.png
- shap_summary_Medium.png
- shap_summary_Low.png

### 4. Restart Service
After training, restart the risk-svc to load the new model:
```bash
# Kill existing service (if running)
# Then start again:
uvicorn service:app --reload --port 8000
```

## Expected Output

You should see output like:
```
✅ Dataset generated: datasets/academic_dataset_large.csv with 50000 students
🎯 Test Accuracy: 95.23%
✅ Cross-Validation Accuracy: 94.87% ± 0.32%
💾 Model saved at: models/academic_risk_pipeline.pkl
✅ SHAP summary plots saved successfully for all classes!
```

## Troubleshooting

If you encounter errors:

1. **Missing dependencies**: Install requirements
   ```bash
   pip install -r requirements.txt
   ```

2. **Permission denied**: Make train.sh executable
   ```bash
   chmod +x train.sh
   ```

3. **Dataset not found**: Ensure `datasets/` directory exists
   ```bash
   mkdir -p datasets models
   ```

## Next Steps

After successful training:
1. Review `models/confusion_matrix.png` to verify accuracy
2. Check `models/feature_importance.png` to see top contributing features
3. Examine SHAP plots in `models/` for detailed explainability
4. The backend will automatically use the new model on next prediction
