#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI ENTERPRISE WORKSPACE PROVISIONING UTILITY
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}         BODHYAAI WORKSPACE PROVISIONING            ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Helper function to check software requirement
check_req() {
    local cmd=$1
    local name=$2
    local install_instructions=$3
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${RED}[MISSING REQUIREMENT] $name is not installed.${NC}"
        echo -e "Instructions: $install_instructions\n"
        return 1
    else
        echo -e "${GREEN}[OK] $name detected: $($cmd --version 2>/dev/null | head -n1)${NC}"
        return 0
    fi
}

ERRORS=0

echo -e "${CYAN}\n[STEP 1] Auditing System Requirements...${NC}"
check_req "git" "Git" "Install Git using your system packager (e.g. sudo apt install git)." || ERRORS=$((ERRORS+1))
check_req "node" "Node.js" "Install Node.js v18+ (https://nodejs.org/)." || ERRORS=$((ERRORS+1))
check_req "npm" "npm" "npm is bundled with Node.js. Ensure it is active." || ERRORS=$((ERRORS+1))
check_req "python3" "Python" "Install Python v3.10+ (sudo apt install python3 python3-venv)." || ERRORS=$((ERRORS+1))
check_req "curl" "curl" "Install curl (sudo apt install curl)." || ERRORS=$((ERRORS+1))
check_req "make" "Make" "Install Make (sudo apt install build-essential or make)." || ERRORS=$((ERRORS+1))

# Check Docker / Mongo
if ! command -v docker >/dev/null 2>&1 && ! command -v mongod >/dev/null 2>&1; then
    echo -e "${YELLOW}[WARNING] Neither Docker nor local MongoDB server (mongod) detected.${NC}"
    echo -e "To run MongoDB, please install Docker Desktop or MongoDB Community Edition.\n"
else
    echo -e "${GREEN}[OK] MongoDB engine source (Docker or local system mongod) is present.${NC}"
fi

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}[ERROR] Provisioning halted. Please install the missing system tools above.${NC}"
    exit 1
fi

# 2. Setup Environment configs
echo -e "${CYAN}\n[STEP 2] Configuring Workspace Environments...${NC}"
if [ ! -f .env ]; then
    echo "Creating root .env from template .env.example..."
    cp .env.example .env
else
    echo "Root .env file is present."
fi

# Copy sub-environment configurations if missing
if [ ! -f backend/.env ]; then
    echo "Creating backend/.env..."
    cat << 'EOF' > backend/.env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
MONGODB_URI=mongodb://localhost:27017/bodhyai
PORT=5001
FRONTEND_URL=http://localhost:5173
COG_SERVICE_URL=http://localhost:8000
RISK_SERVICE_URL=http://localhost:8001
XAI_SERVICE_URL=http://localhost:8002
LLM_SERVICE_URL=http://localhost:8003
EOF
fi

if [ ! -f frontend/.env ]; then
    echo "Creating frontend/.env..."
    echo "VITE_API_URL=http://localhost:5001" > frontend/.env
fi

if [ ! -f ai-services/.env ]; then
    echo "Creating ai-services/.env..."
    echo "GEMINI_API_KEY=your-gemini-key" > ai-services/.env
fi

# 3. Installing dependencies
echo -e "${CYAN}\n[STEP 3] Provisioning Backend Packages...${NC}"
cd backend || exit 1
npm install
cd ..

echo -e "${CYAN}\n[STEP 4] Provisioning Frontend Packages...${NC}"
cd frontend || exit 1
npm install
cd ..

echo -e "${CYAN}\n[STEP 5] Provisioning Python Environment and Microservices...${NC}"
if [ ! -d ai-services/venv ]; then
    echo "Creating virtual environment in ai-services/venv..."
    python3 -m venv ai-services/venv
fi
source ai-services/venv/bin/activate
python3 -m pip install --upgrade pip
echo "Installing pip requirements..."
pip install -r ai-services/requirements.txt
pip install -e ai-services/

echo -e "${CYAN}\n====================================================${NC}"
echo -e "${GREEN}Provisioning Completed Successfully!${NC}"
echo -e "You can now start the stack by running: ${CYAN}make dev${NC} or ${CYAN}./scripts/run_project.sh${NC}"
echo -e "${CYAN}====================================================${NC}"
