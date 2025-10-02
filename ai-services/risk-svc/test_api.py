import requests

# FastAPI server URL
URL = "http://127.0.0.1:8000/predict"

# Sample student data
payload = {
    "student_id": "S12345",
    "features": {
        "SGPA_Sem1": 7.5,
        "SGPA_Sem2": 7.8,
        "SGPA_Sem3": 8.0,
        "SGPA_Sem4": 8.2,
        "SGPA_Sem5": 8.1,
        "SGPA_Sem6": 8.3,
        "SGPA_Sem7": 8.4,
        "SGPA_Sem8": 8.5,
        "CGPA": 8.2,
        "IAT1": 78,
        "IAT2": 80,
        "IAT3": 79,
        "Attendance": 90,
        "StudyHoursPerDay": 3,
        "FavoriteSubject": 0,
        "Backlogs": 0,
        "Extracurricular": 1,
        "Openness": 0.7,
        "Conscientiousness": 0.8,
        "Extraversion": 0.6,
        "Agreeableness": 0.7,
        "Neuroticism": 0.3,
        "FatherEducation": 0,
        "MotherEducation": 0,
        "FatherOccupation": 0,
        "MotherOccupation": 0,
        "FatherIncome": 0,
        "MotherIncome": 0,
        "ParentSupport": 1,
        "HasSiblings": 1,
        "SiblingCount": 1,
        "CasteCategory": 0,
        "UrbanRural": 1,
        "StressScore": 40,
        "SleepHours": 7,
        "MentalHealthIndex": 0.8,
        "DietType": 0,
        "ExerciseHours": 1,
        "ScreenTime": 2,
        "HostelDayScholar": 0,
        "TransportMode": 0,
        "MentorSupport": 1,
        "PeerSupport": 1
    }
}

# Send POST request
response = requests.post(URL, json=payload)

# Print response
if response.status_code == 200:
    print("✅ Prediction Result:")
    print(response.json())
else:
    print(f"❌ Error {response.status_code}: {response.text}")
