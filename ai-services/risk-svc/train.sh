#!/bin/bash

echo "🚀 Starting Enhanced Risk Model Training Pipeline"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directories
echo "📁 Creating necessary directories..."
mkdir -p datasets models

# Step 1: Generate dataset
echo -e "\n${YELLOW}Step 1: Generating synthetic dataset (50,000 students)...${NC}"
python3 generate_dataset.py

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dataset generation complete!${NC}"
else
    echo "❌ Dataset generation failed!"
    exit 1
fi

# Step 2: Train model
echo -e "\n${YELLOW}Step 2: Training XGBoost model with SHAP...${NC}"
python3 train_academic_model.py

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Model training complete!${NC}"
else
    echo "❌ Model training failed!"
    exit 1
fi

# Step 3: List generated files
echo -e "\n${YELLOW}Step 3: Verifying generated files...${NC}"
echo "📂 Generated files:"
ls -lh datasets/
ls -lh models/

echo -e "\n${GREEN}================================================${NC}"
echo -e "${GREEN}🎉 Training Pipeline Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "📊 Next steps:"
echo "1. Check models/confusion_matrix.png for accuracy"
echo "2. Check models/feature_importance.png for top features"
echo "3. Check models/shap_summary_*.png for explainability"
echo "4. Restart the risk-svc service to load the new model"
echo ""
