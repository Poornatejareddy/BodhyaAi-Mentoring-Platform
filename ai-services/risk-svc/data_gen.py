import random
import pandas as pd
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

# Config
NUM_STUDENTS = 1200
BRANCHES = ["CSE", "AIML", "ECE", "EEE", "MECH", "CIVIL"]
SECTIONS = ["A", "B", "C"]
YEARS = [1, 2, 3, 4]
MENTORS = ["Dr. Ramesh", "Prof. Kavya", "Dr. Arvind", "Prof. Meena"]
COLLEGE_NAME = "CMRIT"

def random_sgpa():
    return round(random.uniform(5.0, 10.0), 2)

def random_income():
    return random.randint(5000, 150000)

def risk_label(cgpa, attendance, stress, sleep, backlog):
    if cgpa < 6.0 or attendance < 60 or stress > 75 or sleep < 5 or backlog > 5:
        return "High"
    elif 6.0 <= cgpa < 7.5 or 60 <= attendance < 75 or 50 < stress <= 75:
        return "Medium"
    else:
        return "Low"

students = []
for i in range(NUM_STUDENTS):
    reg_no = f"CMR{2023000+i}"
    name = fake.name()
    age = random.randint(18, 23)
    gender = random.choice(["Male", "Female"])
    branch = random.choice(BRANCHES)
    year = random.choice(YEARS)
    section = random.choice(SECTIONS)
    mentor = random.choice(MENTORS)

    # SGPA & CGPA
    sgpas = [random_sgpa() for _ in range(8)]
    cgpa = round(sum(sgpas[:year*2]) / (year*2), 2)

    # IAT scores
    iat_scores = [random.randint(20, 30) for _ in range(3)]

    # Family background
    father_inc = random_income()
    mother_inc = random_income()
    has_siblings = random.choice([True, False])
    sibling_count = random.randint(0, 3) if has_siblings else 0

    # Lifestyle & health
    stress = random.randint(20, 100)
    sleep = random.randint(4, 9)
    mhi = round(random.uniform(0.3, 1.0), 2)  # Mental Health Index (0-1)
    exercise = random.randint(0, 14)  # hours/week
    screentime = random.randint(1, 10)  # hrs/day

    # Academic engagement
    attendance = random.randint(40, 100)
    study_hours = random.randint(0, 8)
    backlogs = random.randint(0, 8)

    # Risk Label
    risk = risk_label(cgpa, attendance, stress, sleep, backlogs)

    students.append([
        reg_no, name, age, gender, branch, year, section, COLLEGE_NAME, mentor,
        *sgpas, cgpa, *iat_scores, attendance, study_hours,
        backlogs, father_inc, mother_inc,
        has_siblings, sibling_count,
        stress, sleep, mhi, exercise, screentime, risk
    ])

columns = [
    "RegNo", "Name", "Age", "Gender", "Branch", "Year", "Section", "CollegeName", "MentorName",
    "SGPA_Sem1", "SGPA_Sem2", "SGPA_Sem3", "SGPA_Sem4", "SGPA_Sem5", "SGPA_Sem6", "SGPA_Sem7", "SGPA_Sem8",
    "CGPA", "IAT1", "IAT2", "IAT3", "Attendance", "StudyHoursPerDay", "Backlogs",
    "FatherIncome", "MotherIncome", "HasSiblings", "SiblingCount",
    "StressScore", "SleepHours", "MentalHealthIndex", "ExerciseHours", "ScreenTime",
    "RiskLevel"
]

df = pd.DataFrame(students, columns=columns)
df.to_csv("academic_dataset.csv", index=False)

print(f"✅ Academic dataset generated: academic_dataset.csv with {NUM_STUDENTS} students")
print(f"Columns: {len(columns)}")
