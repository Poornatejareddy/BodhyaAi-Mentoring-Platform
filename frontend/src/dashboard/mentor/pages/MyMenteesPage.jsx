import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyMentees } from '../../../services/mentorService';

function MyMenteesPage() {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    getMyMentees()
      .then(data => {
        // --- ADD THIS LINE TO DEBUG ---
        console.log('Data received from API:', data); 
        // ------------------------------
        setMentees(data);
      })
      .catch(err => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ... (rest of the component) // The empty array ensures this runs only once

  if (loading) {
    return <div className="text-center">Loading your mentees...</div>;
  }

  if (error) {
    return <div className="text-center text-red-400">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">My Mentees</h2>
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        {mentees.length > 0 ? (
          mentees.map(mentee => (
            <Link
              key={mentee._id}
              to={`/dashboard/mentor/mentees/${mentee._id}`}
              className="block p-4 bg-gray-700 rounded-md transition-transform transform hover:scale-105 hover:bg-gray-600"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{mentee.user.name}</h3>
                  <p className="text-sm text-gray-400">{mentee.user.email}</p>
                </div>
                <span className="text-blue-400 font-semibold">View Profile →</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">You have no mentees assigned.</p>
            <Link to="/dashboard/mentor/assign-student" className="mt-4 inline-block text-blue-400 hover:underline">
              Assign one now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyMenteesPage;