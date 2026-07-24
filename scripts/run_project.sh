#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI ONE-COMMAND RUNNER & ORCHESTRATOR
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}        BODHYAAI ENTERPRISE STACK LAUNCHER          ${NC}"
echo -e "${CYAN}====================================================${NC}"

# 1. Verification of system software requirements
check_software() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo -e "${RED}[ERROR] Required tool '$1' is missing.${NC}"
        echo -e "Please run './scripts/setup_project.sh' to audit and fix your environment."
        exit 1
    fi
}

check_software "node"
check_software "npm"
check_software "python3"
check_software "curl"
check_software "lsof"
check_software "pgrep"

# 2. Setup directory workspace
mkdir -p logs .pids
echo "Startup execution at $(date)" > logs/startup.log

# 3. Environment validation
if [ ! -f .env ]; then
    echo -e "${YELLOW}[WARNING] Root .env missing. Creating from example...${NC}"
    cp .env.example .env
fi
source .env

if [ ! -f backend/.env ] || [ ! -f frontend/.env ] || [ ! -f ai-services/.env ]; then
    echo -e "${YELLOW}[WARNING] Sub-project .env files missing. Running setup script...${NC}"
    ./scripts/setup_project.sh
fi

# 4. Dependency checks (Smart/Delta Detection)
echo -e "${CYAN}\n[STEP 1] Validating Package Dependencies...${NC}"

# Backend Packages
if [ ! -d backend/node_modules ] || [ ! -f backend/node_modules/.package-lock.json ] || [ backend/package-lock.json -nt backend/node_modules/.package-lock.json ]; then
    echo -e "${YELLOW}Backend dependencies are missing or outdated. Running npm install...${NC}"
    cd backend && npm install && cd ..
else
    echo -e "${GREEN}[OK] Backend dependencies satisfied.${NC}"
fi

# Frontend Packages
if [ ! -d frontend/node_modules ] || [ ! -f frontend/node_modules/.package-lock.json ] || [ frontend/package-lock.json -nt frontend/node_modules/.package-lock.json ]; then
    echo -e "${YELLOW}Frontend dependencies are missing or outdated. Running npm install...${NC}"
    cd frontend && npm install && cd ..
else
    echo -e "${GREEN}[OK] Frontend dependencies satisfied.${NC}"
fi

# Python packages
if [ ! -d ai-services/venv ]; then
    echo -e "${YELLOW}Python virtual environment missing. Running setup...${NC}"
    python3 -m venv ai-services/venv
fi

source ai-services/venv/bin/activate
if python3 -c "import fastapi, uvicorn, pandas, sklearn, shap, google.genai" >/dev/null 2>&1; then
    echo -e "${GREEN}[OK] Python virtual environment and runtime dependencies satisfied.${NC}"
else
    echo -e "${YELLOW}Python runtime dependencies are missing. Running pip install...${NC}"
    pip install -r ai-services/requirements.txt
fi

# 5. Resolve Port Conflicts
stop_stale_workspace_dev_servers() {
    local process_ids

    # A previous `npm run dev` can leave Nodemon/Vite parents alive. Stopping
    # only their listening child causes an immediate respawn and a false-free
    # port, so stop just the stale development parents from this workspace.
    process_ids=$(pgrep -f "$PWD/backend/node_modules/.bin/nodemon src/index.js" 2>/dev/null || true)
    if [ -n "$process_ids" ]; then
        echo "Stopping stale backend development process(es): $process_ids"
        kill $process_ids >/dev/null 2>&1 || true
    fi

    process_ids=$(pgrep -f "$PWD/frontend/node_modules/.bin/vite" 2>/dev/null || true)
    if [ -n "$process_ids" ]; then
        echo "Stopping stale frontend development process(es): $process_ids"
        kill $process_ids >/dev/null 2>&1 || true
    fi

    sleep 1
}

stop_stale_workspace_dev_servers

free_port() {
    local port=$1
    local name=$2
    local pids
    pids=$(lsof -t -i:"$port" -sTCP:LISTEN 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}[CONFLICT] Port $port ($name) occupied by PID(s): $pids${NC}"
        echo -n "Attempting to release port $port... "
        for pid in $pids; do
            kill -9 "$pid" >/dev/null 2>&1
        done
        sleep 1
        if ! lsof -i:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
            echo -e "${GREEN}[RELEASED]${NC}"
        else
            echo -e "${RED}[FAILED] Please free port $port manually.${NC}"
            exit 1
        fi
    fi
}

free_port 27017 "MongoDB"
free_port 8000 "Cognitive Service"
free_port 8001 "Risk Service"
free_port 8002 "XAI Service"
free_port 8003 "LLM Service"
free_port ${PORT:-5001} "Backend Server"
free_port 5173 "Frontend Client"

# Helper check port
wait_for_port() {
    local host=$1
    local port=$2
    local name=$3
    local timeout=60
    local count=0
    echo -n "Waiting for $name to start on port $port..."
    while ! nc -z "$host" "$port" >/dev/null 2>&1 && [ $count -lt $timeout ]; do
        sleep 1
        count=$((count+1))
        echo -n "."
    done
    if [ $count -eq $timeout ]; then
        echo -e " ${RED}[TIMEOUT]${NC}"
        return 1
    else
        echo -e " ${GREEN}[READY]${NC}"
        return 0
    fi
}

# 6. Launch MongoDB
echo -e "${CYAN}\n[STEP 2] Launching MongoDB Server...${NC}"
MONGO_DB_PATH="${BODHYAAI_MONGO_DB_PATH:-$SCRIPT_DIR/../.data/mongodb}"
mkdir -p "$MONGO_DB_PATH"
if nc -z localhost 27017 >/dev/null 2>&1; then
    echo "Using existing MongoDB instance on port 27017..."
    echo "external-mongodb" > .pids/mongodb.pid
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "Starting MongoDB via Docker..."
    docker rm -f bodhyai-mongodb-local >/dev/null 2>&1 || true
    if ! docker run -d --name bodhyai-mongodb-local -p 27017:27017 mongo:6 > logs/mongodb.log 2>&1; then
        echo -e "${RED}[ERROR] Unable to start the managed MongoDB container.${NC}"
        cat logs/mongodb.log
        exit 1
    fi
    echo "docker-bodhyai-mongodb-local" > .pids/mongodb.pid
else
    if command -v mongod >/dev/null 2>&1; then
        echo "Starting MongoDB local service..."
        mongod --fork --logpath logs/mongodb.log --dbpath "$MONGO_DB_PATH" --nounixsocket >/dev/null 2>&1
        pgrep mongod > .pids/mongodb.pid
    else
        echo -e "${RED}[ERROR] MongoDB engine not running. Please start MongoDB on port 27017.${NC}"
        exit 1
    fi
fi
wait_for_port "localhost" 27017 "MongoDB"

# 7. Launch AI microservices
launch_ai_svc() {
    local svc_dir=$1
    local port=$2
    local name=$3
    local log_file=$4
    local pid_file=$5
    local module=$6

    echo -e "${CYAN}\n[STEP] Starting $name...${NC}"
    cd "ai-services/$svc_dir" || exit 1
    if [ "$svc_dir" = "llm-svc" ]; then
        LLM_MEMORY_MONGO_URI="${LLM_MEMORY_MONGO_URI:-mongodb://localhost:27017/bodhyai}" \
            PYTHONPATH="$(pwd)/..${PYTHONPATH:+:$PYTHONPATH}" \
            python3 -m uvicorn "$module":app --host 0.0.0.0 --port "$port" > "../../logs/$log_file" 2>&1 &
    else
        PYTHONPATH="$(pwd)/..${PYTHONPATH:+:$PYTHONPATH}" python3 -m uvicorn "$module":app --host 0.0.0.0 --port "$port" > "../../logs/$log_file" 2>&1 &
    fi
    local pid=$!
    echo $pid > "../../.pids/$pid_file"
    cd ../..
    wait_for_port "localhost" "$port" "$name"
}

source ai-services/venv/bin/activate
launch_ai_svc "cog-svc" 8000 "Cognitive Service" "cognitive.log" "cog.pid" "service"
launch_ai_svc "risk-svc" 8001 "Risk Service" "risk.log" "risk.pid" "service"
launch_ai_svc "xai-svc" 8002 "XAI Service" "xai.log" "xai.pid" "service"
launch_ai_svc "llm-svc" 8003 "LLM Service" "llm.log" "llm.pid" "app.main"

# 8. Start NodeJS Backend
echo -e "${CYAN}\n[STEP 3] Starting NodeJS Backend Gateway...${NC}"
(cd backend && exec node src/index.js) > logs/backend.log 2>&1 &
echo $! > .pids/backend.pid
wait_for_port "localhost" ${PORT:-5001} "Backend Gateway"

# 9. Start Frontend Client
echo -e "${CYAN}\n[STEP 4] Starting Vite React Frontend Client...${NC}"
(cd frontend && exec ./node_modules/.bin/vite) > logs/frontend.log 2>&1 &
echo $! > .pids/frontend.pid
wait_for_port "localhost" 5173 "Frontend Client"

# 10. Audit Verification check
sleep 2
echo -e "${CYAN}\n====================================================${NC}"
./scripts/health_check.sh
echo -e "====================================================${NC}"
echo -e "${GREEN}Project started successfully!${NC}"
echo -e "Logs directory: ${CYAN}./logs/${NC}"
echo -e "PIDs directory: ${CYAN}./.pids/${NC}"
echo -e "Frontend running at: ${GREEN}http://localhost:5173${NC}"
echo -e "Backend running at: ${GREEN}http://localhost:${PORT:-5001}${NC}"
echo -e "${CYAN}====================================================${NC}"
