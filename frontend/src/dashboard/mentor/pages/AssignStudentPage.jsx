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
          <h2 className="text-3xl font-bold text-[var(--ink)]">Assign Students</h2>
          <p className="text-[var(--ink)] mt-1">Find and assign new mentees to your cohort.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--ink)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.includes('Error') ? 'bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]' : 'bg-[var(--success-muted)] text-[var(--success)] border border-[var(--success)]'}`}>
          <AlertCircle className="w-5 h-5" />
          {message}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-[var(--ink)]">Loading available students...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map(student => (
              <div key={student._id} className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 shadow-lg hover:border-[var(--line)] transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface)]   flex items-center justify-center text-[var(--ink)] font-bold text-lg">
                    {student.user.name.charAt(0)}
                  </div>
                  <span className="px-2 py-1 bg-[var(--surface)] text-[var(--ink)] text-xs rounded-md">Unassigned</span>
                </div>

                <h3 className="font-bold text-xl text-[var(--ink)] mb-1">{student.user.name}</h3>
                <p className="text-sm text-[var(--ink)] mb-6 truncate">{student.user.email}</p>

                <button
                  onClick={() => handleAssign(student._id)}
                  className="w-full bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-[var(--shadow-md)]"
                >
                  <UserPlus className="w-4 h-4" />
                  Assign to Me
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-[var(--surface)] rounded-xl border border-[var(--line)] border-dashed">
              <p className="text-[var(--ink)] text-lg">No unassigned students found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AssignStudentPage;