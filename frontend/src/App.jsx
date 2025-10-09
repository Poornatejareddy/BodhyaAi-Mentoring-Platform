import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Mentor Imports
import MentorDashboard from './dashboard/mentor/MentorDashboard';
import MenteesListPage from './dashboard/mentor/pages/MenteesListPage';
import MenteeDetailPage from './dashboard/mentor/pages/MenteeDetailPage';
import AssignStudentPage from './dashboard/mentor/pages/AssignStudentPage';
import MentorSettingsPage from './dashboard/mentor/pages/MentorSettingsPage';
import MentorOverviewPage from './dashboard/mentor/pages/MentorOverviewPage';


// Student and Admin Imports
import StudentDashboard from './dashboard/student/StudentDashboard';
import StudentOverviewPage from './dashboard/student/pages/StudentOverviewPage';
import StudentProfilePage from './dashboard/student/pages/StudentProfilePage';
import SurveyPage from './dashboard/student/pages/SurveyPage'; // <-- IMPORT
import ChatbotPage from './dashboard/student/pages/ChatbotPage'; // <-- IMPORT


import AdminDashboard from './dashboard/admin/AdminDashboard';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
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
              { index: true, element: <Navigate to="mentees" replace /> },
              { path: 'overview', element: <MentorOverviewPage /> },
              { path: 'mentees', element: <MenteesListPage /> },
              { path: 'mentees/:studentId', element: <MenteeDetailPage /> },
              { path: 'assign-student', element: <AssignStudentPage /> },
              { path: 'settings', element: <MentorSettingsPage /> },
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
              { path: 'chatbot', element: <ChatbotPage /> }
            ]
          }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['admin']} />,
        children: [{ path: '', element: <AdminDashboard /> }]
      },
    ],
  },
  {
    path: '/unauthorized',
    element: <div className="flex items-center justify-center min-h-screen"><h1>403 - Unauthorized Access</h1></div>
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;