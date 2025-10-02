import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function MentorDashboard() {
  const activeLinkStyle = {
    backgroundColor: '#374151', // bg-gray-700
    color: 'white',
    borderBottom: '2px solid #3b82f6' // border-blue-500
  };

  return (
    <div className="w-full text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Mentor's Hub</h1>
      </header>

      {/* Mentor-specific sub-navigation bar */}
      <nav className="flex space-x-2 border-b-2 border-gray-700 mb-6">
        <NavLink
          to="overview"
          className="py-2 px-4 font-medium"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
        >
          Overview
        </NavLink>
        <NavLink
          to="settings"
          className="py-2 px-4 font-medium"
          style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
        >
          Settings
        </NavLink>

          <NavLink
            to="assign-student"
            className="py-2 px-4 font-medium"
            style={({ isActive }) => (isActive ? activeLinkStyle : undefined)}
          >
            Assign Student
          </NavLink>

        </nav>

        {/* Content for the selected page (Overview, Settings, etc.) will be rendered here */}
        <main>
          <Outlet />
        </main>
    </div>
  );
}

export default MentorDashboard;