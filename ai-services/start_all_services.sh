#!/bin/bash

# start_all_services.sh
# Starts all BodhyaAI FastAPI services in the background using the shared venv.

# Exit on error
set -e

# Base directory setup
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$SCRIPT_DIR"
LOGS_DIR="$BASE_DIR/logs"

mkdir -p "$LOGS_DIR"

echo "🚀 Starting BodhyaAI Microservices lifecycle..."

# 1. Virtual Environment Setup
if [ ! -d "$BASE_DIR/venv" ]; then
    echo "📦 Shared virtual environment not found at $BASE_DIR/venv. Creating..."
    python3 -m venv "$BASE_DIR/venv"
fi

echo "🔄 Activating shared virtual environment..."
source "$BASE_DIR/venv/bin/activate"

# 2. Dependency Check & Installation
echo "📦 Installing/verifying dependencies..."
pip install --upgrade pip
pip install -r "$BASE_DIR/requirements.txt"
pip install -e "$BASE_DIR"

# 3. Generate requirements-lock.txt
echo "🔒 Updating requirements-lock.txt..."
pip freeze > "$BASE_DIR/requirements-lock.txt"

# 4. Model Checks
echo "🔍 Verifying required ML models..."
MISSING_MODELS=0

# Risk model
if [ ! -f "$BASE_DIR/risk-svc/models/academic_risk_pipeline.pkl" ]; then
    echo "⚠️ Warning: risk-svc model not found. To train it, run: cd risk-svc && python train_academic_model.py"
    MISSING_MODELS=$((MISSING_MODELS + 1))
fi

# Cog models
COG_TRAITS=("openness" "conscientiousness" "extraversion" "agreeableness" "neuroticism")
for trait in "${COG_TRAITS[@]}"; do
    if [ ! -f "$BASE_DIR/cog-svc/models/${trait}_pipeline.pkl" ]; then
        echo "⚠️ Warning: cog-svc model for trait '${trait}' not found. To train it, run: cd cog-svc && python train_personality_models.py"
        MISSING_MODELS=$((MISSING_MODELS + 1))
    fi
done

if [ $MISSING_MODELS -gt 0 ]; then
    echo "❌ Some models are missing. Services will start but prediction endpoints will return errors."
else
    echo "✅ All ML models verified."
fi

# 5. Service Lifecycle Management
PID_FILE="$BASE_DIR/.services.pid"
# Clear old PID file if it exists
> "$PID_FILE"

# Helper function to start a service
start_service() {
    local svc_name=$1
    local svc_dir=$2
    local run_cmd=$3
    local port=$4
    
    echo "▶️ Starting $svc_name on port $port..."
    
    # Set PYTHONPATH to include the root for the common package
    export PYTHONPATH="$BASE_DIR:$PYTHONPATH"
    
    cd "$BASE_DIR/$svc_dir"
    
    # Run in background
    nohup $run_cmd > "$LOGS_DIR/${svc_name}.log" 2>&1 &
    local pid=$!
    
    echo "$svc_name:$pid" >> "$PID_FILE"
    echo "✅ Started $svc_name (PID: $pid). Logs: logs/${svc_name}.log"
}

# Start all 4 services
start_service "cog-svc" "cog-svc" "python service.py" 8000
start_service "risk-svc" "risk-svc" "python service.py" 8001
start_service "xai-svc" "xai-svc" "python service.py" 8002
start_service "llm-svc" "llm-svc" "python run.py" 8003

echo "🎉 All services started successfully!"
echo "--------------------------------------------------"
echo "Service URLs:"
echo " - Cognitive Service:   http://localhost:8000"
echo " - Risk Service:        http://localhost:8001"
echo " - XAI Service:         http://localhost:8002"
echo " - LLM / RAG Service:   http://localhost:8003"
echo "--------------------------------------------------"
echo "To stop all services, run: ./stop_all_services.sh"
