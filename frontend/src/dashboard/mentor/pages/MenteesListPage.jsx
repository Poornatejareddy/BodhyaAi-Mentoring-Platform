import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyMentees } from '../../../services/mentorService';
import { Search, User, AlertTriangle, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import RiskBadge from '../../../components/RiskBadge';

function MenteesListPage() {
  const [mentees, setMentees] = useState([]);
  const [filteredMentees, setFilteredMentees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getMyMentees()
      .then(data => {
        if (Array.isArray(data)) {
          setMentees(data);
          setFilteredMentees(data);
        } else {
          console.error("Data received is not an array:", data);
          setError("Received invalid data format from the server.");
        }
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const results = mentees.filter(mentee =>
      mentee.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentee.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMentees(results);
  }, [searchTerm, mentees]);

  if (loading) {
    return <div className="text-center py-12 text-[var(--ink)]">Loading your mentees...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-[var(--danger)]">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[var(--ink)]">My Mentees</h2>
          <p className="text-[var(--ink)] mt-1">Track and manage your assigned students.</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--ink)] w-5 h-5" />
          <input
            type="text"
            placeholder="Search mentees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] pl-10 pr-4 py-2.5 rounded-lg focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMentees.length > 0 ? (
          filteredMentees.map(mentee => (
            <Link
              key={mentee._id}
              to={`/dashboard/mentor/mentees/${mentee._id}`}
              className="block bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6 shadow-lg hover:border-[var(--brand)] hover:shadow-[var(--shadow-md)] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-[var(--surface)]   flex items-center justify-center text-[var(--ink)] font-bold text-lg">
                  {mentee.user?.name?.charAt(0) || 'U'}
                </div>

                {/* Risk Badge */}
                {mentee.academicRisk?.prediction ? (
                  <RiskBadge
                    risk={mentee.academicRisk.prediction}
                    confidence={mentee.academicRisk.confidence}
                    size="sm"
                    showIcon={true}
                  />
                ) : (
                  <span className="px-2 py-1 bg-[var(--surface)] text-[var(--ink)] text-xs font-medium rounded-md flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Not Assessed
                  </span>
                )}
              </div>

              <h3 className="font-bold text-xl text-[var(--ink)] mb-1 group-hover:text-[var(--brand)] transition-colors">
                {mentee.user?.name || 'Unnamed Student'}
              </h3>
              <p className="text-sm text-[var(--ink)] mb-4 truncate">{mentee.user?.email || 'No Email'}</p>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--line)]">
                <div>
                  <p className="text-xs text-[var(--ink)] mb-1">CGPA</p>
                  <p className="text-sm font-semibold text-[var(--ink)] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[var(--success)]" />
                    {mentee.riskInputs?.CGPA || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--ink)] mb-1">Attendance</p>
                  <p className="text-sm font-semibold text-[var(--ink)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--brand)]" />
                    {mentee.riskInputs?.Attendance ? `${mentee.riskInputs.Attendance}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-[var(--surface)] rounded-xl border border-[var(--line)] border-dashed">
            <p className="text-[var(--ink)] text-lg mb-4">You have no mentees assigned.</p>
            <Link to="/dashboard/mentor/assign-student" className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg font-medium transition-colors">
              <User className="w-4 h-4" />
              Assign one now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MenteesListPage;