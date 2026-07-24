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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
          <p className="text-[var(--ink-muted)] text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8 border border-[var(--line)] rounded-xl bg-[var(--surface)] text-[var(--danger)]">
        Could not load your student profile. Please contact an administrator.
      </div>
    );
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
    <div className="space-y-8 animate-fade-in">
      {/* Welcome & Motivation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[var(--surface)]  rounded-xl p-8 border border-[var(--line)] relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-[var(--ink)] mb-1">
              Welcome back, {profile.user?.name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-xs text-[var(--ink-secondary)] mb-6">
              Ready to make progress on your goals today?
            </p>
            <div className="bg-[var(--surface)]/80 backdrop-blur-md rounded-lg p-4 border border-[var(--line)] inline-block max-w-xl">
              <div className="flex gap-3">
                <Sparkles size={16} className="var-warning flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs italic text-[var(--ink)] leading-relaxed">"{quote.text}"</p>
                  <p className="text-[10px] text-[var(--ink-muted)] mt-1 font-semibold">- {quote.author}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--brand)]/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--surface-muted)]/5 rounded-full blur-3xl -ml-10 -mb-10"></div>
        </div>

        {/* Growth Analysis Card */}
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
        />

        <StatCard
          title="Attendance"
          value={profile.riskInputs?.Attendance ? `${profile.riskInputs.Attendance}%` : 'N/A'}
          subtitle="Class Participation"
          icon={Calendar}
          trend={profile.riskInputs?.Attendance >= 85 ? 5 : profile.riskInputs?.Attendance >= 75 ? 0 : -5}
        />

        <StatCard
          title="Study Hours"
          value={studyHoursWeek}
          subtitle="Hours this week"
          icon={Clock}
        />

        <StatCard
          title="Engagement"
          value={profile.supportEngagement?.mentorMeetings > 2 ? 'High' : 'Good'}
          subtitle="Active Participation"
          icon={TrendingUp}
        />
      </div>

      {/* CGPA Trend Chart */}
      {cgpaData.length > 0 && (
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--brand)]" />
            Your Progress Journey
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cgpaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
              <XAxis dataKey="semester" stroke="var(--ink-muted)" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="var(--ink-muted)" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
              />
              <Line
                type="monotone"
                dataKey="cgpa"
                stroke="var(--brand)"
                strokeWidth={3}
                dot={{ fill: 'var(--brand)', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Tools for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="AI Study Plan"
            description="Your personalized roadmap"
            icon={FileText}
            gradient=" "
            href="/dashboard/student/study-plan"
          />

          <QuickActionCard
            title="Chat with Mentor"
            description="Get guidance & support"
            icon={MessageSquare}
            gradient=" "
            href="/dashboard/student/chat"
          />

          <QuickActionCard
            title="Growth Analysis"
            description="Understand your potential"
            icon={Target}
            gradient=""
            href="/dashboard/student/risk-explanation"
          />

          <QuickActionCard
            title="Personality Profile"
            description="Discover your strengths"
            icon={Brain}
            gradient=" "
            href="/dashboard/student/personality"
          />
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info Card */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Profile Details</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">Name:</span>
              <span className="text-[var(--ink)] font-medium">{profile.user?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">USN:</span>
              <span className="text-[var(--ink)] font-medium">{profile.usn || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">Department:</span>
              <span className="text-[var(--ink)] font-medium">{profile.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)]">Section:</span>
              <span className="text-[var(--ink)] font-medium">{profile.section || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Academic Stats Card */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--ink)] mb-4">Wellbeing & Stats</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">Pending Subjects:</span>
              <span className={`font-medium ${profile.riskInputs?.Backlogs > 0 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
                {profile.riskInputs?.Backlogs || 0}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">Study Hours/Day:</span>
              <span className="text-[var(--ink)] font-medium">{profile.riskInputs?.StudyHoursPerDay || 'N/A'} hrs</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[var(--line)]">
              <span className="text-[var(--ink-muted)]">Sleep Hours:</span>
              <span className="text-[var(--ink)] font-medium">{profile.riskInputs?.SleepHours || 'N/A'} hrs</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[var(--ink-muted)]">Stress Level:</span>
              <span className={`font-medium ${profile.riskInputs?.StressScore > 7 ? 'text-[var(--danger)]' : profile.riskInputs?.StressScore > 5 ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
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
