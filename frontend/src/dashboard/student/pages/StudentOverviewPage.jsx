import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentProfile } from '../../../services/studentService';
import StatCard from '../../common/components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import { GraduationCap, Calendar, Clock, AlertTriangle, MessageSquare, Brain, FileText, TrendingUp } from 'lucide-react';

function StudentOverviewPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentProfile()
      .then(data => setProfile(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-red-400">Could not load your profile.</div>;
  }

  // Calculate risk display
  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return { color: 'text-red-400', bg: 'from-red-600 to-pink-600', label: 'High Risk' };
    if (risk === 'MEDIUM') return { color: 'text-yellow-400', bg: 'from-orange-500 to-yellow-500', label: 'Medium Risk' };
    return { color: 'text-green-400', bg: 'from-green-500 to-emerald-600', label: 'Low Risk' };
  };

  const riskInfo = getRiskColor(profile.academicRisk?.prediction);

  // Prepare CGPA trend data
  const cgpaData = profile.academicHistory?.sgpa
    ? Object.entries(profile.academicHistory.sgpa).map(([sem, gpa]) => ({
      semester: sem.replace('semester', 'Sem '),
      cgpa: parseFloat(gpa) || 0
    }))
    : [];

  // Calculate study hours this week (dummy for now, can be made dynamic)
  const studyHoursWeek = profile.riskInputs?.StudyHoursPerDay ? profile.riskInputs.StudyHoursPerDay * 7 : 0;

  return (
    <div className="space-y-8">
      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current CGPA"
          value={profile.riskInputs?.CGPA?.toFixed(2) || 'N/A'}
          subtitle="Out of 10.0"
          icon={GraduationCap}
          gradient="from-blue-600 to-purple-600"
        />

        <StatCard
          title="Attendance"
          value={profile.riskInputs?.Attendance ? `${profile.riskInputs.Attendance}%` : 'N/A'}
          subtitle="Overall attendance"
          icon={Calendar}
          gradient="from-cyan-500 to-blue-600"
          trend={profile.riskInputs?.Attendance >= 85 ? 5 : profile.riskInputs?.Attendance >= 75 ? 0 : -5}
        />

        <StatCard
          title="Study Hours"
          value={studyHoursWeek}
          subtitle="Hours this week"
          icon={Clock}
          gradient="from-purple-600 to-pink-600"
        />

        <StatCard
          title="Risk Level"
          value={riskInfo.label}
          subtitle={profile.academicRisk?.calculatedAt ? 'Updated recently' : 'Not calculated'}
          icon={AlertTriangle}
          gradient={riskInfo.bg}
        />
      </div>

      {/* CGPA Trend Chart */}
      {cgpaData.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">CGPA Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cgpaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="semester" stroke="#9ca3af" />
              <YAxis domain={[0, 10]} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#f3f4f6' }}
              />
              <Line
                type="monotone"
                dataKey="cgpa"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="AI Study Plan"
            description="Generate personalized plan"
            icon={FileText}
            gradient="from-purple-600 to-pink-600"
            href="/dashboard/student/study-plan"
          />

          <QuickActionCard
            title="Chat with Mentor"
            description="Get guidance and support"
            icon={MessageSquare}
            gradient="from-blue-600 to-cyan-600"
            href="/dashboard/student/chat"
          />

          <QuickActionCard
            title="Risk Analysis"
            description="View detailed insights"
            icon={TrendingUp}
            gradient="from-orange-500 to-red-600"
            href="/dashboard/student/risk-explanation"
          />

          <QuickActionCard
            title="Personality Profile"
            description="Explore your traits"
            icon={Brain}
            gradient="from-green-500 to-emerald-600"
            href="/dashboard/student/personality"
          />
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Personal Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Name:</span>
              <span className="text-white font-medium">{profile.user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">USN:</span>
              <span className="text-white font-medium">{profile.usn || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Department:</span>
              <span className="text-white font-medium">{profile.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Section:</span>
              <span className="text-white font-medium">{profile.section || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Academic Stats Card */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Academic Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Backlogs:</span>
              <span className={`font-medium ${profile.riskInputs?.Backlogs > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {profile.riskInputs?.Backlogs || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Study Hours/Day:</span>
              <span className="text-white font-medium">{profile.riskInputs?.StudyHoursPerDay || 'N/A'} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sleep Hours:</span>
              <span className="text-white font-medium">{profile.riskInputs?.SleepHours || 'N/A'} hrs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Stress Score:</span>
              <span className={`font-medium ${profile.riskInputs?.StressScore > 7 ? 'text-red-400' : profile.riskInputs?.StressScore > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
                {profile.riskInputs?.StressScore || 'N/A'}/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverviewPage;
