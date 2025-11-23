import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircle, Bell, ChevronDown, Search, Sparkles } from 'lucide-react';
import AlertsPanel from '../AlertsPanel';

function TopNav() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-sm flex-shrink-0 text-white transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Left Side - Greeting */}
        <div className="flex flex-col">
          <h1 className="text-xl font-bold flex items-center gap-2">
            Welcome back, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'User'}</span>
            <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          </h1>
          <p className="text-xs text-gray-400">Here's what's happening today</p>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 mx-8 max-w-xl hidden md:block">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              placeholder="Search for students, resources, or tools..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder-gray-500"
            />
          </div>
        </div>

        {/* Right Section - Icons and Avatar */}
        <div className="flex items-center space-x-4">
          {/* Alerts Panel */}
          <div className="relative">
            <AlertsPanel />
          </div>

          {/* User Avatar */}
          <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-white/5 transition-all border border-transparent hover:border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-white leading-none">{user?.name}</p>
              <p className="text-xs text-gray-400 mt-1 capitalize">{user?.role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopNav;