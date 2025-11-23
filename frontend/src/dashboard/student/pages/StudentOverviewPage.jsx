import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStudentProfile, getStudentInterventions } from '../../../services/studentService';
import StatCard from '../../common/components/StatCard';
import QuickActionCard from '../components/QuickActionCard';
import ProgressIndicator from '../../../components/ProgressIndicator';
import { GraduationCap, Calendar, Clock, MessageSquare, Brain, FileText, TrendingUp, Sparkles, Target } from 'lucide-react';

function StudentOverviewPage() {
  const [profile, setProfile] = useState(null);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState({ text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await getStudentProfile();
        setProfile(profileData);

        if (profileData?._id) {
          const interventionsData = await getStudentInterventions(profileData._id);
          setInterventions(interventionsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Prepare CGPA trend data
  const cgpaData = profile.academicHistory?.sgpa
    ? Object.entries(profile.academicHistory.sgpa).map(([sem, gpa]) => ({
      semester: sem.replace('semester', 'Sem '),
      cgpa: parseFloat(gpa) || 0
    }))
    : [];

  // Calculate study hours this week
  const studyHoursWeek = profile.riskInputs?.StudyHoursPerDay ? profile.riskInputs.StudyHoursPerDay * 7 : 0;

  return (
    <div className="space-y-8">
      {/* Welcome & Motivation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl p-8 border border-purple-500/30 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {profile.user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-blue-200 text-lg mb-6">
              Ready to make progress today?
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10 inline-block max-w-xl">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white italic">"{quote.text}"</p>
                  <p className="text-blue-200 text-sm mt-1">- {quote.author}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </div>

        {/* Growth Analysis Card (Replaces Risk Display) */}
        <div>
          <ProgressIndicator
            level={profile.academicRisk?.prediction}
            size="card"
          />
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current CGPA"
          value={profile.riskInputs?.CGPA?.toFixed(2) || 'N/A'}
          subtitle="Academic Performance"
          icon={GraduationCap}
          gradient="from-blue-600 to-purple-600"
        />

        <StatCard
          title="Attendance"
          value={profile.riskInputs?.Attendance ? `${profile.riskInputs.Attendance}%` : 'N/A'}
          subtitle="Class Participation"
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
          title="Engagement"
          value={profile.supportEngagement?.mentorMeetings > 2 ? 'High' : 'Good'}
          subtitle="Active Participation"
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-600"
        />
      </div>

      {/* CGPA Trend Chart */}
      {cgpaData.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Your Progress Journey
          </h3>
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
        <h3 className="text-xl font-semibold text-white mb-4">Tools for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="AI Study Plan"
            description="Your personalized roadmap"
            icon={FileText}
            gradient="from-purple-600 to-pink-600"
            href="/dashboard/student/study-plan"
          />

          <QuickActionCard
            title="Chat with Mentor"
            description="Get guidance & support"
            icon={MessageSquare}
            gradient="from-blue-600 to-cyan-600"
            href="/dashboard/student/chat"
          />

          <QuickActionCard
            title="Growth Analysis"
            description="Understand your potential"
            icon={Target}
            gradient="from-orange-500 to-red-600"
            href="/dashboard/student/risk-explanation"
          />

          <QuickActionCard
            title="Personality Profile"
            description="Discover your strengths"
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
          <h3 className="text-xl font-semibold text-white mb-4">Profile Details</h3>
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
          <h3 className="text-xl font-semibold text-white mb-4">Wellbeing & Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Pending Subjects:</span>
              <span className={`font-medium ${profile.riskInputs?.Backlogs > 0 ? 'text-orange-400' : 'text-green-400'}`}>
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
              <span className="text-gray-400">Stress Level:</span>
              <span className={`font-medium ${profile.riskInputs?.StressScore > 7 ? 'text-orange-400' : profile.riskInputs?.StressScore > 5 ? 'text-yellow-400' : 'text-green-400'}`}>
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
