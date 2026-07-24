#!/usr/bin/env bash
# ==============================================================================
# BODHYAAI AUTOMATED TEST SUITE
# ==============================================================================

GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
CYAN="\033[0;36m"
NC="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.." || exit 1

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}        BODHYAAI AUTOMATED INTEGRATION TESTS        ${NC}"
echo -e "${CYAN}====================================================${NC}"

PID_DIR=".pids"
if [ ! -d "$PID_DIR" ] || [ -z "$(ls -A "$PID_DIR" 2>/dev/null)" ]; then
    echo -e "${YELLOW}Project is not running. Starting services first...${NC}"
    ./scripts/run_project.sh
    sleep 3
fi

if [ -f .env ]; then
    source .env
fi
PORT=${PORT:-5001}
API_URL="http://localhost:$PORT/api"

# Report destination
REPORT_FILE="docs/reports/TEST_REPORT.md"
mkdir -p docs/reports

echo "# Integration Test Suite Report" > "$REPORT_FILE"
echo "Generated on: $(date)" >> "$REPORT_FILE"
echo -e "\n## Results Matrix\n" >> "$REPORT_FILE"
printf "| %-35s | %-12s | %-40s |\n" "TEST CASE" "STATUS" "DETAILS" >> "$REPORT_FILE"
printf "| :%-35s | :%-12s | :%-40s |\n" "---" "---" "---" >> "$REPORT_FILE"

log_result() {
    local test_case=$1
    local status=$2
    local details=$3
    if [ "$status" = "SUCCESS" ]; then
        echo -e "$test_case: ${GREEN}[PASS]${NC} - $details"
        printf "| %-35s | **%-10s** | %-40s |\n" "$test_case" "SUCCESS" "$details" >> "$REPORT_FILE"
    else
        echo -e "$test_case: ${RED}[FAIL]${NC} - $details"
        printf "| %-35s | *%-10s* | %-40s |\n" "$test_case" "FAILED" "$details" >> "$REPORT_FILE"
    fi
}

# 1. Test frontend accessibility
echo -e "\n${CYAN}[1] Testing Frontend...${NC}"
if curl -s -o /dev/null --max-time 2 http://localhost:5173; then
    log_result "Frontend Accessibility" "SUCCESS" "Vite dev server is serving index on port 5173"
else
    log_result "Frontend Accessibility" "FAILED" "Vite dev server is offline on port 5173"
fi

# 2. Test MongoDB connectivity
echo -e "\n${CYAN}[2] Testing Database connection...${NC}"
if curl -s -o /dev/null --max-time 2 http://localhost:27017; then
    log_result "MongoDB Port Reachable" "SUCCESS" "TCP Port 27017 is open"
else
    log_result "MongoDB Port Reachable" "FAILED" "TCP Port 27017 is closed"
fi

# 3. Test AI microservices
test_ai_svc() {
    local port=$1
    local name=$2
    local path=$3
    echo -e "\n${CYAN}[3] Testing $name...${NC}"
    local response
    response=$(curl -s -w "\n%{http_code}" --max-time 2 "http://localhost:$port$path")
    local status_code
    status_code=$(echo "$response" | tail -n1)
    if [ "$status_code" = "200" ]; then
        log_result "$name Integration" "SUCCESS" "Health endpoint returned 200"
    else
        log_result "$name Integration" "FAILED" "Health endpoint returned HTTP $status_code"
    fi
}

test_ai_svc 8000 "Cognitive Service" "/"
test_ai_svc 8001 "Risk Service" "/"
test_ai_svc 8002 "XAI Service" "/"
test_ai_svc 8003 "LLM Service" "/health"

# 4. Test User authentication API
echo -e "\n${CYAN}[4] Testing Authentication and User APIs...${NC}"
RANDOM_VAL=$RANDOM
TEST_EMAIL="testadmin_$RANDOM_VAL@bodhyai.com"
REG_RES=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"SecurePass123!\",\"role\":\"admin\"}" \
  "$API_URL/auth/register")

if echo "$REG_RES" | grep -q "token"; then
    log_result "User Registration API" "SUCCESS" "Registered test admin account successfully"
else
    log_result "User Registration API" "FAILED" "Failed to register test user account"
fi

# Login
LOGIN_RES=$(curl -s -X POST -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"SecurePass123!\"}" \
  "$API_URL/auth/login")

TOKEN=$(echo "$LOGIN_RES" | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

if [ -n "$TOKEN" ]; then
    log_result "User Login API" "SUCCESS" "Obtained valid JWT session token"
    
    # Query authenticated user info via admin users endpoint
    ME_RES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/admin/users")
    if echo "$ME_RES" | grep -q "$TEST_EMAIL" || echo "$ME_RES" | grep -q "users"; then
        log_result "JWT Authentication & AdminUsers Endpoint" "SUCCESS" "Token authorized and admin query completed"
    else
        log_result "JWT Authentication & AdminUsers Endpoint" "FAILED" "AdminUsers query returned unauthorized: $ME_RES"
    fi
else
    log_result "User Login API" "FAILED" "Could not extract login JWT token"
    log_result "JWT Authentication & AdminUsers Endpoint" "FAILED" "Skipped due to missing login session"
fi

echo -e "\n${CYAN}====================================================${NC}"
echo -e "Test Report saved to: ${GREEN}$REPORT_FILE${NC}"
echo -e "====================================================${NC}"
