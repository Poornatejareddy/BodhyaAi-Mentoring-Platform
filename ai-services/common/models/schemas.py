from pydantic import BaseModel
from typing import Optional, Dict, List

class AcademicInput(BaseModel):
    # Academic
    CGPA: float = 0.0
    Attendance: int = 0
    Backlogs: int = 0
    StudyHoursPerDay: int = 2
    IAT1: int = 0
    IAT2: int = 0
    IAT3: int = 0
    
    # Socio-economic
    FatherIncome: int = 0
    MotherIncome: int = 0
    ParentEducation: str = "Graduate"  # Categorical
    InternetAccess: str = "Yes"        # Categorical
    PartTimeJob: str = "No"            # Categorical
    
    # Lifestyle & Health
    StressScore: int = 5
    SleepHours: int = 6
    MentalHealthIndex: float = 5.0
    ExerciseHours: int = 1
    ScreenTime: int = 4
    SocialHours: int = 2
    
    # Engagement
    ClubParticipation: str = "No"      # Categorical
    MentorMeetings: int = 0
    CounselingSessions: int = 0

class SurveyInput(BaseModel):
    Q1: float
    Q2: float
    Q3: float
    Q4: float
    Q5: float
    Q6: float
    Q7: float
    Q8: float
    Q9: float
    Q10: float
    Q11: float
    Q12: float
    Q13: float
    Q14: float
    Q15: float
    Q16: float
    Q17: float
    Q18: float
    Q19: float
    Q20: float
    Q21: float
    Q22: float
    Q23: float
    Q24: float
    Q25: float
    Q26: float
    Q27: float
    Q28: float
    Q29: float
    Q30: float
    Q31: float
    Q32: float
    Q33: float
    Q34: float
    Q35: float
    Q36: float
    Q37: float
    Q38: float
    Q39: float
    Q40: float
    Q41: float
    Q42: float
    Q43: float
    Q44: float
    Q45: float
    Q46: float
    Q47: float
    Q48: float
    Q49: float
    Q50: float

class RiskInput(BaseModel):
    CGPA: float
    Attendance: float
    StressScore: float
    SleepHours: float
    Backlogs: int
    StudyHoursPerDay: float
    FatherIncome: float
    MotherIncome: float
    HasSiblings: Optional[int] = 0
    SiblingCount: Optional[int] = 0
    MentalHealthIndex: float
    ExerciseHours: float
    ScreenTime: float
    
    # Add optional parameters for remaining features to avoid breaking backward compatibility
    ParentEducation: Optional[str] = "Graduate"
    InternetAccess: Optional[str] = "Yes"
    PartTimeJob: Optional[str] = "No"
    ClubParticipation: Optional[str] = "No"
    MentorMeetings: Optional[int] = 0
    CounselingSessions: Optional[int] = 0
    SocialHours: Optional[int] = 2
    IAT1: Optional[int] = 25
    IAT2: Optional[int] = 25
    IAT3: Optional[int] = 25

class CogInput(BaseModel):
    Q1: int
    Q2: int
    Q3: int
    Q4: int
    Q5: int
    Q6: int
    Q7: int
    Q8: int
    Q9: int
    Q10: int
    Q11: int
    Q12: int
    Q13: int
    Q14: int
    Q15: int
    Q16: int
    Q17: int
    Q18: int
    Q19: int
    Q20: int
    Q21: int
    Q22: int
    Q23: int
    Q24: int
    Q25: int
    Q26: int
    Q27: int
    Q28: int
    Q29: int
    Q30: int
    Q31: int
    Q32: int
    Q33: int
    Q34: int
    Q35: int
    Q36: int
    Q37: int
    Q38: int
    Q39: int
    Q40: int
    Q41: int
    Q42: int
    Q43: int
    Q44: int
    Q45: int
    Q46: int
    Q47: int
    Q48: int
    Q49: int
    Q50: int
