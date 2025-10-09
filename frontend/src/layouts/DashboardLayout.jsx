import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopNav from '../components/navigation/TopNav';
import { useAuth } from '../context/AuthContext'; // <-- IMPORT
import FloatingChatButton from '../components/FloatingChatButton';

function DashboardLayout() {
  const { user } = useAuth(); // <-- ADD THIS

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* The persistent sidebar */}
      <Sidebar />
      
      {/* Main content area that scrolls */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className="flex-1 p-6">
          {/* Top navigation bar */}
          <TopNav />
          
          {/* Outlet for the specific dashboard pages (Mentor, Student, etc.) */}
          <Outlet />
        </main>
      </div>

      {/* Only show the floating button if the user is a student */}
      {user && user.role === 'student' && <FloatingChatButton />}
    </div>
  );
}

export default DashboardLayout;