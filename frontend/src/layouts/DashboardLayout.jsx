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
    <div className="dashboard-shell flex h-screen overflow-hidden">
      {/* Pass state and setter to Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        {/* TopNav doesn't need the toggle function anymore */}
        <TopNav /> 
        
        <main className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {user && user.role === 'student' && <FloatingChatButton />}
    </div>
  );
}

export default DashboardLayout;
