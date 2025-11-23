import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, AlertTriangle, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import StatCard from '../../common/components/StatCard';
import MentorAIReport from '../components/MentorAIReport';

function MentorOverviewPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentorData, setMentorData] = useState(null);
  const [stats, setStats] = useState({
    totalMentees: 0,
    riskCounts: { HIGH: 0, MEDIUM: 0, LOW: 0 },
    distributions: {
      attendance: { low: 0, medium: 0, high: 0 },
      cgpa: { low: 0, medium: 0, high: 0 }
    },
    unreadMessages: 0,
    pendingAlerts: 0
  });

  useEffect(() => {
    fetchDashboardData();
    // Poll for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Mentor Profile
      const profileRes = await fetch('http://localhost:5000/api/mentors/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) setMentorData(profileData.data);

      // Fetch Real-time Stats
      const statsRes = await fetch('http://localhost:5000/api/mentors/dashboard-stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const riskData = [
    { name: 'High Risk', value: stats.riskCounts.HIGH || 0, color: '#ef4444' },
    { name: 'Medium Risk', value: stats.riskCounts.MEDIUM || 0, color: '#f59e0b' },
    { name: 'Low Risk', value: stats.riskCounts.LOW || 0, color: '#10b981' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">{getGreeting()}, {mentorData?.user?.name || 'Mentor'}!</h1>
        <p className="text-gray-400 mt-2 text-lg">Monitor your mentees' progress and provide support</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Mentees"
          value={stats.totalMentees}
          subtitle="Assigned students"
          icon={Users}
          gradient="from-blue-600 to-cyan-600"
        />

        <StatCard
          title="High Risk Students"
          value={stats.riskCounts.HIGH}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          gradient="from-red-600 to-orange-600"
        />

        <StatCard
          title="Messages"
          value={stats.unreadMessages}
          subtitle="Unread conversations"
          icon={MessageSquare}
          gradient="from-purple-600 to-pink-600"
        />

        <StatCard
          title="Actions Pending"
          value={stats.pendingAlerts}
          subtitle="Pending alerts"
          icon={Clock}
          gradient="from-green-600 to-emerald-600"
        />
      </div>

      {/* AI Report */}
      <MentorAIReport />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Risk Distribution
          </h3>
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution Chart */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-400" />
            Attendance Overview
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: '< 75%', value: stats.distributions?.attendance?.low || 0, fill: '#ef4444' },
                  { name: '75-85%', value: stats.distributions?.attendance?.medium || 0, fill: '#f59e0b' },
                  { name: '> 85%', value: stats.distributions?.attendance?.high || 0, fill: '#10b981' },
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {
                    [
                      { fill: '#ef4444' },
                      { fill: '#f59e0b' },
                      { fill: '#10b981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {stats.riskCounts.HIGH > 0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Priority Alerts</h3>
          </div>
          <p className="text-gray-300 mb-4">
            {stats.riskCounts.HIGH} student{stats.riskCounts.HIGH > 1 ? 's' : ''} require{stats.riskCounts.HIGH === 1 ? 's' : ''} immediate attention
          </p>
          <Link
            to="/dashboard/mentor/mentees"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            View High-Risk Students
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/mentor/mentees"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all group"
        >
          <Users className="w-8 h-8 text-blue-400 mb-3" />
          <h4 className="text-white font-semibold text-lg mb-2">View All Mentees</h4>
          <p className="text-gray-400 text-sm">{stats.totalMentees} students assigned</p>
        </Link>

        <Link
          to="/dashboard/mentor/chat"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all group"
        >
          <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
          <h4 className="text-white font-semibold text-lg mb-2">Messages</h4>
          <p className="text-gray-400 text-sm">{stats.unreadMessages} unread conversations</p>
        </Link>

        <Link
          to="/dashboard/mentor/alerts"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all group"
        >
          <AlertTriangle className="w-8 h-8 text-orange-400 mb-3" />
          <h4 className="text-white font-semibold text-lg mb-2">Alerts</h4>
          <p className="text-gray-400 text-sm">{stats.pendingAlerts} pending actions</p>
        </Link>
      </div>
    </div>
  );
}

export default MentorOverviewPage;