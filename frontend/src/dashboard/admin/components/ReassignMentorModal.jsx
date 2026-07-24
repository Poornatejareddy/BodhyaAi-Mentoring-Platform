import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../utils/api';
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
            const response = await fetch(`${API_BASE_URL}/admin/mentors`, {
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
            const response = await fetch(`${API_BASE_URL}/admin/reassign-mentor`, {
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
        <div className="fixed inset-0 bg-[color:var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] w-full max-w-md shadow-xl">
                <div className="flex justify-between items-center p-6 border-b border-[var(--line)]">
                    <h2 className="text-xl font-bold text-[var(--ink)] flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-[var(--brand)]" />
                        Reassign Mentor
                    </h2>
                    <button onClick={onClose} className="text-[var(--ink)] hover:text-[var(--ink)] transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Student Info */}
                    <div className="bg-[var(--brand)] border border-[var(--brand)] rounded-lg p-4">
                        <p className="text-sm text-[var(--ink)] mb-1">Student</p>
                        <p className="text-[var(--ink)] font-medium">{student?.name}</p>
                        <p className="text-xs text-[var(--ink)] mt-1">{student?.email}</p>
                    </div>

                    {/* Current Mentor */}
                    {student?.currentMentor && (
                        <div className="bg-[var(--surface)] rounded-lg p-4">
                            <p className="text-sm text-[var(--ink)] mb-1">Current Mentor</p>
                            <p className="text-[var(--ink)]">{student.currentMentor}</p>
                        </div>
                    )}

                    {/* Mentor Selection */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                            Select New Mentor
                        </label>
                        {fetchingMentors ? (
                            <div className="text-center py-4 text-[var(--ink)]">Loading mentors...</div>
                        ) : (
                            <select
                                value={selectedMentor}
                                onChange={(e) => setSelectedMentor(e.target.value)}
                                className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-3 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
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
                    <div className="flex items-start gap-2 bg-[var(--warning-muted)] border border-[var(--warning)] rounded-lg p-3">
                        <AlertCircle className="w-4 h-4 text-[var(--warning)] mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-[var(--warning)]">
                            This will remove the student from their current mentor and assign them to the new mentor.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-[var(--ink)] hover:text-[var(--ink)] transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReassign}
                            disabled={loading || !selectedMentor}
                            className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] disabled:bg-[var(--surface)] text-[var(--ink)] rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-[var(--line)] border-t-transparent rounded-full"></div>
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
