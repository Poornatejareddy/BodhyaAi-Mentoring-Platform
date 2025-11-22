import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import TopNav from '../components/navigation/TopNav';
import { useAuth } from '../context/AuthContext';
import FloatingChatButton from '../components/FloatingChatButton';

function DashboardLayout() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false); // State lives here

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {/* Pass state and setter to Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopNav doesn't need the toggle function anymore */}
        <TopNav /> 
        
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-gray-900 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <Outlet />
        </main>
      </div>

      {user && user.role === 'student' && <FloatingChatButton />}
    </div>
  );
}

export default DashboardLayout;