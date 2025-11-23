#!/bin/bash
# Test chat functionality end-to-end

echo "=== Testing Chat Functionality ==="

# Get mentor token
echo -e "\n1. Login as mentor..."
MENTOR_TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor@test.com","password":"password123"}' | jq -r '.token')

echo "Mentor token: ${MENTOR_TOKEN:0:20}..."

# Get student token
echo -e "\n2. Login as student..."
STUDENT_TOKEN=$(curl -s -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"manikanta@test.com","password":"password123"}' | jq -r '.token')

echo "Student token: ${STUDENT_TOKEN:0:20}..."

# Get student ID
echo -e "\n3. Get student profile to find ID..."
STUDENT_ID=$(curl -s "http://localhost:5000/api/students/my-profile" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq -r '.data.user._id')

echo "Student ID: $STUDENT_ID"

# Send message from mentor to student
echo -e "\n4. Mentor sends message to student..."
curl -s -X POST "http://localhost:5000/api/chat/send" \
  -H "Authorization: Bearer $MENTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"receiverId\":\"$STUDENT_ID\",\"content\":\"Test message from mentor\"}" | jq '.'

# Get chat history from student side
echo -e "\n5. Student fetches chat history..."
curl -s "http://localhost:5000/api/chat/history/68d02007a5325f2e37e9ec35" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.data[] | {_id, sender: .sender.name, receiver: .receiver.name, content}'

echo -e "\n=== Test Complete ===\"
