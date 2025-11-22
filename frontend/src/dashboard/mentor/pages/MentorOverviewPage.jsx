import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, AlertTriangle, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import StatCard from '../../common/components/StatCard';
import MentorAIReport from '../components/MentorAIReport';

function MentorOverviewPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentorData, setMentorData] = useState(null);
  const [mentees, setMentees] = useState([]);

  useEffect(() => {
    fetchMentorData();
  }, []);

  const fetchMentorData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/mentors/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setMentorData(data.data);
        // Fetch mentees
        const menteesResponse = await fetch('http://localhost:5000/api/mentors/mentees', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const menteesData = await menteesResponse.json();
        if (menteesData.success) {
          setMentees(menteesData.data);
        }
      }
    } catch (error) {
      console.error('Error fetching mentor data:', error);
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

  // Calculate risk distribution
  const riskCounts = mentees.reduce((acc, mentee) => {
    const risk = mentee.academicRisk?.prediction || 'UNKNOWN';
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {});

  const riskData = [
    { name: 'High Risk', value: riskCounts.HIGH || 0, color: '#ef4444' },
    { name: 'Medium Risk', value: riskCounts.MEDIUM || 0, color: '#f59e0b' },
    { name: 'Low Risk', value: riskCounts.LOW || 0, color: '#10b981' },
  ];

  const highRiskCount = riskCounts.HIGH || 0;
  const totalMentees = mentees.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">{getGreeting()}, Mentor!</h1>
        <p className="text-gray-400 mt-2 text-lg">Monitor your mentees' progress and provide support</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Mentees"
          value={totalMentees}
          subtitle={`${mentees.filter(m => m.academicRisk).length} assessed`}
          icon={Users}
          gradient="from-blue-600 to-cyan-600"
        />

        <StatCard
          title="High Risk Students"
          value={highRiskCount}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
          gradient="from-red-600 to-orange-600"
        />

        <StatCard
          title="Messages"
          value="7"
          subtitle="3 unread"
          icon={MessageSquare}
          gradient="from-purple-600 to-pink-600"
        />

        <StatCard
          title="Actions Pending"
          value="5"
          subtitle="Due today"
          icon={Clock}
          gradient="from-green-600 to-emerald-600"
        />
      </div>

      {/* AI Report */}
      <MentorAIReport />

      {/* Risk Distribution Chart */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-400" />
          Risk Distribution
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Chart */}
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
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
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="space-y-4">
            {riskData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-300 font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-gray-400">
                    {totalMentees > 0 ? ((item.value / totalMentees) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Alerts */}
      {highRiskCount > 0 && (
        <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-700/50 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-semibold text-white">Priority Alerts</h3>
          </div>
          <p className="text-gray-300 mb-4">
            {highRiskCount} student{highRiskCount > 1 ? 's' : ''} require{highRiskCount === 1 ? 's' : ''} immediate attention
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
          <p className="text-gray-400 text-sm">{totalMentees} students assigned</p>
        </Link>

        <Link
          to="/dashboard/mentor/chat"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all group"
        >
          <MessageSquare className="w-8 h-8 text-purple-400 mb-3" />
          <h4 className="text-white font-semibold text-lg mb-2">Messages</h4>
          <p className="text-gray-400 text-sm">7 unread conversations</p>
        </Link>

        <Link
          to="/dashboard/mentor/alerts"
          className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all group"
        >
          <AlertTriangle className="w-8 h-8 text-orange-400 mb-3" />
          <h4 className="text-white font-semibold text-lg mb-2">Alerts</h4>
          <p className="text-gray-400 text-sm">5 pending actions</p>
        </Link>
      </div>
    </div>
  );
}

export default MentorOverviewPage;