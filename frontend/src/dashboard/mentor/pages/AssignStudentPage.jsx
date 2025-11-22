import React, { useState, useEffect } from 'react';
import { getUnassignedStudents, assignStudentToSelf } from '../../../services/mentorService';
import { Search, UserPlus, AlertCircle } from 'lucide-react';

function AssignStudentPage() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = () => {
    setLoading(true);
    getUnassignedStudents()
      .then(data => {
        setStudents(data);
        setFilteredStudents(data);
      })
      .catch(err => setMessage(`Error: ${err.message}`))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const results = students.filter(student =>
      student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(results);
  }, [searchTerm, students]);

  const handleAssign = async (studentId) => {
    try {
      const res = await assignStudentToSelf(studentId);
      setMessage(res.message);
      fetchStudents();
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Assign Students</h2>
          <p className="text-gray-400 mt-1">Find and assign new mentees to your cohort.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
          <AlertCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading available students...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div key={student._id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg hover:border-gray-600 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {student.user.name.charAt(0)}
                  </div>
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md">Unassigned</span>
                </div>

                <h3 className="font-bold text-xl text-white mb-1">{student.user.name}</h3>
                <p className="text-sm text-gray-400 mb-6 truncate">{student.user.email}</p>

                <button
                  onClick={() => handleAssign(student._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign to Me
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700 border-dashed">
              <p className="text-gray-400 text-lg">No unassigned students found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignStudentPage;