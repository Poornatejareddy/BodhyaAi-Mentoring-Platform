import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircle, Bell, ChevronDown } from 'lucide-react';
import AlertsPanel from '../AlertsPanel';

function TopNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-4 sm:px-6 py-3 shadow-sm flex-shrink-0 text-white">
      <div className="flex items-center justify-between">
        {/* Left Side - Greeting */}
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">
            Welcome back, <span className="font-bold text-white">{user?.name || 'User'}</span>!
          </h1>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 mx-4 max-w-xl">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Right Section - Icons and Avatar */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
        

          {/* Alerts Panel (if needed) */}
          <AlertsPanel />

          {/* User Avatar */}
          <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-700 transition-colors" title="Profile Menu">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
              {user ? user.name.charAt(0) : <UserCircle className="w-5 h-5" />}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;