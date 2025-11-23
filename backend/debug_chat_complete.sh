#!/bin/bash
# Comprehensive chat debugging script

echo "=== CHAT SYSTEM DEBUGGING ==="

# Get tokens
echo -e "\n1. Getting auth tokens..."
MENTOR_TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@test.com","password":"password123"}' | jq -r '.token')

STUDENT_TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manikanta@test.com","password":"password123"}' | jq -r '.token')

# Get user IDs
MENTOR_DATA=$(curl -s "http://localhost:5000/api/mentors/me" \
  -H "Authorization: Bearer $MENTOR_TOKEN")
MENTOR_ID=$(echo $MENTOR_DATA | jq -r '.data.user._id')

STUDENT_DATA=$(curl -s "http://localhost:5000/api/students/my-profile" \
  -H "Authorization: Bearer $STUDENT_TOKEN")
STUDENT_ID=$(echo $STUDENT_DATA | jq -r '.data.user._id')

echo "Mentor ID: $MENTOR_ID"
echo "Student ID: $STUDENT_ID"

# Send test message from MENTOR to STUDENT
echo -e "\n2. Mentor sending message to student..."
MENTOR_MSG=$(curl -s -X POST "http://localhost:5000/api/chat/send" \
  -H "Authorization: Bearer $MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$STUDENT_ID\",\"content\":\"DEBUG: Mentor test at $(date +%T)\"}")

echo "$MENTOR_MSG" | jq '{success, sender: .data.sender.name, receiver: .data.receiver.name}'

# Get chat history from STUDENT side
echo -e "\n3. Student fetching chat history..."
STUDENT_HISTORY=$(curl -s "http://localhost:5000/api/chat/history/$MENTOR_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Total messages: $(echo $STUDENT_HISTORY | jq '.data | length')"
echo "Unique senders:"
echo "$STUDENT_HISTORY" | jq -r '.data[] | .sender.name' | sort -u

echo -e "\n4. Last 5 messages:"
echo "$STUDENT_HISTORY" | jq '.data[-5:] | .[] | {sender: .sender.name, receiver: .receiver.name, content}'

echo -e "\n=== DEBUGGING COMPLETE ==="
