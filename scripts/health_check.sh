#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI HEALTH CHECK UTILITY
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}          BODHYAAI SERVICE HEALTH AUDIT             ${NC}"
echo -e "${CYAN}====================================================${NC}"

# Load environment variables
if [ -f .env ]; then
    source .env
fi

MONGO_HOST="localhost"
MONGO_PORT=27017
BACKEND_PORT=${PORT:-5001}
FRONTEND_PORT=5173
COG_PORT=8000
RISK_PORT=8001
XAI_PORT=8002
LLM_PORT=8003

# Helper function to check TCP port
check_port() {
    local host=$1
    local port=$2
    if command -v nc >/dev/null 2>&1; then
        nc -z -w 2 "$host" "$port" >/dev/null 2>&1
        return $?
    else
        (echo >/dev/tcp/"$host"/"$port") >/dev/null 2>&1
        return $?
    fi
}

# Helper function to check HTTP endpoint
check_http() {
    local url=$1
    local expected_code=$2
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url")
    if [ "$status" = "$expected_code" ] || [ "$expected_code" = "any" -a "$status" -ne 0 ]; then
        return 0
    else
        return 1
    fi
}

HEALTHY=0

# Check MongoDB
echo -n "Checking MongoDB (Port $MONGO_PORT)... "
if check_port "$MONGO_HOST" "$MONGO_PORT"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[UNREACHABLE]${NC}"
    HEALTHY=1
fi

# Check Cognitive Service
echo -n "Checking Cognitive Service (Port $COG_PORT)... "
if check_http "http://localhost:$COG_PORT/" "200"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[UNHEALTHY/OFFLINE]${NC}"
    HEALTHY=1
fi

# Check Risk Service
echo -n "Checking Risk Service (Port $RISK_PORT)... "
if check_http "http://localhost:$RISK_PORT/" "200"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[UNHEALTHY/OFFLINE]${NC}"
    HEALTHY=1
fi

# Check XAI Service
echo -n "Checking XAI Service (Port $XAI_PORT)... "
if check_http "http://localhost:$XAI_PORT/" "200"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[UNHEALTHY/OFFLINE]${NC}"
    HEALTHY=1
fi

# Check LLM Service
echo -n "Checking LLM Service (Port $LLM_PORT)... "
if check_http "http://localhost:$LLM_PORT/health" "200"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[UNHEALTHY/OFFLINE]${NC}"
    HEALTHY=1
fi

# Check Backend Server
echo -n "Checking Express Backend (Port $BACKEND_PORT)... "
if check_http "http://localhost:$BACKEND_PORT/api/me" "401" || check_port "localhost" "$BACKEND_PORT"; then
    echo -e "${GREEN}[HEALTHY]${NC}"
else
    echo -e "${RED}[OFFLINE]${NC}"
    HEALTHY=1
fi

# Check Frontend Server
echo -n "Checking Frontend Client (Port $FRONTEND_PORT)... "
if check_port "localhost" "$FRONTEND_PORT"; then
    echo -e "${GREEN}[ONLINE]${NC}"
else
    echo -e "${RED}[OFFLINE]${NC}"
    HEALTHY=1
fi

echo -e "${CYAN}====================================================${NC}"
if [ $HEALTHY -eq 0 ]; then
    echo -e "${GREEN}All systems are healthy and running!${NC}"
    exit 0
else
    echo -e "${RED}Warning: One or more services are offline/unhealthy.${NC}"
    exit 1
fi
