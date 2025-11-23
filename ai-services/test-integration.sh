#!/bin/bash

# AI Services Integration Test Script
# Tests risk-svc, cog-svc, and xai-svc integration

echo "🧪 Testing BodhyaAI AI Services Integration"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Health Checks
echo "1️⃣  Testing Service Health Checks..."
echo "-----------------------------------"

echo -n "  • risk-svc (port 8000): "
if curl -s http://localhost:8000/ | grep -q "ok"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

echo -n "  • cog-svc (port 8001): "
if curl -s http://localhost:8001/ | grep -q "ok"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

echo -n "  • xai-svc (port 8002): "
if curl -s http://localhost:8002/ 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

echo -n "  • Backend (port 5000): "
if curl -s http://localhost:5000/ | grep -q "BodhyaAI"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not responding${NC}"
fi

echo ""

# Test 2: Risk Prediction
echo "2️⃣  Testing Risk Prediction Service..."
echo "------------------------------------"
RISK_RESPONSE=$(curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "CGPA": 7.5,
    "Attendance": 85,
    "StressScore": 5,
    "SleepHours": 6,
    "Backlogs": 0,
    "StudyHoursPerDay": 4,
    "FatherIncome": 50000,
    "MotherIncome": 30000,
    "HasSiblings": 1,
    "SiblingCount": 1,
    "MentalHealthIndex": 6.0,
    "ExerciseHours": 2,
    "ScreenTime": 5
  }')

if echo "$RISK_RESPONSE" | grep -q "prediction"; then
    PREDICTION=$(echo "$RISK_RESPONSE" | grep -o '"prediction":"[^"]*"' | cut -d'"' -f4)
    CONFIDENCE=$(echo "$RISK_RESPONSE" | grep -o '"confidence":[0-9.]*' | cut -d':' -f2)
    echo -e "  ${GREEN}✓ Risk prediction successful${NC}"
    echo "    Prediction: $PREDICTION"
    echo "    Confidence: $CONFIDENCE"
else
    echo -e "  ${RED}✗ Risk prediction failed${NC}"
    echo "    Response: $RISK_RESPONSE"
fi

echo ""

# Test 3: Cognitive Profiling (cog-svc)
echo "3️⃣  Testing Cognitive Profiling Service..."
echo "---------------------------------------"

# Generate sample survey data (Q1-Q50 with random values 1-5)
SURVEY_DATA='{'
for i in {1..50}; do
    RANDOM_VAL=$((1 + RANDOM % 5))
    SURVEY_DATA+="\"Q$i\":$RANDOM_VAL"
    if [ $i -lt 50 ]; then
        SURVEY_DATA+=","
    fi
done
SURVEY_DATA+='}'

COG_RESPONSE=$(curl -s -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d "$SURVEY_DATA")

if echo "$COG_RESPONSE" | grep -q "predictions"; then
    echo -e "  ${GREEN}✓ Personality prediction successful${NC}"
    echo "    OCEAN Scores:"
    echo "      Openness: $(echo "$COG_RESPONSE" | grep -o '"Openness":[0-9.]*' | cut -d':' -f2)"
    echo "      Conscientiousness: $(echo "$COG_RESPONSE" | grep -o '"Conscientiousness":[0-9.]*' | cut -d':' -f2)"
    echo "      Extraversion: $(echo "$COG_RESPONSE" | grep -o '"Extraversion":[0-9.]*' | cut -d':' -f2)"
    echo "      Agreeableness: $(echo "$COG_RESPONSE" | grep -o '"Agreeableness":[0-9.]*' | cut -d':' -f2)"
    echo "      Neuroticism: $(echo "$COG_RESPONSE" | grep -o '"Neuroticism":[0-9.]*' | cut -d':' -f2)"
else
    echo -e "  ${RED}✗ Personality prediction failed${NC}"
    echo "    Response: $COG_RESPONSE"
fi

echo ""

# Test 4: XAI Service
echo "4️⃣  Testing Explainability Service..."
echo "-----------------------------------"
XAI_RESPONSE=$(curl -s -X POST http://localhost:8002/explain/risk \
  -H "Content-Type: application/json" \
  -d '{
    "CGPA": 5.5,
    "Attendance": 65,
    "StressScore": 8,
    "SleepHours": 5,
    "Backlogs": 2,
    "StudyHoursPerDay": 2,
    "FatherIncome": 40000,
    "MotherIncome": 25000,
    "HasSiblings": 0,
    "SiblingCount": 0,
    "MentalHealthIndex": 4.0,
    "ExerciseHours": 1,
    "ScreenTime": 8
  }')

if echo "$XAI_RESPONSE" | grep -q "prediction"; then
    WAR NINGS=$(echo "$XAI_RESPONSE" | grep -o '"warnings":\[[^]]*\]' | grep -o '⚠️[^"]*' | wc -l)
    echo -e "  ${GREEN}✓ XAI explanation successful${NC}"
    echo "    Warnings detected: $WARNINGS"
    if echo "$XAI_RESPONSE" | grep -q "Low attendance"; then
        echo "    ⚠️  Low attendance detected"
    fi
    if echo "$XAI_RESPONSE" | grep -q "CGPA below"; then
        echo "    ⚠️  CGPA below threshold"
    fi
    if echo "$XAI_RESPONSE" | grep -q "backlogs"; then
        echo "    ⚠️  Backlogs detected"
    fi
else
    echo -e "  ${RED}✗ XAI explanation failed${NC}"
    echo "    Response: $XAI_RESPONSE"
fi

echo ""

# Summary
echo "==========================================="
echo "✅ Integration Test Complete!"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test with real student data via backend API"
echo "2. Test personality survey submission: POST /api/personality/submit"
echo "3. Test risk prediction: POST /api/risk/predict/:studentId"
echo "4. Test full profile: GET /api/students/:id/full-profile"
echo ""
echo "🔗 Backend API Endpoints:"
echo "  • POST /api/personality/submit - Submit BFI-44 survey"
echo "  • GET  /api/personality/profile - Get own personality profile"
echo "  • POST /api/risk/predict/:studentId - Calculate risk"
echo "  • GET  /api/risk/student/:studentId - Get risk data"
echo "  • GET  /api/students/:id/full-profile - Get complete profile"
echo ""
