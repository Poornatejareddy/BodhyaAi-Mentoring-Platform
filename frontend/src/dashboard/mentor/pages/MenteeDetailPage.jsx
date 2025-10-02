import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMenteeDetails, triggerRiskCalculation } from '../../../services/mentorService';

function MenteeDetailPage() {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenteeDetails(studentId)
      .then(data => {
        setStudent(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [studentId]);
  
  const handleCalculateRisk = async () => {
    alert('Calculating risk... This may take a moment.');
    const updatedRiskProfile = await triggerRiskCalculation(studentId);
    setStudent(prevStudent => ({
        ...prevStudent,
        academicRisk: updatedRiskProfile,
    }));
  }

  if (loading) return <div>Loading student details...</div>;
  if (!student) return <div>Student not found.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold">{student.user.name}</h1>
      <p className="text-gray-400">{student.user.email}</p>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Risk Card */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Academic Risk Profile</h3>
          <p>Prediction: <span className="font-bold">{student.academicRisk?.prediction || 'Not calculated'}</span></p>
          <div className="mt-2">
            <h4 className="font-semibold">Warnings:</h4>
            <ul className="list-disc list-inside text-yellow-400">
              {student.academicRisk?.warnings?.length > 0 ? 
                student.academicRisk.warnings.map((w, i) => <li key={i}>{w}</li>) : 
                <li>No warnings.</li>
              }
            </ul>
          </div>
           <button onClick={handleCalculateRisk} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Re-calculate Risk
          </button>
        </div>

        {/* Personality Insights Card */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Personality Insights</h3>
           <ul className="list-disc list-inside text-cyan-400">
              {student.personalityProfile?.insights?.length > 0 ? 
                student.personalityProfile.insights.map((insight, i) => <li key={i}>{insight}</li>) : 
                <li>No insights available.</li>
              }
            </ul>
        </div>
      </div>
    </div>
  );
}

export default MenteeDetailPage;