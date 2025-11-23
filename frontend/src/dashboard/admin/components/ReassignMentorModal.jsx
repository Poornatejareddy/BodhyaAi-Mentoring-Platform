import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle } from 'lucide-react';

function ReassignMentorModal({ isOpen, onClose, student, token, onSuccess }) {
    const [mentors, setMentors] = useState([]);
    const [selectedMentor, setSelectedMentor] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchingMentors, setFetchingMentors] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMentors();
        }
    }, [isOpen]);

    const fetchMentors = async () => {
        setFetchingMentors(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/mentors', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setMentors(data.data);
            }
        } catch (error) {
            console.error('Error fetching mentors:', error);
        } finally {
            setFetchingMentors(false);
        }
    };

    const handleReassign = async () => {
        if (!selectedMentor) {
            alert('Please select a mentor');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/reassign-mentor', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: student.studentId,
                    newMentorId: selectedMentor
                })
            });

            const data = await response.json();
            if (data.success) {
                onSuccess();
                onClose();
            } else {
                alert(data.message || 'Failed to reassign mentor');
            }
        } catch (error) {
            console.error('Error reassigning mentor:', error);
            alert('An error occurred while reassigning mentor');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-blue-400" />
                        Reassign Mentor
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Student Info */}
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                        <p className="text-sm text-gray-400 mb-1">Student</p>
                        <p className="text-white font-medium">{student?.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{student?.email}</p>
                    </div>

                    {/* Current Mentor */}
                    {student?.currentMentor && (
                        <div className="bg-gray-700/30 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Current Mentor</p>
                            <p className="text-white">{student.currentMentor}</p>
                        </div>
                    )}

                    {/* Mentor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Select New Mentor
                        </label>
                        {fetchingMentors ? (
                            <div className="text-center py-4 text-gray-400">Loading mentors...</div>
                        ) : (
                            <select
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Select a mentor --</option>
                                {mentors.map((mentor) => (
                                    <option key={mentor._id} value={mentor._id}>
                                        {mentor.user?.name} - {mentor.department}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Warning */}
                    <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-yellow-300">
                            This will remove the student from their current mentor and assign them to the new mentor.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReassign}
                            disabled={loading || !selectedMentor}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                    Reassigning...
                                </>
                            ) : (
                                'Reassign Mentor'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReassignMentorModal;
