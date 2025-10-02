import React, { useState, useEffect } from 'react';
import { getUnassignedStudents, assignStudentToSelf } from '../../../services/mentorService';

function AssignStudentPage() {
  const [students, setStudents] = useState([]);
  const [message, setMessage] = useState('');

  const fetchStudents = () => {
    getUnassignedStudents()
      .then(setStudents)
      .catch(err => setMessage(`Error: ${err.message}`));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAssign = async (studentId) => {
    try {
      const res = await assignStudentToSelf(studentId);
      setMessage(res.message);
      // Refresh the list of unassigned students after assignment
      fetchStudents(); 
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Assign a Student</h2>
      {message && <p className="mb-4 text-green-400">{message}</p>}
      <div className="bg-gray-800 rounded-lg p-4 space-y-2">
        {students.length > 0 ? (
          students.map(student => (
            <div key={student._id} className="flex justify-between items-center p-4 bg-gray-700 rounded-md">
              <div>
                <h3 className="font-bold">{student.user.name}</h3>
                <p className="text-sm text-gray-400">{student.user.email}</p>
              </div>
              <button 
                onClick={() => handleAssign(student._id)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Assign to Me
              </button>
            </div>
          ))
        ) : (
          <p>No unassigned students available.</p>
        )}
      </div>
    </div>
  );
}

export default AssignStudentPage;