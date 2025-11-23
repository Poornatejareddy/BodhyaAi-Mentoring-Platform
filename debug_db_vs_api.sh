#!/bin/bash
# Debug script to check database state vs API response

STUDENT_ID="68e89cce1e888192ec002ae5"  # manikanta
TOKEN="YOUR_AUTH_TOKEN_HERE"  # Replace with actual token from localStorage

echo "========================================="
echo "Database vs API Response Comparison"
echo "========================================="
echo ""

echo "1. Triggering Risk Calculation..."
CALC_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:5000/api/mentors/mentees/${STUDENT_ID}/calculate-risk)

echo "Calculate Response:"
echo "$CALC_RESPONSE" | jq '.'
echo ""

echo "2. Waiting 1 second for database to sync..."
sleep 1

echo "3. Fetching student data from GET endpoint..."
GET_RESPONSE=$(curl -s \
  -H "Authorization: Bearer ${TOKEN}" \
  http://localhost:5000/api/mentors/mentees/${STUDENT_ID})

echo "GET Response - Academic Risk:"
echo "$GET_RESPONSE" | jq '.data.academicRisk | {prediction, confidence, calculatedAt, warnings}'
echo ""

echo "4. Checking if prediction matches..."
CALC_PRED=$(echo "$CALC_RESPONSE" | jq -r '.data.prediction')
GET_PRED=$(echo "$GET_RESPONSE" | jq -r '.data.academicRisk.prediction')

echo "Calculation returned: $CALC_PRED"
echo "GET endpoint returns: $GET_PRED"
echo ""

if [ "$CALC_PRED" = "$GET_PRED" ]; then
    echo "✅ MATCH - Data is consistent"
else
    echo "❌ MISMATCH - GET endpoint not returning updated data!"
    echo "This is a database or caching issue"
fi
