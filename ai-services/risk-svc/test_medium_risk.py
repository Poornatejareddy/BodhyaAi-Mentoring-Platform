import requests
import json

url = "http://localhost:8000/predict"

# Data that SHOULD be Medium Risk
# CGPA 6.5 (Score +15), Attendance 80% (Score +10), Backlogs 1 (Score +10) = 35 (Medium range 25-50)
data = {
    "CGPA": 6.5,
    "Attendance": 80,
    "Backlogs": 1,
    "StudyHoursPerDay": 5,
    "FatherIncome": 500000,
    "MotherIncome": 400000,
    "ParentEducation": "Graduate",
    "InternetAccess": "Yes",
    "PartTimeJob": "No",
    "StressScore": 7,
    "SleepHours": 6,
    "MentalHealthIndex": 6,
    "ExerciseHours": 1,
    "ScreenTime": 4,
    "SocialHours": 2,
    "ClubParticipation": "No",
    "MentorMeetings": 1,
    "CounselingSessions": 0,
    "IAT1": 60,
    "IAT2": 65,
    "IAT3": 70
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print("Response:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
