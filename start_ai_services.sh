#!/bin/bash
# Start AI Microservices for BodhyaAI Platform
# Starts risk-svc and xai-svc in the background

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔════════════════════════════════════════╗"
echo "║  Starting AI Microservices            ║"
echo "║  BodhyaAI Platform                    ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python3 not found${NC}"
    exit 1
fi

# Base directory
BASE_DIR="/home/poornatejareddy007/Desktop/BodhyaAI /bodhyai/ai-services"

# Start risk-svc
echo -e "${YELLOW}[1/2] Starting risk-svc on port 8001...${NC}"
cd "$BASE_DIR/risk-svc"

# Check if model exists
if [ ! -f "models/academic_risk_pipeline.pkl" ]; then
    echo -e "${RED}Warning: Risk model not found. Service will fail to start.${NC}"
    echo -e "${YELLOW}You need to train the model first by running:${NC}"
    echo -e "  cd ai-services/risk-svc"
    echo -e "  python train_academic_model.py"
    echo ""
    echo -e "${YELLOW}Skipping risk-svc startup...${NC}"
else
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate and install dependencies
    source venv/bin/activate
    pip install -q -r requirements.txt 2>/dev/null || true
    
    # Start server in background
    echo "Starting FastAPI server..."
    nohup python service.py > risk-svc.log 2>&1 &
    RISK_PID=$!
    echo -e "${GREEN}✓ risk-svc started (PID: $RISK_PID)${NC}"
    echo "  URL: http://localhost:8001"
    echo "  Logs: $BASE_DIR/risk-svc/risk-svc.log"
    deactivate
fi

# Start xai-svc
echo -e "\n${YELLOW}[2/2] Starting xai-svc on port 8002...${NC}"
cd "$BASE_DIR/xai-svc"

# Check if model/dependencies exist
if [ ! -f "service.py" ]; then
    echo -e "${RED}Warning: xai-svc service.py not found${NC}"
    echo -e "${YELLOW}Skipping xai-svc startup...${NC}"
else
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate and install dependencies
    source venv/bin/activate
    pip install -q -r requirements.txt 2>/dev/null || true
    
    # Start server in background
    echo "Starting FastAPI server..."
    nohup python service.py > xai-svc.log 2>&1 &
    XAI_PID=$!
    echo -e "${GREEN}✓ xai-svc started (PID: $XAI_PID)${NC}"
    echo "  URL: http://localhost:8002"
    echo "  Logs: $BASE_DIR/xai-svc/xai-svc.log"
    deactivate
fi

# Start cog-svc
echo -e "\n${YELLOW}[3/4] Starting cog-svc on port 8000...${NC}"
cd "$BASE_DIR/cog-svc"

if [ ! -f "service.py" ]; then
    echo -e "${RED}Warning: cog-svc service.py not found${NC}"
    echo -e "${YELLOW}Skipping cog-svc startup...${NC}"
else
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt 2>/dev/null || true
    echo "Starting FastAPI server..."
    nohup python service.py > cog-svc.log 2>&1 &
    COG_PID=$!
    echo -e "${GREEN}✓ cog-svc started (PID: $COG_PID)${NC}"
    echo "  URL: http://localhost:8000"
    echo "  Logs: $BASE_DIR/cog-svc/cog-svc.log"
    deactivate
fi

# Start llm-svc
echo -e "\n${YELLOW}[4/4] Starting llm-svc on port 8003...${NC}"
cd "$BASE_DIR/llm-svc"

if [ ! -f "run.py" ]; then
    echo -e "${RED}Warning: llm-svc run.py not found${NC}"
    echo -e "${YELLOW}Skipping llm-svc startup...${NC}"
else
    if [ ! -d "venv" ]; then
        echo "Creating virtual environment..."
        python3 -m venv venv
    fi
    source venv/bin/activate
    pip install -q -r requirements.txt 2>/dev/null || true
    echo "Starting FastAPI server..."
    nohup python run.py > llm-svc.log 2>&1 &
    LLM_PID=$!
    echo -e "${GREEN}✓ llm-svc started (PID: $LLM_PID)${NC}"
    echo "  URL: http://localhost:8003"
    echo "  Logs: $BASE_DIR/llm-svc/llm-svc.log"
    deactivate
fi

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}AI Microservices Startup Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Running Services:"
echo "  • Frontend:    http://localhost:5173"
echo "  • Backend:     http://localhost:5000"
if [ -n "$COG_PID" ]; then echo "  • Cog Service:  http://localhost:8000 ✅"; fi
if [ -n "$RISK_PID" ]; then echo "  • Risk Service: http://localhost:8001 ✅"; fi
if [ -n "$XAI_PID" ]; then echo "  • XAI Service:  http://localhost:8002 ✅"; fi
if [ -n "$LLM_PID" ]; then echo "  • LLM Service:  http://localhost:8003 ✅"; fi

echo ""
echo "To stop services:"
if [ -n "$COG_PID" ]; then echo "  kill $COG_PID"; fi
if [ -n "$RISK_PID" ]; then echo "  kill $RISK_PID"; fi
if [ -n "$XAI_PID" ]; then echo "  kill $XAI_PID"; fi
if [ -n "$LLM_PID" ]; then echo "  kill $LLM_PID"; fi

echo ""
echo "View logs:"
if [ -n "$COG_PID" ]; then echo "  tail -f $BASE_DIR/cog-svc/cog-svc.log"; fi
if [ -n "$RISK_PID" ]; then echo "  tail -f $BASE_DIR/risk-svc/risk-svc.log"; fi
if [ -n "$XAI_PID" ]; then echo "  tail -f $BASE_DIR/xai-svc/xai-svc.log"; fi
if [ -n "$LLM_PID" ]; then echo "  tail -f $BASE_DIR/llm-svc/llm-svc.log"; fi

