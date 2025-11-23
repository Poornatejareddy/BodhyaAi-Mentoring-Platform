# BodhyaAI Platform

<div align="center">

![BodhyaAI Logo](https://via.placeholder.com/150x150?text=BodhyaAI)

**AI-Powered Student Success & Mentoring Platform**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

[Features](#features) •
[Quick Start](#quick-start) •
[Architecture](#architecture) •
[API](#api-documentation) •
[Deployment](#deployment)

</div>

---

## 📖 Overview

BodhyaAI is a next-generation AI-powered student mentoring and academic success platform. It combines machine learning-based risk prediction, explainable AI, real-time communication, personality profiling, and comprehensive administrative tools to create a holistic student support ecosystem.

### 🎯 Key Highlights

- **🤖 Advanced AI Services:** 4 microservices (Risk Prediction, XAI, Cognitive Profiling, LLM/RAG)
- **📊 Academic Risk Prediction:** XGBoost model with 21 features and SHAP explainability
- **🧠 Personality Profiling:** OCEAN (Big Five) personality assessment with BFI-44 survey
- **💬 Real-time Communication:** Socket.IO messaging with typing indicators and notifications
- **📚 RAG Knowledge Assistant:** FAISS-powered semantic search with contextual recommendations
- **🎨 Modern Dashboard:** Role-specific dashboards with analytics and charts
- **🔔 Smart Alerts:** 7 automated alert rules with priority-based notifications
- **🔐 Enterprise Security:** JWT authentication, RBAC, audit logging, and consent management

---

## ✨ Features

### For Students 👨‍🎓

- ✅ **Profile Management:** Update academic information, CGPA, attendance
- ✅ **Risk Explanation:** Growth-focused "Academic Health" visualization with actionable insights
- ✅ **Personality Assessment:** Complete BFI-44 survey for OCEAN personality profile
- ✅ **Cognitive Profile:** Radar chart visualization of personality traits
- ✅ **SHAP Analysis:** Understand which factors contribute to academic risk
- ✅ **AI Chatbot:** Get personalized study advice from RAG-powered assistant
- ✅ **Study Plan Generator:** AI-generated study plans based on goals and constraints
- ✅ **Real-time Messaging:** Chat with assigned mentor instantly
- ✅ **Alert Notifications:** Receive important updates with browser notifications

### For Mentors 👨‍🏫

- ✅ **Mentee Dashboard:** Overview of all assigned students with risk distribution
- ✅ **Real-time Statistics:** Total mentees, risk counts, average CGPA, attendance/CGPA distributions
- ✅ **Risk Assessment:** One-click AI-powered risk calculation for each student
- ✅ **SHAP Explainability:** Feature contribution analysis with interactive charts
- ✅ **Detailed Analytics:** Track mentee progress, academic history, and trends
- ✅ **Personality Insights:** View mentee's OCEAN profile for better understanding
- ✅ **Intervention Recommendations:** AI-suggested actions for at-risk students
- ✅ **Direct Messaging:** Real-time chat with students
- ✅ **Alert Management:** View and manage high-risk student alerts
- ✅ **Class Reports:** Generate comprehensive reports for all mentees

### For Administrators 🛡️

- ✅ **System Dashboard:** Real-time statistics (users, students, mentors, risk distribution)
- ✅ **User Management:** Full CRUD operations for all users (students, mentors, admins)
- ✅ **Mentor Assignment:** Assign and reassign students to mentors with one click
- ✅ **Mentor Reassignment:** Change student's mentor with automatic cleanup and notifications
- ✅ **Alerts Management:** View, filter, and manage all system alerts by priority
- ✅ **Activity Logs:** Comprehensive audit trail with filtering by user, action, and role
- ✅ **Alert Broadcasting:** Send custom alerts to specific users or roles
- ✅ **Analytics Dashboard:** Charts for user distribution, risk analysis, and activity trends
- ✅ **Audit Logging:** Track all system activities for compliance and security

### AI/ML Capabilities 🤖

- ✅ **Academic Risk Prediction:** XGBoost model with 21 features (CGPA, attendance, stress, sleep, etc.)
- ✅ **Explainable AI (XAI):** SHAP-based feature importance with class-specific explanations
- ✅ **Personality Profiling:** ML models for OCEAN traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
- ✅ **Semantic Search:** FAISS vector store with 384-dimensional embeddings
- ✅ **RAG System:** Retrieval-Augmented Generation for contextual responses
- ✅ **LLM Integration:** Google Gemini for study plans and mentor reports
- ✅ **Graceful Fallback:** Rule-based logic when AI services are unavailable

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                      │
│     Student Dashboard | Mentor Dashboard | Admin Dashboard    │
│              Modern UI with Tailwind CSS                      │
└───────────────────────┬──────────────────────────────────────┘
                        │ REST API + Socket.IO
                        ↓
┌──────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                      │
│  Authentication │ Chat │ Alerts │ User Management │ API      │
└──────┬──────────┬─────────┬──────────────────────┬──────────┘
       │          │         │                      │
       ↓          ↓         ↓                      ↓
┌────────────┐ ┌────────────────────────────────────────────┐
│  MongoDB   │ │          AI Services (Python)               │
│  Database  │ │  ┌─────────────────────────────────────┐   │
└────────────┘ │  │ LLM-SVC :8003 (RAG + Study Plans)   │   │
               │  │ - FAISS Vector Store                 │   │
               │  │ - Google Gemini Integration          │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ RISK-SVC :8000 (Risk Prediction)    │   │
               │  │ - XGBoost Model (21 features)       │   │
               │  │ - Business Rules Engine              │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ XAI-SVC :8002 (Explainability)      │   │
               │  │ - SHAP Feature Importance           │   │
               │  │ - Class-specific Analysis            │   │
               │  └─────────────────────────────────────┘   │
               │  ┌─────────────────────────────────────┐   │
               │  │ COG-SVC :8001 (Cognitive Profile)   │   │
               │  │ - OCEAN Personality Models          │   │
               │  │ - BFI-44 Survey Processing          │   │
               │  └─────────────────────────────────────┘   │
               └────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18 + Vite (Lightning-fast dev server)
- Tailwind CSS (Modern styling)
- React Router v6 (Client-side routing)
- Socket.IO Client (Real-time features)
- Recharts (Analytics visualization)
- Axios (HTTP client)

**Backend:**
- Node.js 18+ + Express
- MongoDB + Mongoose (Data modeling)
- Socket.IO (Real-time bidirectional communication)
- JWT + bcryptjs (Authentication & encryption)
- Multer (File uploads)
- Nodemon (Auto-reload development)

**AI/ML Services:**
- Python 3.10 + FastAPI (High-performance APIs)
- Scikit-learn (ML models)
- XGBoost (Gradient boosting)
- SHAP (Explainability)
- FAISS (Vector similarity search)
- Sentence Transformers (all-MiniLM-L6-v2 embeddings)
- Google Gemini API (LLM generation)
- Pandas + NumPy (Data processing)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/))
- **MongoDB** 6+ ([Download](https://www.mongodb.com/try/download/community))
- **npm** or **yarn**
- **Google Gemini API Key** (optional, for LLM features)

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Poornatejareddy/BodhyaAi-Mentoring-Platform.git
cd BodhyaAi-Mentoring-Platform
```

#### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4. Install AI Services Dependencies

**Risk Service:**
```bash
cd ../ai-services/risk-svc
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**XAI Service:**
```bash
cd ../xai-svc
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Cognitive Service:**
```bash
cd ../cog-svc
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**LLM Service:**
```bash
cd ../llm-svc
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 5. Configure Environment Variables

**Backend** (`backend/.env`):
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-in-production
MONGO_URI=mongodb://localhost:27017/bodhyai
PORT=5000
FRONTEND_URL=http://localhost:5173

# AI Service URLs
RISK_SERVICE_URL=http://localhost:8000
XAI_SERVICE_URL=http://localhost:8002
COG_SERVICE_URL=http://localhost:8001
LLM_SERVICE_URL=http://localhost:8003
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000
```

**LLM Service** (`ai-services/llm-svc/.env`):
```env
GEMINI_API_KEY=your-google-gemini-api-key
MODEL_NAME=gemini-1.5-flash
BACKEND_URL=http://localhost:5000
```

#### 6. Initialize the Database (Optional)

```bash
cd backend
node setup_test_data.js
```

This creates:
- 1 Admin user
- 2 Mentor users
- 5 Student users
- Sample chat messages
- Sample alerts

#### 7. Start All Services

**Option A: Manual Start (Recommended for Development)**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Risk Service:**
```bash
cd ai-services/risk-svc
source venv/bin/activate
uvicorn service:app --reload --port 8000
```

**Terminal 4 - XAI Service:**
```bash
cd ai-services/xai-svc
source venv/bin/activate
uvicorn service:app --reload --port 8002
```

**Terminal 5 - Cognitive Service:**
```bash
cd ai-services/cog-svc
source venv/bin/activate
uvicorn service:app --reload --port 8001
```

**Terminal 6 - LLM Service:**
```bash
cd ai-services/llm-svc
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8003 --reload
```

**Option B: All AI Services at Once**
```bash
bash ai-services/start_all_services.sh
```

#### 8. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Docs:** http://localhost:5000/api/docs
- **Risk Service:** http://localhost:8000/docs
- **XAI Service:** http://localhost:8002/docs
- **Cognitive Service:** http://localhost:8001/docs
- **LLM Service:** http://localhost:8003/docs

#### 9. Default Login Credentials

**Admin:**
```
Email: admin@bodhyai.com
Password: Admin@123
```

**Mentor:**
```
Email: mentor1@bodhyai.com
Password: Mentor@123
```

**Student:**
```
Email: student1@bodhyai.com
Password: Student@123
```

---

## 🐳 Docker Quick Start

### Using Docker Compose

#### Start All Services:
```bash
docker-compose up -d
```

#### View Logs:
```bash
docker-compose logs -f
```

#### Stop Services:
```bash
docker-compose down
```

#### With Volume Persistence:
```bash
docker-compose up -d --build
```

---

## 📚 API Documentation

### Base URLs

- **Backend:** `http://localhost:5000/api`
- **Risk Service:** `http://localhost:8000`
- **XAI Service:** `http://localhost:8002`
- **Cognitive Service:** `http://localhost:8001`
- **LLM Service:** `http://localhost:8003`

### Authentication

All protected endpoints require JWT token:
```bash
Authorization: Bearer <your-jwt-token>
```

### Key Endpoint Categories

#### 🔐 Authentication (`/api/auth`)
```bash
POST   /register              # Register new user
POST   /login                 # Login and get token
GET    /me                    # Get current user info
POST   /logout                # Logout (optional)
```

#### 💬 Chat (`/api/chat`)
```bash
POST   /send                  # Send message
GET    /history/:userId       # Get chat history
POST   /ai                    # AI chatbot conversation
GET    /unread-count          # Get unread message count
PUT    /mark-read/:messageId  # Mark message as read
DELETE /:messageId            # Delete message
PUT    /:messageId            # Edit message
```

#### 👨‍🎓 Students (`/api/students`)
```bash
GET    /my-profile                           # Get student profile
PUT    /my-profile                           # Update profile
GET    /my-profile/risk-explanation          # Get risk analysis with SHAP
POST   /my-profile/survey                    # Submit BFI-44 personality survey
GET    /my-profile/cognitive                 # Get cognitive/personality profile
POST   /my-profile/calculate-risk            # Trigger risk calculation
```

#### 👨‍🏫 Mentors (`/api/mentors`)
```bash
GET    /my-mentees                           # Get all assigned mentees
GET    /mentees/:id                          # Get mentee details
POST   /mentees/:id/calculate-risk           # Calculate student risk
PUT    /mentees/:id/data                     # Update mentee data
POST   /me/assign-mentee                     # Self-assign mentee
GET    /dashboard-stats                      # Get mentor dashboard stats
GET    /class-report                         # Generate class report
```

#### 🛡️ Admin (`/api/admin`)
```bash
GET    /dashboard-stats                      # Dashboard statistics
GET    /users                                # Get all users (paginated)
POST   /users                                # Create new user
PUT    /users/:userId                        # Update user
DELETE /users/:userId                        # Delete user
GET    /students                             # Get all students
GET    /mentors                              # Get all mentors
POST   /assign-mentee                        # Assign student to mentor
PUT    /reassign-mentor                      # Reassign student's mentor
GET    /alerts                               # Get all alerts (with filters)
PUT    /alerts/:id/read                      # Mark alert as read
DELETE /alerts/:id                           # Delete alert
GET    /audit-logs                           # Get audit logs (with filters)
POST   /create-alert                         # Create custom alert
```

#### 🤖 AI Services

**Risk Prediction (Port 8000):**
```bash
POST   /predict                              # Predict academic risk
GET    /health                               # Service health check
```

**XAI/SHAP (Port 8002):**
```bash
POST   /explain                              # Get SHAP explanations
GET    /health                               # Service health check
```

**Cognitive Profiling (Port 8001):**
```bash
POST   /predict                              # Predict OCEAN traits
GET    /health                               # Service health check
```

**LLM/RAG (Port 8003):**
```bash
POST   /rag/query                            # Semantic search query
POST   /rag/chat                             # Conversational AI
POST   /rag/study-plan                       # Generate study plan
POST   /rag/mentor-report                    # Generate mentor report
GET    /rag/stats                            # Knowledge base statistics
GET    /health                               # Service health check
```

**Full API Documentation:** See individual service `/docs` endpoints (FastAPI auto-generated)

---

## 🧪 Testing

### Run All Tests
```bash
bash test_api.sh
```

### Test Individual Services

**Test Risk Prediction:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "CGPA": 7.5,
    "Attendance": 85,
    "StressScore": 6,
    "SleepHours": 7
  }'
```

**Test AI Chatbot:**
```bash
curl -X POST http://localhost:5000/api/chat/ai \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "How can I improve my study habits?"}'
```

**Test Personality Profiling:**
```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{"answers": [4, 3, 5, 2, 4, ...]}'  # 44 answers
```

---

## 📊 Features in Detail

### Academic Risk Prediction

**21-Feature XGBoost Model:**
1. CGPA (Cumulative Grade Point Average)
2. Attendance Percentage
3. Stress Score (1-10)
4. Sleep Hours per Night
5. Backlogs (Number of failed courses)
6. Study Hours per Day
7-9. Internal Assessment Scores (IAT1, IAT2, IAT3)
10-11. Parental Income (Father, Mother)
12-13. Sibling Information (HasSiblings, SiblingCount)
14. Mental Health Index (1-10)
15. Exercise Hours per Week
16. Screen Time Hours per Day
17. Internet Access (Yes/No)
18. Part-Time Job (Yes/No)
19. Social Hours per Week
20. Family Encouragement (1-10)
21. Previous Semester SGPA

**Prediction Classes:**
- **Low Risk:** Student is performing well
- **Medium Risk:** Some concerns, monitoring needed
- **High Risk:** Immediate intervention required

### SHAP Explainability

For each prediction, the system provides:
- Feature importance ranking
- Positive/negative contributions for each feature
- Class-specific explanations
- Visual charts (waterfall, force plots)

### Personality Profiling (OCEAN)

**Big Five Traits:**
1. **Openness:** Creativity, curiosity, open-mindedness
2. **Conscientiousness:** Organization, responsibility, reliability
3. **Extraversion:** Social energy, assertiveness, enthusiasm
4. **Agreeableness:** Compassion, cooperation, trust
5. **Neuroticism:** Emotional stability, anxiety, mood swings

**BFI-44 Survey:** 44 questions assessed on 5-point Likert scale

### Real-time Communication

**Socket.IO Events:**
- `sendMessage`: User sends a message
- `receiveMessage`: User receives a message
- `typing`: User is typing indicator
- `stopTyping`: User stopped typing
- `messageRead`: Message marked as read
- `newAlert`: New alert notification
- `userOnline`/`userOffline`: Presence indicators

---

## 🔒 Security Features

- ✅ **JWT Authentication:** Secure token-based authentication
- ✅ **Password Hashing:** bcrypt with salt rounds
- ✅ **Role-Based Access Control (RBAC):** Student, Mentor, Admin roles
- ✅ **Audit Logging:** Comprehensive activity tracking
- ✅ **Consent Management:** Student data sharing preferences
- ✅ **CORS Configuration:** Prevents unauthorized access
- ✅ **MongoDB Injection Prevention:** Mongoose sanitization
- ✅ **XSS Protection:** Input validation and sanitization
- ✅ **Rate Limiting:** API request throttling
- ✅ **Environment Variables:** Sensitive data protection

---

## 📦 Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Use production MongoDB instance (Atlas, DocumentDB)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Enable rate limiting
- [ ] Set up logging (Winston, CloudWatch)
- [ ] Configure backups
- [ ] Review security settings

### Docker Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Cloud Platforms

**AWS:** EC2 + DocumentDB + S3  
**GCP:** Compute Engine + Cloud MongoDB + Cloud Storage  
**Azure:** App Service + Cosmos DB + Blob Storage  

See [docs/deployment_guide.md](./docs/deployment_guide.md) for detailed instructions.

---

## 🛠️ Development

### Project Structure

```
bodhyai/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Business logic + AI integration
│   │   ├── middleware/         # Auth, audit, error handling
│   │   ├── socket/             # Socket.IO setup
│   │   └── index.js            # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── dashboard/          # Role-specific dashboards
│   │   │   ├── student/        # Student pages
│   │   │   ├── mentor/         # Mentor pages
│   │   │   ├── admin/          # Admin pages
│   │   │   └── common/         # Shared components
│   │   ├── context/            # React Context (Auth, Socket)
│   │   └── App.jsx             # Main app with routing
│   ├── .env.example
│   └── package.json
│
├── ai-services/                # Python AI microservices
│   ├── risk-svc/               # Risk prediction (XGBoost)
│   │   ├── service.py          # FastAPI service
│   │   ├── features.py         # Feature engineering
│   │   ├── train.py            # Model training
│   │   ├── models/             # Trained models + artifacts
│   │   └── requirements.txt
│   ├── xai-svc/                # Explainability (SHAP)
│   │   ├── service.py
│   │   └── requirements.txt
│   ├── cog-svc/                # Cognitive profiling (OCEAN)
│   │   ├── service.py
│   │   ├── models/             # Personality models
│   │   └── requirements.txt
│   └── llm-svc/                # RAG + LLM generation
│       ├── app/
│       │   ├── main.py         # FastAPI app
│       │   ├── rag.py          # RAG logic
│       │   └── knowledge_base/ # PDF documents
│       └── requirements.txt
│
├── docs/                       # Documentation
│   ├── API_TESTING_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── PROJECT_SUMMARY.md
│
├── docker-compose.yml          # Development containers
├── docker-compose.prod.yml     # Production containers
├── test_api.sh                 # Automated API tests
└── README.md                   # This file
```

### npm Scripts

**Backend:**
```bash
npm run dev          # Development with nodemon
npm start            # Production server
npm test             # Run tests
```

**Frontend:**
```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
```

### AI Service Scripts

**Risk Service:**
```bash
bash train.sh                    # Train XGBoost model
python generate_dataset.py       # Generate synthetic data
python test_medium_risk.py       # Test medium risk scenarios
```

**LLM Service:**
```bash
python list_models.py            # List available Gemini models
python verify_model_update.py    # Verify model configuration
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- **Backend:** Follow ESLint configuration
- **Frontend:** Use Prettier + ESLint
- **Python:** Follow PEP 8 guidelines
- Write meaningful commit messages
- Add JSDoc/docstrings for functions
- Update documentation for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**Developer:** Poornate Jareddy  
**Repository:** [BodhyaAi-Mentoring-Platform](https://github.com/Poornatejareddy/BodhyaAi-Mentoring-Platform)  
**Development Duration:** 40+ hours of AI-assisted development  

---

## 📞 Support & Documentation

**Key Documentation:**
- [API Testing Guide](./docs/api_testing_guide.md)
- [Deployment Guide](./docs/deployment_guide.md)
- [Project Summary](./docs/project_summary.md)
- [Risk Model Training](./ai-services/risk-svc/TRAINING.md)

**Issues:** [GitHub Issues](https://github.com/Poornatejareddy/BodhyaAi-Mentoring-Platform/issues)  

---

## 🙏 Acknowledgments

- **FAISS** by Facebook Research for efficient vector similarity search
- **Google Gemini** for powerful language model capabilities
- **XGBoost** for gradient boosting framework
- **SHAP** for explainable AI
- **Socket.IO** for real-time bidirectional communication
- **React** and **Vite** teams for excellent frameworks
- **FastAPI** for high-performance Python APIs
- All open-source contributors and maintainers

---

<div align="center">

**Built with ❤️ From Poorna Teja Reddy K**

[⬆ back to top](#bodhyai-platform)

</div>
