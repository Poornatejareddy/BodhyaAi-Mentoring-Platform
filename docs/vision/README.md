# Product vision

## Problem and intended impact

Academic underperformance is commonly identified after grades or attendance have already deteriorated. BodhyaAI attempts to give students, mentors, and administrators earlier visibility by combining self-reported academic/wellbeing inputs, risk classification, personality-survey outputs, mentoring interventions, alerts, and messaging.

Target users are students (self-service plan, survey, profile, explanations), mentors (mentees, alerts, interventions, reports), and administrators (user/assignment/alert/audit management). The intended business outcome is more timely and accountable support; the educational outcome is earlier conversations and follow-up, not automated academic or counselling decisions.

## Current implementation

**Implemented:** JWT sign-in, role guards, MongoDB profiles, risk prediction endpoint, SHAP-like contribution storage, Big Five-style survey scoring, mentor interventions, alerts, Socket.IO messages, PDF/CSV/report routes, and Gemini-backed LLM routes.

**Not established by the repository:** measured retention improvement, model validation on institutional data, LMS/ERP integration, clinical counselling workflow, consent governance beyond profile toggles, tenant isolation, or billing. Any claim of institutional impact must be treated as a hypothesis until evaluated prospectively.
