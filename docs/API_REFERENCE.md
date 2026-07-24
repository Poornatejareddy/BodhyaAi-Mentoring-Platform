# API Endpoint Reference

This document maps the primary HTTP REST API endpoints exposed by the BodhyaAI Express Gateway.

---

## 1. Authentication Service

### Register Account
*   **Method / Route**: `POST /api/auth/register`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "name": "Alex Smith",
      "email": "alex@university.edu",
      "password": "SecurePassword123",
      "role": "student"
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "id": "60d5ec4b1a2c3d4e5f6g7h8i",
        "name": "Alex Smith",
        "email": "alex@university.edu",
        "role": "student"
      }
    }
    ```

### Login Account
*   **Method / Route**: `POST /api/auth/login`
*   **Access**: Public
*   **Request Body**:
    ```json
    {
      "email": "alex@university.edu",
      "password": "SecurePassword123"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
    ```

---

## 2. Student Management Service

### Retrieve Profile
*   **Method / Route**: `GET /api/students/my-profile`
*   **Access**: Student only (requires JWT)
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "userId": "60d5ec4b1a2c3d4e5f6g7h8i",
        "cgpa": 7.8,
        "attendance": 88.5,
        "studyHours": 12,
        "consentGiven": true
      }
    }
    ```

### Submit Personality Survey Answers
*   **Method / Route**: `POST /api/students/my-profile/survey`
*   **Access**: Student only
*   **Request Body**:
    ```json
    {
      "answers": [5, 4, 2, 1, 5, 3, 4, 2, ...]
    }
    ```

---

## 3. Academic Risk & Explainability (XAI)

### Trigger Risk Prediction
*   **Method / Route**: `POST /api/risk/predict/:studentId`
*   **Access**: Mentor only (requires assigned student)
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "studentId": "60d5ec4b1a2c3...",
        "riskScore": 0.74,
        "riskLevel": "HIGH",
        "shapExplanations": [
          { "feature": "Attendance", "weight": 0.35, "effect": "increases risk" },
          { "feature": "StudyHours", "weight": -0.15, "effect": "reduces risk" }
        ]
      }
    }
    ```

---

## 4. LLM / Gemini Generative Services

### Request Student Study Plan
*   **Method / Route**: `POST /api/llm/study-plan`
*   **Access**: Student only
*   **Request Body**:
    ```json
    {
      "preferences": "focused sessions in the morning, visual learning"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "report": "# Personal Study Plan\n\nBased on your profile, here is a custom schedule..."
      }
    }
    ```

### Generate Class Cohort Report
*   **Method / Route**: `POST /api/llm/class-report`
*   **Access**: Mentor / Admin only
*   **Request Body**:
    ```json
    {
      "focusArea": "time_management"
    }
    ```
*   **Success Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "success": true,
        "report": "# Class Cohort Report\n\nTotal Size: 3 students...\n\n### Recommended Interventions..."
      }
    }
    ```
*   **Error Response (503 Service Unavailable)**:
    ```json
    {
      "success": false,
      "error": "AI Service (Gemini) is currently unavailable or quota limits were exceeded."
    }
    ```
