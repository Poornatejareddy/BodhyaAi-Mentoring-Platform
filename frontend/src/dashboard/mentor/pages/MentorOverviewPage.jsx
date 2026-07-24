import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Users, AlertTriangle, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
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
      const profileRes = await fetch(`${API_BASE_URL}/mentors/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();
      if (profileData.success) setMentorData(profileData.data);

      // Fetch Real-time Stats
      const statsRes = await fetch(`${API_BASE_URL}/mentors/dashboard-stats`, {
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
          <p className="text-[var(--ink-muted)] text-sm">Loading advisor console...</p>
        </div>
      </div>
    );
  }

  const riskData = [
    { name: 'High Risk', value: stats.riskCounts.HIGH || 0, color: 'var(--danger)' },
    { name: 'Medium Risk', value: stats.riskCounts.MEDIUM || 0, color: 'var(--warning)' },
    { name: 'Low Risk', value: stats.riskCounts.LOW || 0, color: 'var(--success)' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">{getGreeting()}, {mentorData?.user?.name || 'Mentor'}!</h1>
        <p className="text-xs text-[var(--ink-muted)] mt-1">Monitor your mentees' progress and trigger direct interventions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Mentees"
          value={stats.totalMentees}
          subtitle="Assigned students"
          icon={Users}
        />

        <StatCard
          title="High Risk Students"
          value={stats.riskCounts.HIGH}
          subtitle="Require immediate attention"
          icon={AlertTriangle}
        />

        <StatCard
          title="Messages"
          value={stats.unreadMessages}
          subtitle="Unread conversations"
          icon={MessageSquare}
        />

        <StatCard
          title="Actions Pending"
          value={stats.pendingAlerts}
          subtitle="Pending alerts"
          icon={Clock}
        />
      </div>

      {/* AI Report */}
      <MentorAIReport />

      {/* Analytics Charts Grid */}
      <div className="grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Risk Distribution Chart */}
        <div className="min-w-0 bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--brand)]" />
            Risk Distribution
          </h3>
          <div className="h-[250px] min-w-0 w-full">
            <ResponsiveContainer
              width="100%"
              height={250}
              minWidth={0}
              minHeight={250}
              initialDimension={{ width: 1, height: 250 }}
            >
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
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                  labelStyle={{ color: 'var(--ink)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Distribution Chart */}
        <div className="min-w-0 bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--success)]" />
            Attendance Overview
          </h3>
          <div className="h-[250px] min-w-0 w-full">
            <ResponsiveContainer
              width="100%"
              height={250}
              minWidth={0}
              minHeight={250}
              initialDimension={{ width: 1, height: 250 }}
            >
              <BarChart
                data={[
                  { name: '< 75%', value: stats.distributions?.attendance?.low || 0, fill: 'var(--danger)' },
                  { name: '75-85%', value: stats.distributions?.attendance?.medium || 0, fill: 'var(--warning)' },
                  { name: '> 85%', value: stats.distributions?.attendance?.high || 0, fill: 'var(--success)' },
                ]}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                <XAxis dataKey="name" stroke="var(--ink-muted)" fontSize={12} />
                <YAxis stroke="var(--ink-muted)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                  cursor={{ fill: 'var(--overlay)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {
                    [
                      { fill: 'var(--danger)' },
                      { fill: 'var(--warning)' },
                      { fill: 'var(--success)' }
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
        <div className="bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-xl p-6 animate-pulse-subtle">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />
            <h3 className="text-sm font-semibold text-[var(--ink)]">Priority Alerts</h3>
          </div>
          <p className="text-xs text-[var(--ink-secondary)] mb-4">
            {stats.riskCounts.HIGH} assigned student{stats.riskCounts.HIGH > 1 ? 's' : ''} require{stats.riskCounts.HIGH === 1 ? 's' : ''} immediate attention. Review explanation metrics.
          </p>
          <Link
            to="/dashboard/mentor/mentees"
            className="btn btn-danger text-xs font-semibold px-4 py-2"
          >
            View High-Risk Students
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/mentor/mentees"
          className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all group shadow-sm hover:translate-y-[-2px] duration-200"
        >
          <Users className="w-7 h-7 text-[var(--brand)] mb-3 group-hover:scale-105 transition" />
          <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">View All Mentees</h4>
          <p className="text-[var(--ink-muted)] text-xs">{stats.totalMentees} students assigned</p>
        </Link>

        <Link
          to="/dashboard/mentor/chat"
          className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all group shadow-sm hover:translate-y-[-2px] duration-200"
        >
          <MessageSquare className="w-7 h-7 text-[var(--brand)] mb-3 group-hover:scale-105 transition" />
          <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">Messages</h4>
          <p className="text-[var(--ink-muted)] text-xs">{stats.unreadMessages} unread conversations</p>
        </Link>

        <Link
          to="/dashboard/mentor/alerts"
          className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all group shadow-sm hover:translate-y-[-2px] duration-200"
        >
          <AlertTriangle className="w-7 h-7 text-[var(--danger)] mb-3 group-hover:scale-105 transition" />
          <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">Alerts</h4>
          <p className="text-[var(--ink-muted)] text-xs">{stats.pendingAlerts} pending actions</p>
        </Link>
      </div>
    </div>
  );
}

export default MentorOverviewPage;
