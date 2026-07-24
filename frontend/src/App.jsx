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
import PublicInfoPage from './pages/PublicInfoPage';
import StatusPage from './pages/StatusPage';

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
      { path: 'about', element: <PublicInfoPage type="about" /> },
      { path: 'features', element: <PublicInfoPage type="features" /> },
      { path: 'why-bodhyai', element: <PublicInfoPage type="why-bodhyai" /> },
      { path: 'how-it-works', element: <PublicInfoPage type="how-it-works" /> },
      { path: 'solutions', element: <PublicInfoPage type="solutions" /> },
      { path: 'students', element: <PublicInfoPage type="students" /> },
      { path: 'mentors', element: <PublicInfoPage type="mentors" /> },
      { path: 'institutions', element: <PublicInfoPage type="universities" /> },
      { path: 'courses', element: <PublicInfoPage type="courses" /> },
      { path: 'research', element: <PublicInfoPage type="research" /> },
      { path: 'security', element: <PublicInfoPage type="security" /> },
      { path: 'ai-technology', element: <PublicInfoPage type="ai-technology" /> },
      { path: 'testimonials', element: <PublicInfoPage type="testimonials" /> },
      { path: 'case-studies', element: <PublicInfoPage type="case-studies" /> },
      { path: 'pricing', element: <PublicInfoPage type="pricing" /> },
      { path: 'faq', element: <PublicInfoPage type="faq" /> },
      { path: 'blog', element: <PublicInfoPage type="blog" /> },
      { path: 'documentation', element: <PublicInfoPage type="documentation" /> },
      { path: 'contact', element: <PublicInfoPage type="contact" /> },
      { path: 'privacy', element: <PublicInfoPage type="privacy" /> },
      { path: 'terms', element: <PublicInfoPage type="terms" /> },
      { path: 'cookies', element: <PublicInfoPage type="cookies" /> },
      { path: 'careers', element: <PublicInfoPage type="careers" /> },
      { path: 'roadmap', element: <PublicInfoPage type="roadmap" /> },
      { path: 'release-notes', element: <PublicInfoPage type="release-notes" /> },
      { path: 'partners', element: <PublicInfoPage type="partners" /> },
      { path: 'press', element: <PublicInfoPage type="press" /> },
      { path: 'support', element: <PublicInfoPage type="support" /> },
      { path: 'community', element: <PublicInfoPage type="community" /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'survey/:token', element: <PublicSurveyPage /> },
    ],
    errorElement: <StatusPage />,
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
              { path: 'settings', element: <SettingsPage /> },
            ]
          }
        ]
      },
    ],
  },
  { path: '*', element: <StatusPage /> },
  {
    path: '/unauthorized',
    element: <StatusPage code="403" title="You don’t have access to this workspace" message="Your account does not have the permission required for this page. Return to the public site or sign in with the appropriate role." />
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
