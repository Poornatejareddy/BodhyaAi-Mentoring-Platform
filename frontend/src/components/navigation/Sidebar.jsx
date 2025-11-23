import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  LogOut,
  UserCircle,
  Settings,
  ChevronDown,
  ChevronLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import MentorNavLinks from './MentorNavLinks';
import StudentNavLinks from './StudentNavLinks';
import AdminNavLinks from './AdminNavLinks';

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const renderNavLinks = () => {
    switch (user.role) {
      case 'mentor':
        return <MentorNavLinks isCollapsed={isCollapsed} />;
      case 'student':
        return <StudentNavLinks isCollapsed={isCollapsed} />;
      case 'admin':
        return <AdminNavLinks isCollapsed={isCollapsed} />;
      default:
        return null;
    }
  };

  // Determine profile and settings paths based on role
  const profilePath = `/dashboard/${user.role}/profile`;
  const settingsPath = `/dashboard/${user.role}/settings`;

  return (
    <aside
      className={`relative h-screen flex flex-col transition-all duration-300 ease-in-out z-50
        ${isCollapsed ? 'w-[80px]' : 'w-72'}
        bg-gray-900/95 backdrop-blur-xl border-r border-white/10 shadow-2xl
      `}
    >
      {/* Header */}
      <div className={`h-20 flex items-center px-6 border-b border-white/10 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-10 h-10 flex-shrink-0">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 rounded-full"></div>
            <img src={logo} alt="Logo" className="relative w-full h-full object-contain" />
          </div>
          <h1
            className={`text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap transition-all duration-300
              ${isCollapsed ? 'opacity-0 w-0 translate-x-[-20px]' : 'opacity-100 w-auto translate-x-0'}
            `}
          >
            BodhyaAI
          </h1>
        </div>
      </div>

      {/* Collapse Toggle - Floating */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-24 z-50 p-1.5 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-all hover:scale-110 border-2 border-gray-900"
      >
        {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
        {renderNavLinks()}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10 bg-black/20">
        <div className={`relative ${isCollapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-all group
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-white">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            </div>

            {!isCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate capitalize">{user.role}</p>
              </div>
            )}

            {!isCollapsed && (
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div
              className={`absolute bottom-full mb-2 w-64 bg-gray-800/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2
                ${isCollapsed ? 'left-14' : 'left-0 w-full'}
              `}
            >
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    navigate(profilePath);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <UserCircle size={18} />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate(settingsPath);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Settings size={18} />
                  Settings
                </button>
                <div className="h-px bg-white/10 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;