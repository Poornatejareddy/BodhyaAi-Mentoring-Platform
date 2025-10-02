import React, {useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentProfile } from '../../../services/studentService';

function StudentOverviewPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentProfile()
      .then(data => setProfile(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center">Loading your dashboard...</div>;
  if (!profile) return <div className="text-center text-red-400">Could not load your profile.</div>;

  // Helper to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">
        Welcome, {profile.user?.name || 'Student'}!
      </h2>
      
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Column 1: Risk and Personality (takes up 2/3 of the space on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Risk Card */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Your Academic Status</h3>
            {profile.academicRisk?.prediction ? (
              <>
                <p>Current Risk Level: <span className="font-bold text-2xl">{profile.academicRisk.prediction}</span></p>
                <p className="text-xs text-gray-400 mt-1">Last calculated: {formatDate(profile.academicRisk.lastCalculated)}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">Key Factors:</h4>
                  <ul className="list-disc list-inside text-yellow-400">
                    {profile.academicRisk.warnings?.length > 0 ? 
                      profile.academicRisk.warnings.map((w, i) => <li key={i}>{w}</li>) :
                      <li>Looking good! No warnings found.</li>}
                  </ul>
                </div>
              </>
            ) : <p>Your academic risk has not been calculated yet.</p>}
          </div>

          {/* Personality Insights Card */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Your Personality Insights</h3>
            {profile.personalityProfile?.insights?.length > 0 ? (
              <>
                <ul className="list-disc list-inside text-cyan-400 space-y-1">
                  {profile.personalityProfile.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                </ul>
                <p className="text-xs text-gray-400 mt-3">Last calculated: {formatDate(profile.personalityProfile.lastCalculated)}</p>
              </>
            ) : (
                <p>You haven't completed the survey yet. <Link to="survey" className="text-blue-400 hover:underline">Complete it now</Link> to see your insights!</p>
            )}
          </div>
        </div>

        {/* Column 2: Profile and Academics (takes up 1/3 of the space) */}
        <div className="space-y-6">
          {/* Profile Details Card */}
          <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Profile Details</h3>
              <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-400">Name:</span> {profile.user?.name}</p>
                  <p><span className="font-semibold text-gray-400">Email:</span> {profile.user?.email}</p>
                  <p><span className="font-semibold text-gray-400">Department:</span> {profile.department || 'Not set'}</p>
                  {/* We would need to populate the mentor's name on the backend to show it here */}
                  <p><span className="font-semibold text-gray-400">Mentor:</span> {profile.mentor ? 'Assigned' : 'Not Assigned'}</p>
              </div>
          </div>

          {/* Academic Summary Card */}
          <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Academic Summary</h3>
              <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-400">CGPA:</span> {profile.riskInputs?.CGPA || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-400">Attendance:</span> {profile.riskInputs?.Attendance ? `${profile.riskInputs.Attendance}%` : 'N/A'}</p>
                  <p><span className="font-semibold text-gray-400">Backlogs:</span> {profile.riskInputs?.Backlogs ?? 'N/A'}</p>
              </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default StudentOverviewPage;