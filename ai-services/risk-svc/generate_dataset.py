# ai-services/risk-svc/generate_dataset.py
import random
import pandas as pd
from faker import Faker

fake = Faker()
Faker.seed(42)
random.seed(42)

# Config
NUM_STUDENTS = 50000
COLLEGE_CODE = "1CR"
BRANCH_CODES = {
    "CSE": "CS",
    "AIML": "AI",
    "ISE": "IS",
    "ECE": "EC",
    "EEE": "EE",
    "MECH": "ME",
    "CIVIL": "CV"
}
SECTIONS = ["A", "B", "C", "D"]
YEARS = [1, 2, 3, 4]
MENTORS = [
    "Dr. Ramesh", "Prof. Kavya", "Dr. Arvind", "Prof. Meena", "Dr. Suresh",
    "Prof. Lakshmi", "Dr. Anil", "Prof. Sneha", "Dr. Bhaskar", "Prof. Divya",
    "Dr. Ritu", "Prof. Nikhil", "Dr. Aparna", "Prof. Harsha", "Dr. Manoj",
    "Prof. Geetha", "Dr. Vinay", "Prof. Tejas", "Dr. Rachna", "Prof. Raghav",
    "Dr. Nisha", "Prof. Ananya", "Dr. Sai", "Prof. Rohit", "Dr. Mahesh"
]

# Helper functions
def random_sgpa():
    return round(random.uniform(4.5, 10.0), 2)

def random_income():
    return random.randint(8000, 250000)

def generate_iat(cgpa, num=3):
    """
    Generate 'num' IAT scores out of 50 based on CGPA.
    Higher CGPA → higher IAT marks on average.
    Gaussian noise added to avoid repetition.
    """
    mean = min(max(cgpa * 5, 20), 50)
    scores = [int(min(max(random.gauss(mean, 5), 0), 50)) for _ in range(num)]
    return scores

def risk_label(cgpa, attendance, stress, sleep, backlog, mhi):
    """
    Compute academic risk level based on multiple factors.
    """
    """
    Compute academic risk level based on multiple factors with some probabilistic noise.
    """
    # Base Score Calculation (Higher score = Higher Risk)
    score = 0
    
    # CGPA Impact (Weight: 40%)
    if cgpa < 5.0: score += 40
    elif cgpa < 6.0: score += 30
    elif cgpa < 7.0: score += 15
    
    # Attendance Impact (Weight: 30%)
    if attendance < 60: score += 30
    elif attendance < 75: score += 20
    elif attendance < 85: score += 10
    
    # Backlogs Impact (Weight: 20%)
    if backlog > 4: score += 20
    elif backlog > 2: score += 15
    elif backlog > 0: score += 10
    
    # Stress/Sleep/MHI Impact (Weight: 10%)
    if stress > 80: score += 5
    if sleep < 5: score += 5
    if mhi < 0.5: score += 5
    
    # Critical Failures    # Updated to match realistic academic standards
    # Force High risk for critical failures
    if attendance < 75 or cgpa < 6.0 or backlog >= 2:
        return 'High'

    # Add Random Noise (-10 to +10) to make it non-deterministic
    noise = random.randint(-10, 10)
    final_score = score + noise
    
    # Determine Risk Level
    if final_score >= 50:
        return "High"
    elif final_score >= 25:
        return "Medium"
    else:
        return "Low"

# Generate dataset
students = []

print(f"🔄 Generating {NUM_STUDENTS} student records...")

for i in range(1, NUM_STUDENTS + 1):
    branch = random.choice(list(BRANCH_CODES.keys()))
    year = random.choice(YEARS)
    section = random.choice(SECTIONS)
    join_year = random.choice([22, 23, 24])
    usn = f"{COLLEGE_CODE}{join_year}{BRANCH_CODES[branch]}{i:03d}"

    name = fake.name()
    age = random.randint(18, 24)
    gender = random.choice(["Male", "Female", "Other"])
    mentor = random.choice(MENTORS)
    college = "CMR Institute of Technology"

    # Academic - Realistic Distributions
    # CGPA: Normal distribution centered at 7.5
    sgpas = [min(max(random.gauss(7.5, 1.2), 4.0), 10.0) for _ in range(8)]
    sgpas = [round(x, 2) for x in sgpas]
    cgpa = round(sum(sgpas[:year * 2]) / (year * 2), 2)
    
    iat_scores = generate_iat(cgpa, 3)
    
    # Attendance: Skewed towards high attendance (avg ~85%)
    attendance = int(min(max(random.gauss(85, 10), 40), 100))
    
    study_hours = int(min(max(random.gauss(3, 2), 0), 12))
    
    # Backlogs: Weighted (60% have 0, 20% have 1, etc.)
    backlogs = random.choices([0, 1, 2, 3, 4, 5, 6, 7, 8], 
                            weights=[60, 20, 10, 5, 2, 1, 1, 0.5, 0.5])[0]

    # Socio-economic
    father_inc = random_income()
    mother_inc = random_income()
    parent_edu = random.choice(["None", "High School", "Graduate", "Post-Graduate", "PhD"])
    internet = random.choices(["Yes", "No"], weights=[90, 10])[0]
    parttime = random.choices(["Yes", "No"], weights=[20, 80])[0]

    # Lifestyle & health
    stress = int(min(max(random.gauss(40, 20), 0), 100)) # Avg stress 40
    sleep = int(min(max(random.gauss(7, 1.5), 4), 10))
    mhi = round(min(max(random.gauss(0.7, 0.2), 0.1), 1.0), 2)
    exercise = random.randint(0, 14)
    screentime = int(min(max(random.gauss(6, 2), 1), 12))
    social = random.randint(0, 15)

    # Engagement
    club = random.choices(["Yes", "No"], weights=[40, 60])[0]
    mentor_meets = random.randint(0, 5)
    counseling = random.choices([0, 1, 2, 3], weights=[80, 15, 4, 1])[0]

    # Risk label
    risk = risk_label(cgpa, attendance, stress, sleep, backlogs, mhi)

    students.append([
        usn, name, age, gender, branch, year, section, college, mentor,
        *sgpas, cgpa, *iat_scores, attendance, study_hours, backlogs,
        father_inc, mother_inc, parent_edu, internet, parttime,
        stress, sleep, mhi, exercise, screentime, social,
        club, mentor_meets, counseling, risk
    ])

    if i % 10000 == 0:
        print(f"  ✓ Generated {i}/{NUM_STUDENTS} records")

# Column names
columns = [
    "USN", "Name", "Age", "Gender", "Branch", "Year", "Section", "CollegeName", "MentorName",
    "SGPA_Sem1", "SGPA_Sem2", "SGPA_Sem3", "SGPA_Sem4", "SGPA_Sem5", "SGPA_Sem6", "SGPA_Sem7", "SGPA_Sem8",
    "CGPA", "IAT1", "IAT2", "IAT3", "Attendance", "StudyHoursPerDay", "Backlogs",
    "FatherIncome", "MotherIncome", "ParentEducation", "InternetAccess", "PartTimeJob",
    "StressScore", "SleepHours", "MentalHealthIndex", "ExerciseHours", "ScreenTime", "SocialHours",
    "ClubParticipation", "MentorMeetings", "CounselingSessions", "RiskLevel"
]

df = pd.DataFrame(students, columns=columns)
df.to_csv("datasets/academic_dataset_large.csv", index=False)

print(f"\n✅ Dataset generated: datasets/academic_dataset_large.csv with {len(df)} students")
print(f"📊 Columns: {len(columns)}")
print(f"📈 Risk Distribution:")
print(df['RiskLevel'].value_counts())
print("\n🔍 Sample records:")
print(df.head())
