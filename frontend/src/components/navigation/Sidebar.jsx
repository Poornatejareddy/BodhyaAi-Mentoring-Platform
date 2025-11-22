import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  LogOut,
  UserCircle,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';
import MentorNavLinks from './MentorNavLinks';
import StudentNavLinks from './StudentNavLinks';

function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
        return <MentorNavLinks isCollapsed={isCollapsed} />;
      default:
        return null;
    }
  };

  return (
    <aside
      className={`relative h-screen bg-gray-900 bg-opacity-80 backdrop-blur-lg text-gray-300 flex flex-col shadow-xl transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
    >
      {/* Collapse Button with Hamburger Icon */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute -right-3 top-4 z-10 p-2 rounded-full bg-gray-800 hover:bg-blue-600 text-white transition-colors border border-gray-700 shadow-md"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Header */}
      <div
        className={`flex items-center h-16 px-4 border-b border-gray-700 flex-shrink-0 overflow-hidden ${isCollapsed ? 'justify-center' : ''
          }`}
      >
        <img src={logo} alt="BodhyaAI Logo" className="h-8 w-auto transition-opacity duration-300" />
        <h1
          className={`ml-2 text-lg font-semibold text-white whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'
            }`}
        >
          BodhyaAI
        </h1>
      </div>

      {/* Navigation Links */}
      <nav
        className={`flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 ${isCollapsed ? 'flex flex-col items-center' : ''
          }`}
      >
        {renderNavLinks()}
      </nav>

      {/* Footer with User Avatar and Dropdown */}
      <div
        className={`px-3 py-4 border-t border-gray-700 flex-shrink-0 ${isCollapsed ? 'flex flex-col items-center space-y-3' : 'flex flex-col space-y-3'
          }`}
      >
        <div className="relative w-full">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors w-full ${isCollapsed ? 'justify-center' : 'justify-between'
              }`}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
                {user?.name?.charAt(0) || <UserCircle className="w-5 h-5" />}
              </div>
              {!isCollapsed && <span className="text-white font-medium">{user.name}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                className={`w-4 h-4 text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''
                  }`}
              />
            )}
          </button>
          {dropdownOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 rounded-md shadow-lg py-1 z-20">
              <button
                onClick={() => {
                  navigate('/profile');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <UserCircle className="inline-block w-4 h-4 mr-2" />
                Profile
              </button>
              <button
                onClick={() => {
                  navigate('/settings');
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                <Settings className="inline-block w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/50"
              >
                <LogOut className="inline-block w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Logout Button */}
        {!isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-2 rounded-md bg-red-800 hover:bg-red-700 text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-full bg-red-800 hover:bg-red-700 text-white transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;