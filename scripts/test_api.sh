#!/bin/bash
# BodhyaAI API Testing Script
# Tests all core endpoints and validates responses

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load env variables if present
if [ -f .env ]; then
    source .env
fi

# Base URLs
PORT=${PORT:-5001}
BACKEND_URL="http://localhost:$PORT"
LLM_URL="http://localhost:8003"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Test tokens (will be populated after registration)
ADMIN_TOKEN=""
MENTOR_TOKEN=""
STUDENT_TOKEN=""
STUDENT_ID=""
MENTOR_ID=""

# Helper functions
print_test() {
    echo -e "${YELLOW}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

print_section() {
    echo ""
    echo -e "${YELLOW}========================================${NC}"
    echo -e "${YELLOW} $1${NC}"
    echo -e "${YELLOW}========================================${NC}"
}

# Test 1: Health Checks
test_health_checks() {
    print_section "Health Checks"
    
    print_test "Backend server responding"
    if curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL}/api/auth/login | grep -q "404\|200\|401\|400"; then
        print_pass "Backend is running"
    else
        print_fail "Backend not responding"
        exit 1
    fi
    
    print_test "LLM service responding"
    if curl -s ${LLM_URL}/health | grep -q "ok"; then
        print_pass "LLM service is healthy"
    else
        print_fail "LLM service not responding"
    fi
}

# Test 2: User Registration
test_registration() {
    print_section "User Registration"
    
    # Register Admin
    print_test "Register admin user"
    ADMIN_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Admin",
            "email": "testadmin@bodhya.ai",
            "password": "admin123",
            "role": "admin"
        }')
    
    if echo "$ADMIN_RESPONSE" | grep -q "\"success\":true"; then
        ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        print_pass "Admin registered successfully"
    else
        print_fail "Admin registration failed: $ADMIN_RESPONSE"
    fi
    
    # Register Mentor
    print_test "Register mentor user"
    MENTOR_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Mentor",
            "email": "testmentor@bodhya.ai",
            "password": "mentor123",
            "role": "mentor",
            "department": "CSE"
        }')
    
    if echo "$MENTOR_RESPONSE" | grep -q "\"success\":true"; then
        MENTOR_TOKEN=$(echo $MENTOR_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        # Handle multiple IDs
        MENTOR_ID=$(echo $MENTOR_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4 | head -1)
        if [ -z "$MENTOR_ID" ]; then
             MENTOR_ID=$(echo $MENTOR_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
        fi
        print_pass "Mentor registered successfully"
    else
        print_fail "Mentor registration failed: $MENTOR_RESPONSE"
    fi
    
    # Register Student
    print_test "Register student user"
    STUDENT_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/auth/register \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Test Student",
            "email": "teststudent@bodhya.ai",
            "password": "student123",
            "role": "student",
            "usn": "1RV20CS001",
            "department": "CSE",
            "section": "A"
        }')
    
    if echo "$STUDENT_RESPONSE" | grep -q "\"success\":true"; then
        STUDENT_TOKEN=$(echo $STUDENT_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
        STUDENT_ID=$(echo $STUDENT_RESPONSE | grep -o '"userId":"[^"]*' | cut -d'"' -f4 | head -1)
        if [ -z "$STUDENT_ID" ]; then
            STUDENT_ID=$(echo $STUDENT_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
        fi
        print_pass "Student registered successfully"
    else
        print_fail "Student registration failed: $STUDENT_RESPONSE"
    fi
}

# Test 3: Authentication
test_authentication() {
    print_section "Authentication"
    
    print_test "Get current user (student)"
    # Fallback to test route access if /me not supported
    AUTH_RESPONSE=$(curl -s -X GET ${BACKEND_URL}/api/students/my-profile \
        -H "Authorization: Bearer ${STUDENT_TOKEN}")
    
    if echo "$AUTH_RESPONSE" | grep -q "\"success\":true"; then
        print_pass "Authentication working correctly"
    else
        print_fail "Authentication failed: $AUTH_RESPONSE"
    fi
}

# Test 4: Student Endpoints
test_student_endpoints() {
    print_section "Student Endpoints"
    
    print_test "Update student profile"
    UPDATE_RESPONSE=$(curl -s -X PUT ${BACKEND_URL}/api/students/my-profile \
        -H "Authorization: Bearer ${STUDENT_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{
            "CGPA": 8.5,
            "Attendance": 90,
            "StressScore": 5,
            "SleepHours": 7,
            "StudyHoursPerDay": 4,
            "Backlogs": 0
        }')
    
    if echo "$UPDATE_RESPONSE" | grep -q "\"success\":true"; then
        print_pass "Student profile updated"
    else
        print_fail "Profile update failed: $UPDATE_RESPONSE"
    fi
    
    print_test "Get student profile"
    PROFILE_RESPONSE=$(curl -s -X GET ${BACKEND_URL}/api/students/my-profile \
        -H "Authorization: Bearer ${STUDENT_TOKEN}")
    
    if echo "$PROFILE_RESPONSE" | grep -q "8.5" || echo "$PROFILE_RESPONSE" | grep -q "\"success\":true"; then
        print_pass "Student profile retrieved"
    else
        print_fail "Profile retrieval failed: $PROFILE_RESPONSE"
    fi
}

# Test 5: RAG/LLM Endpoints
test_rag_endpoints() {
    print_section "RAG/LLM Endpoints"
    
    print_test "RAG query - semantic search"
    RAG_QUERY=$(curl -s -X POST ${LLM_URL}/rag/query \
        -H "Content-Type: application/json" \
        -d '{"query": "What are effective study techniques?", "k": 3}')
    
    if echo "$RAG_QUERY" | grep -q "\"success\":true" || echo "$RAG_QUERY" | grep -q "results"; then
        print_pass "RAG query working"
    else
        print_fail "RAG query failed: $RAG_QUERY"
    fi
    
    print_test "RAG chat"
    RAG_CHAT=$(curl -s -X POST ${LLM_URL}/rag/chat \
        -H "Content-Type: application/json" \
        -d '{
            "message": "I need help managing my time",
            "student_id": "test123",
            "context": {"cgpa": 7.5, "role": "student"}
        }')
    
    if echo "$RAG_CHAT" | grep -q "\"success\":true" || echo "$RAG_CHAT" | grep -q "response"; then
        print_pass "RAG chat working"
    else
        print_fail "RAG chat failed: $RAG_CHAT"
    fi
    
    print_test "Knowledge base stats"
    STATS=$(curl -s ${LLM_URL}/rag/stats)
    
    if echo "$STATS" | grep -q "total_documents" || echo "$STATS" | grep -q "chunks"; then
        print_pass "Knowledge base stats retrieved"
    else
        print_fail "Stats retrieval failed: $STATS"
    fi
}

# Test 6: Chat Endpoints
test_chat_endpoints() {
    print_section "Chat Endpoints"
    
    print_test "AI chatbot"
    AI_CHAT=$(curl -s -X POST ${BACKEND_URL}/api/chat/ai \
        -H "Authorization: Bearer ${STUDENT_TOKEN}" \
        -H "Content-Type: application/json" \
        -d '{"message": "How can I improve my study habits?"}')
    
    if echo "$AI_CHAT" | grep -q "\"success\":true" || echo "$AI_CHAT" | grep -q "response"; then
        print_pass "AI chatbot working"
    else
        print_fail "AI chatbot failed: $AI_CHAT"
    fi
    
    print_test "Get unread count"
    UNREAD=$(curl -s -X GET ${BACKEND_URL}/api/chat/unread-count \
        -H "Authorization: Bearer ${STUDENT_TOKEN}")
    
    if echo "$UNREAD" | grep -q "\"success\":true" || echo "$UNREAD" | grep -q "count"; then
        print_pass "Unread count endpoint working"
    else
        print_fail "Unread count failed: $UNREAD"
    fi
}

# Test 7: Alert Endpoints
test_alert_endpoints() {
    print_section "Alert Endpoints"
    
    print_test "Get my alerts"
    ALERTS=$(curl -s -X GET "${BACKEND_URL}/api/admin/alerts?limit=10" \
        -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    if echo "$ALERTS" | grep -q "\"success\":true" || echo "$ALERTS" | grep -q "alerts"; then
        print_pass "Alerts retrieved"
    else
        print_fail "Alerts retrieval failed: $ALERTS"
    fi
}

# Test 8: Admin Endpoints
test_admin_endpoints() {
    print_section "Admin Endpoints"
    
    if [ -z "$ADMIN_TOKEN" ]; then
        print_fail "Admin token not available, skipping admin tests"
        return
    fi
    
    print_test "Get dashboard stats"
    STATS=$(curl -s -X GET ${BACKEND_URL}/api/admin/dashboard-stats \
        -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    if echo "$STATS" | grep -q "\"users\"" || echo "$STATS" | grep -q "\"success\":true"; then
        print_pass "Dashboard stats retrieved"
    else
        print_fail "Dashboard stats failed: $STATS"
    fi
    
    print_test "Get all students"
    STUDENTS=$(curl -s -X GET ${BACKEND_URL}/api/admin/students \
        -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    if echo "$STUDENTS" | grep -q "\"success\":true"; then
        print_pass "Students list retrieved"
    else
        print_fail "Students list failed: $STUDENTS"
    fi
}

# Test 9: Mentor Endpoints
test_mentor_endpoints() {
    print_section "Mentor Endpoints"
    
    if [ -z "$MENTOR_TOKEN" ]; then
        print_fail "Mentor token not available, skipping mentor tests"
        return
    fi
    
    print_test "Get mentor profile"
    MENTOR_PROFILE=$(curl -s -X GET ${BACKEND_URL}/api/admin/mentors \
        -H "Authorization: Bearer ${ADMIN_TOKEN}")
    
    if echo "$MENTOR_PROFILE" | grep -q "\"success\":true" || echo "$MENTOR_PROFILE" | grep -q "mentors"; then
        print_pass "Mentor profiles retrieved"
    else
        print_fail "Mentor profile retrieval failed: $MENTOR_PROFILE"
    fi
}

# Test 10: Risk Prediction (with fallback)
test_risk_prediction() {
    print_section "Risk Prediction (Fallback Mode)"
    
    if [ -z "$MENTOR_TOKEN" ] || [ -z "$STUDENT_ID" ] || [ -z "$MENTOR_ID" ]; then
        print_fail "Required tokens or IDs not available"
        return
    fi
    
    # First, admin needs to assign student to mentor
    print_test "Assign student to mentor"
    if [ -n "$ADMIN_TOKEN" ]; then
        ASSIGN=$(curl -s -X POST ${BACKEND_URL}/api/admin/assign-mentee \
            -H "Authorization: Bearer ${ADMIN_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "{\"mentorId\": \"${MENTOR_ID}\", \"studentId\": \"${STUDENT_ID}\"}")
        
        if echo "$ASSIGN" | grep -q "\"success\":true"; then
            print_pass "Student assigned to mentor"
        else
            print_fail "Assignment failed, trying alternate method: $ASSIGN"
        fi
    fi
    
    sleep 1  # Wait for assignment
    
    print_test "Calculate risk (fallback mode)"
    RISK=$(curl -s -X POST "${BACKEND_URL}/api/mentors/mentees/${STUDENT_ID}/calculate-risk" \
        -H "Authorization: Bearer ${MENTOR_TOKEN}")
    
    if echo "$RISK" | grep -q "prediction" || echo "$RISK" | grep -q "\"success\":true"; then
        print_pass "Risk calculated successfully"
    else
        print_fail "Risk calculation failed: $RISK"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════╗"
    echo "║  BodhyaAI API Testing Suite          ║"
    echo "║  Automated Endpoint Validation        ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    test_health_checks
    test_registration
    test_authentication
    test_student_endpoints
    test_rag_endpoints
    test_chat_endpoints
    test_alert_endpoints
    test_admin_endpoints
    test_mentor_endpoints
    test_risk_prediction
    
    # Summary
    print_section "Test Summary"
    echo -e "Total Tests:  ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed:       ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed:       ${FAILED_TESTS}${NC}"
    echo -e "Success Rate: $(( PASSED_TESTS * 100 / TOTAL_TESTS ))%"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed${NC}"
        exit 1
    fi
}

# Run tests
main
