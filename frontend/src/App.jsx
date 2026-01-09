import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import SocketManager from './components/SocketManager';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicSurveyPage from './pages/PublicSurveyPage';

// Mentor Imports
import MentorDashboard from './dashboard/mentor/MentorDashboard';
import MenteesListPage from './dashboard/mentor/pages/MenteesListPage';
import MenteeDetailPage from './dashboard/mentor/pages/MenteeDetailPage';
import AssignStudentPage from './dashboard/mentor/pages/AssignStudentPage';
import MentorSettingsPage from './dashboard/mentor/pages/MentorSettingsPage';
import MentorOverviewPage from './dashboard/mentor/pages/MentorOverviewPage';
import MentorAlertsPage from './dashboard/mentor/pages/MentorAlertsPage';
import StudentSurveyLinksPage from './dashboard/mentor/pages/StudentSurveyLinksPage';



// Student and Admin Imports
import StudentDashboard from './dashboard/student/StudentDashboard';
import StudentOverviewPage from './dashboard/student/pages/StudentOverviewPage';
import StudentProfilePage from './dashboard/student/pages/StudentProfilePage';
import SurveyPage from './dashboard/student/pages/SurveyPage'; // <-- IMPORT
import ChatbotPage from './dashboard/student/pages/ChatbotPage'; // <-- IMPORT
import StudyPlanGeneratorPage from './dashboard/student/pages/StudyPlanGeneratorPage';
import RiskExplanationPage from './dashboard/student/pages/RiskExplanationPage';
import CognitiveProfilePage from './dashboard/student/pages/CognitiveProfilePage';
import SettingsPage from './dashboard/common/SettingsPage';


import AdminDashboard from './dashboard/admin/AdminDashboard';
import AdminOverviewPage from './dashboard/admin/pages/AdminOverviewPage';
import UserManagementPage from './dashboard/admin/pages/UserManagementPage';
import AlertsPage from './dashboard/admin/pages/AlertsPage';
import ActivityLogsPage from './dashboard/admin/pages/ActivityLogsPage';
import ChatListPage from './dashboard/common/ChatListPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'survey/:token', element: <PublicSurveyPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: 'mentor',
        element: <ProtectedRoute allowedRoles={['mentor', 'admin']} />,
        children: [
          {
            element: <MentorDashboard />,
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: 'overview', element: <MentorOverviewPage /> },
              { path: 'mentees', element: <MenteesListPage /> },
              { path: 'mentees/:studentId', element: <MenteeDetailPage /> },
              { path: 'assign-student', element: <AssignStudentPage /> },
              { path: 'survey-links', element: <StudentSurveyLinksPage /> },
              { path: 'settings', element: <MentorSettingsPage /> },
              { path: 'alerts', element: <MentorAlertsPage /> },
              { path: 'chat', element: <ChatListPage /> },
            ]
          }
        ]
      },
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={['student', 'admin']} />,
        children: [
          {
            element: <StudentDashboard />,
            children: [
              { index: true, element: <StudentOverviewPage /> },
              { path: 'overview', element: <StudentOverviewPage /> },
              { path: 'profile', element: <StudentProfilePage /> },
              { path: 'survey', element: <SurveyPage /> },
              { path: 'chatbot', element: <ChatbotPage /> },
              { path: 'chat', element: <ChatListPage /> },
              { path: 'study-plan', element: <StudyPlanGeneratorPage /> },
              { path: 'risk-explanation', element: <RiskExplanationPage /> },
              { path: 'personality', element: <CognitiveProfilePage /> },
              { path: 'settings', element: <SettingsPage /> },
            ]
          }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [
          {
            path: '',
            element: <AdminDashboard />,
            children: [
              { index: true, element: <AdminOverviewPage /> },
              { path: 'overview', element: <AdminOverviewPage /> },
              { path: 'users', element: <UserManagementPage /> },
              { path: 'alerts', element: <AlertsPage /> },
              { path: 'activity', element: <ActivityLogsPage /> },
              { path: 'chat', element: <ChatListPage /> },
            ]
          }
        ]
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <div className="flex items-center justify-center min-h-screen"><h1>403 - Unauthorized Access</h1></div>
  }
]);

function App() {
  return (
    <>
      <SocketManager />
      <RouterProvider router={router} />
    </>
  );
}

export default App;