import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function StudentDashboard() {
  return (
    <div className="w-full text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
      </header>
      <main>
        {/* We can add student sub-navigation here later */}
        <Outlet />
      </main>
    </div>
  );
}
export default StudentDashboard;