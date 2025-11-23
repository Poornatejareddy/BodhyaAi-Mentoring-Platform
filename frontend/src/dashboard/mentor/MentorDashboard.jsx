import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import FloatingChatButton from '../../components/FloatingChatButton';
import MessageNotificationManager from '../../components/notifications/MessageNotificationManager';
import { Users, UserCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function MentorDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalMentees: 0,
    riskCounts: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    avgCGPA: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/mentors/dashboard-stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };

    fetchStats();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section - Matches login/register design */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mentor Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">Guide and support your mentees</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex gap-6">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-200" />
                  <div>
                    <p className="text-xs text-green-200">Total Mentees</p>
                    <p className="text-xl font-bold text-white">{stats.totalMentees}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-200" />
                  <div>
                    <p className="text-xs text-yellow-200">At Risk</p>
                    <p className="text-xl font-bold text-white">{stats.riskCounts?.HIGH || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">Avg CGPA</p>
                    <p className="text-xl font-bold text-white">{stats.avgCGPA || '0.00'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* AI Chat Bot */}
      <FloatingChatButton />

      {/* Message Notifications */}
      <MessageNotificationManager />
    </div>
  );
}

export default MentorDashboard;