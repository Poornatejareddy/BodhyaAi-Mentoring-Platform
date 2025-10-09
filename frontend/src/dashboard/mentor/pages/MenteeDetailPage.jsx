import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getMenteeDetails, triggerRiskCalculation } from '../../../services/mentorService';
import UpdateMenteeForm from '../components/UpdateMenteeForm';

function MenteeDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Use useCallback to memoize the fetch function
  const fetchDetails = useCallback(() => {
    setLoading(true);
    getMenteeDetails(studentId)
      .then(data => setStudent(data))
      .catch(err => setError(err.message || 'Failed to fetch details.'))
      .finally(() => setLoading(false));
  }, [studentId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);
  
  const handleCalculateRisk = async () => {
    setIsCalculating(true);
    try {
      const updatedRiskProfile = await triggerRiskCalculation(studentId);
      // Update the student state with the new risk profile
      setStudent(prevStudent => ({
          ...prevStudent,
          academicRisk: updatedRiskProfile,
      }));
    } catch (err) {
        setError(err.message || 'Failed to calculate risk.');
    } finally {
        setIsCalculating(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) return <div className="text-center">Loading student details...</div>;
  if (error) return <div className="text-center text-red-400">Error: {error}</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">{student.user?.name}</h1>
        <p className="text-gray-400">{student.user?.email}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Risk & Personality) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Risk Card */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Academic Risk Profile</h3>
            {student.academicRisk?.prediction ? (
              <>
                <p>Prediction: <span className="font-bold text-2xl">{student.academicRisk.prediction}</span></p>
                <p className="text-xs text-gray-400 mt-1">Last calculated: {formatDate(student.academicRisk.lastCalculated)}</p>
                <div className="mt-4">
                  <h4 className="font-semibold">Key Factors & Warnings:</h4>
                  <ul className="list-disc list-inside text-yellow-400">
                    {student.academicRisk.warnings?.length > 0 ? 
                      student.academicRisk.warnings.map((w, i) => <li key={i}>{w}</li>) : 
                      <li>No warnings.</li>}
                  </ul>
                </div>
              </>
            ) : <p>Risk profile has not been calculated yet.</p>}
            <button onClick={handleCalculateRisk} disabled={isCalculating} className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors">
              {isCalculating ? 'Calculating...' : 'Re-calculate Risk'}
            </button>
          </div>

          {/* Personality Insights Card */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Personality Insights</h3>
            {student.personalityProfile?.insights?.length > 0 ? (
              <>
                <ul className="list-disc list-inside text-cyan-400 space-y-1">
                  {student.personalityProfile.insights.map((insight, i) => <li key={i}>{insight}</li>)}
                </ul>
                <p className="text-xs text-gray-400 mt-3">Last calculated: {formatDate(student.personalityProfile.lastCalculated)}</p>
              </>
            ) : <p>Student has not completed the survey yet.</p>}
          </div>
        </div>

        {/* Sidebar Area (Update Form & Current Academics) */}
        <div className="space-y-6">
            <UpdateMenteeForm student={student} onUpdateSuccess={fetchDetails} />
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold mb-4">Current Academics</h3>
              <div className="space-y-2 text-sm">
                  <p><span className="font-semibold text-gray-400">CGPA:</span> {student.riskInputs?.CGPA || 'N/A'}</p>
                  <p><span className="font-semibold text-gray-400">Attendance:</span> {student.riskInputs?.Attendance ? `${student.riskInputs.Attendance}%` : 'N/A'}</p>
                  <p><span className="font-semibold text-gray-400">Backlogs:</span> {student.riskInputs?.Backlogs ?? 'N/A'}</p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenteeDetailPage;