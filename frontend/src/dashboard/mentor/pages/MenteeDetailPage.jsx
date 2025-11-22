import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getMenteeDetails, triggerRiskCalculation } from '../../../services/mentorService';
import InterventionModal from '../components/InterventionModal';
import InterventionTimeline from '../components/InterventionTimeline';
import UpdateMenteeModal from '../components/UpdateMenteeModal';
import ExportButton from '../../common/components/ExportButton';
import RiskBadge from '../../../components/RiskBadge';
import {
  User,
  AlertTriangle,
  Brain,
  BookOpen,
  TrendingUp,
  Calendar,
  RefreshCw,
  FileText,
  Plus,
  Edit
} from 'lucide-react';

function MenteeDetailPage() {
  const { studentId } = useParams();
  const { token } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [interventions, setInterventions] = useState([]);
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const fetchDetails = useCallback(() => {
    setLoading(true);
    getMenteeDetails(studentId)
      .then(data => setStudent(data))
      .catch(err => setError(err.message || 'Failed to fetch details.'))
      .finally(() => setLoading(false));
  }, [studentId]);

  const fetchInterventions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/interventions/student/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInterventions(data.data);
      }
    } catch (error) {
      console.error('Error fetching interventions:', error);
    }
  }, [studentId, token]);

  useEffect(() => {
    fetchDetails();
    fetchInterventions();
  }, [fetchDetails, fetchInterventions]);

  const handleCalculateRisk = async () => {
    setIsCalculating(true);
    try {
      await triggerRiskCalculation(studentId);
      fetchDetails();
    } catch (err) {
      setError(err.message || 'Failed to calculate risk.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCreateIntervention = async (data) => {
    try {
      const response = await fetch('http://localhost:5000/api/interventions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        fetchInterventions();
      }
    } catch (error) {
      console.error('Error creating intervention:', error);
    }
  };

  const handleUpdateIntervention = async (interventionId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/interventions/${interventionId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });
      if (response.ok) {
        fetchInterventions();
      }
    } catch (error) {
      console.error('Error updating intervention:', error);
    }
  };

  const handleUpdateStudent = async (updatedData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/mentors/mentees/${studentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });
      if (response.ok) {
        fetchDetails(); // Refresh student data
      }
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-400">Loading student details...</div>;
  if (error) return <div className="text-center py-12 text-red-400">Error: {error}</div>;
  if (!student) return <div className="text-center py-12 text-gray-400">Student not found.</div>;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl border border-gray-700 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {student.user?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{student.user?.name}</h1>
            <p className="text-gray-300 flex items-center gap-2 mt-1">
              <User className="w-4 h-4" /> {student.user?.email}
            </p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm">
              <span className="text-gray-400">USN: <span className="text-white font-medium">{student.usn}</span></span>
              <span className="text-gray-400">Department: <span className="text-white font-medium">{student.department}</span></span>
              <span className="text-gray-400">Section: <span className="text-white font-medium">{student.section}</span></span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowUpdateModal(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Data
            </button>
            <button
              onClick={handleCalculateRisk}
              disabled={isCalculating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
              {isCalculating ? 'Calculating...' : 'Update Risk'}
            </button>
            <ExportButton studentId={studentId} studentName={student.user?.name} type="button" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">CGPA</p>
          <p className="text-2xl font-bold text-white">{student.riskInputs?.CGPA?.toFixed(2) || 'N/A'}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Attendance</p>
          <p className="text-2xl font-bold text-white">{student.riskInputs?.Attendance || 'N/A'}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Backlogs</p>
          <p className="text-2xl font-bold text-white">{student.riskInputs?.Backlogs || 0}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">Risk Level</p>
          {student.academicRisk?.prediction ? (
            <RiskBadge risk={student.academicRisk.prediction} size="lg" />
          ) : (
            <p className="text-gray-500">Not assessed</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 space-x-6">
        {['overview', 'risk', 'interventions'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Academic Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Study Hours/Day:</span>
                <span className="text-white">{student.riskInputs?.StudyHoursPerDay || 'N/A'} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sleep Hours:</span>
                <span className="text-white">{student.riskInputs?.SleepHours || 'N/A'} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stress Score:</span>
                <span className="text-white">{student.riskInputs?.StressScore || 'N/A'}/10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mental Health:</span>
                <span className="text-white">{student.riskInputs?.MentalHealthIndex || 'N/A'}/10</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
            {student.academicRisk?.prediction ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Prediction:</span>
                  <RiskBadge risk={student.academicRisk.prediction} />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Confidence:</span>
                  <span className="text-white">{(student.academicRisk.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Updated:</span>
                  <span className="text-white">
                    {new Date(student.academicRisk.calculatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Risk not calculated yet</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          {/* Risk Assessment Summary */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Risk Assessment & Analysis</h3>
            {student.academicRisk?.prediction ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-white mb-3">Risk Level</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <RiskBadge risk={student.academicRisk.prediction} size="lg" />
                    <div>
                      <p className="text-sm text-gray-400">Confidence</p>
                      <p className="text-2xl font-bold text-white">
                        {(student.academicRisk.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cognitive Profile Summary */}
                {student.cognitiveProfile && (
                  <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
                    <h4 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      Personality Insights
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400">Openness</p>
                        <p className="text-white font-medium">{student.cognitiveProfile.openness}/10</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Conscientiousness</p>
                        <p className="text-white font-medium">{student.cognitiveProfile.conscientiousness}/10</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Stress Resilience</p>
                        <p className="text-white font-medium">{student.cognitiveProfile.neuroticism}/10</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Team work</p>
                        <p className="text-white font-medium">{student.cognitiveProfile.agreeableness}/10</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Risk not calculated yet</p>
            )}
          </div>

          {/* Warnings & Actionable Recommendations */}
          {student.academicRisk?.warnings && student.academicRisk.warnings.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                Critical Issues Identified
              </h3>
              <div className="space-y-3">
                {student.academicRisk.warnings.map((warning, i) => (
                  <div key={i} className="p-4 bg-red-900/20 rounded-lg border border-red-700/50 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300">{warning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Action Plan */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Recommended Actions
            </h3>
            <div className="space-y-4">
              {/* Attendance-based recommendation */}
              {student.riskInputs?.Attendance < 75 && (
                <div className="p-4 bg-orange-900/20 rounded-lg border-l-4 border-orange-500">
                  <h4 className="text-white font-semibold mb-2">📊 Attendance Improvement Needed</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Current attendance: {student.riskInputs.Attendance}% (Below 75% minimum)
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Set attendance goal: Reach 85% by end of semester</li>
                    <li>• Create schedule to avoid missing classes</li>
                    <li>• Discuss any health/personal issues affecting attendance</li>
                  </ul>
                </div>
              )}

              {/* CGPA-based recommendation */}
              {student.riskInputs?.CGPA < 6.5 && (
                <div className="p-4 bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                  <h4 className="text-white font-semibold mb-2">📚 Academic Performance Support</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Current CGPA: {student.riskInputs.CGPA?.toFixed(2)} (Needs improvement)
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Focus on weak subjects - identify and target them</li>
                    <li>• Increase study hours to {(student.riskInputs.StudyHoursPerDay || 0) + 2} hrs/day</li>
                    <li>• Join study groups or tutoring sessions</li>
                    <li>• Review previous semester topics regularly</li>
                  </ul>
                </div>
              )}

              {/* Stress-based recommendation */}
              {student.riskInputs?.StressScore > 7 && (
                <div className="p-4 bg-purple-900/20 rounded-lg border-l-4 border-purple-500">
                  <h4 className="text-white font-semibold mb-2">🧘 Mental Wellness Priority</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Stress level: {student.riskInputs.StressScore}/10 (High)
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Practice daily meditation or breathing exercises</li>
                    <li>• Ensure {8 - (student.riskInputs.SleepHours || 0)} more hours of sleep (target: 8 hrs)</li>
                    <li>• Engage in physical activity for stress relief</li>
                    <li>• Consider counseling services if needed</li>
                  </ul>
                </div>
              )}

              {/* Backlogs recommendation */}
              {student.riskInputs?.Backlogs > 0 && (
                <div className="p-4 bg-red-900/20 rounded-lg border-l-4 border-red-500">
                  <h4 className="text-white font-semibold mb-2">⚠️ Backlog Clearance Plan</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Active backlogs: {student.riskInputs.Backlogs} subject(s)
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Create backlog clearance timeline before next semester</li>
                    <li>• Allocate {student.riskInputs.Backlogs * 2} hours/week for backlog subjects</li>
                    <li>• Get faculty support for weak topics</li>
                    <li>• Priority: Clear backlogs to maintain eligibility</li>
                  </ul>
                </div>
              )}

              {/* Study Hours recommendation */}
              {student.riskInputs?.StudyHoursPerDay < 3 && (
                <div className="p-4 bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="text-white font-semibold mb-2">⏰ Study Routine Enhancement</h4>
                  <p className="text-gray-300 text-sm mb-3">
                    Current study time: {student.riskInputs.StudyHoursPerDay} hrs/day (Insufficient)
                  </p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Increase to minimum 4-5 hours of focused study daily</li>
                    <li>• Use Pomodoro technique (25 min study, 5 min break)</li>
                    <li>• Create distraction-free study environment</li>
                    <li>• Track progress using study planner</li>
                  </ul>
                </div>
              )}

              {/* Default positive recommendation */}
              {student.riskInputs?.Attendance >= 75 && student.riskInputs?.CGPA >= 7.0 && (
                <div className="p-4 bg-green-900/20 rounded-lg border-l-4 border-green-500">
                  <h4 className="text-white font-semibold mb-2">✅ Maintain Excellence</h4>
                  <p className="text-gray-300 text-sm mb-3">Performance is good! Keep up the momentum</p>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li>• Continue current study routine</li>
                    <li>• Explore advanced topics in areas of interest</li>
                    <li>• Consider peer tutoring to reinforce learning</li>
                    <li>• Participate in extracurricular activities</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-white">Intervention History</h3>
            <button
              onClick={() => setShowInterventionModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Intervention
            </button>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <InterventionTimeline
              interventions={interventions}
              onUpdate={handleUpdateIntervention}
            />
          </div>
        </div>
      )}

      {/* Update Modal */}
      <UpdateMenteeModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        student={student}
        onUpdate={handleUpdateStudent}
      />
    </div>
  );
}

export default MenteeDetailPage;