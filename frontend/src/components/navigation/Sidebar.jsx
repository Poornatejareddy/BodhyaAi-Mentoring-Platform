import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

// Import our new role-specific navigation components
import MentorNavLinks from './MentorNavLinks';
import StudentNavLinks from './StudentNavLinks';
// import AdminNavLinks from './AdminNavLinks'; // You can create this for the admin role

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) return null; // Don't render if user isn't loaded

  // This function decides which set of links to render
  const renderNavLinks = () => {
    switch (user.role) {
      case 'mentor':
        return <MentorNavLinks />;
      case 'student':
        return <StudentNavLinks />;
      case 'admin':
        // For an admin, you could show a specific admin nav or all of them
        return <MentorNavLinks />; // For now, let admin see mentor links
      default:
        return null;
    }
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <img src={logo} alt="BodhyaAI Logo" className="w-32 mx-auto" />
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {renderNavLinks()}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="mb-2">
            <p className="font-bold">{user.name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full text-left p-2 rounded-md hover:bg-gray-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;