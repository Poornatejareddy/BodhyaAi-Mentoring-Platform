import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/navigation/PublicNavbar';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300">
      <PublicNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;