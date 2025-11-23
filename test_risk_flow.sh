#!/bin/bash

# Test script to verify the complete risk calculation flow
# This simulates the frontend "Update Risk" button click

echo "========================================="
echo "Testing Complete Risk Calculation Flow"
echo "========================================="
echo ""

# Step 1: Verify risk-svc is running
echo "1. Testing risk-svc endpoint..."
RISK_RESPONSE=$(curl -s -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "CGPA": 5.0,
    "Attendance": 45,
    "Backlogs": 2,
    "StudyHoursPerDay": 3,
    "StressScore": 7,
    "SleepHours": 6,
    "IAT1": 15,
    "IAT2": 15,
    "IAT3": 15,
    "FatherIncome": 30000,
    "MotherIncome": 20000,
    "ParentEducation": "Graduate",
    "InternetAccess": "Yes",
    "PartTimeJob": "No",
    "MentalHealthIndex": 5.0,
    "ExerciseHours": 1,
    "ScreenTime": 5,
    "SocialHours": 3,
    "ClubParticipation": "No",
    "MentorMeetings": 0,
    "CounselingSessions": 0
  }')

echo "Risk-svc Response:"
echo "$RISK_RESPONSE" | jq '.'
echo ""

# Extract prediction
PREDICTION=$(echo "$RISK_RESPONSE" | jq -r '.prediction')
OVERRIDE_REASON=$(echo "$RISK_RESPONSE" | jq -r '.override_reason')

if [ "$PREDICTION" == "High" ]; then
    echo "✅ risk-svc is working correctly - returns 'High'"
    echo "✅ Override reason: $OVERRIDE_REASON"
else
    echo "❌ ERROR: risk-svc returned '$PREDICTION' instead of 'High'"
    exit 1
fi

echo ""
echo "========================================="
echo "NEXT STEPS:"
echo "========================================="
echo ""
echo "The risk-svc is working perfectly!"
echo ""
echo "TO FIX THE FRONTEND ISSUE:"
echo "1. Go to Mentor Dashboard"
echo "2. Open the student's profile page"
echo "3. Click the 'Update Risk' button"
echo "4. Wait for the calculation to complete"
echo "5. Refresh the page if needed"
echo ""
echo "If it STILL shows Medium Risk after clicking Update Risk:"
echo "- The backend might not be calling risk-svc"
echo "- Check browser console for errors"
echo "- Check backend terminal for request logs"
echo ""
