import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Brain, Link as LinkIcon, Copy, CheckCircle, Send, AlertCircle, Loader2, ExternalLink, Clock, User, Download, Mail, CheckSquare, Square } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const StudentSurveyLinksPage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [studentsData, setStudentsData] = useState([]);
    const [generatingLink, setGeneratingLink] = useState(null);
    const [copiedLink, setCopiedLink] = useState(null);
    const [error, setError] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [bulkGenerating, setBulkGenerating] = useState(false);
    const [downloadingPDF, setDownloadingPDF] = useState(null);

    useEffect(() => {
        fetchStudentsResults();

        // Set up Socket.io for real-time notifications
        const socket = io('http://localhost:5000', {
            auth: { token }
        });

        socket.on('survey:completed', (data) => {
            console.log('Survey completed notification:', data);
            toast.success(`${data.studentName} completed the personality survey!`, {
                duration: 5000,
                icon: '🎉',
            });
            // Refresh data
            fetchStudentsResults();
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const fetchStudentsResults = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/personality/my-students-results', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setStudentsData(data.data.students);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch student data');
        } finally {
            setLoading(false);
        }
    };

    const generateSurveyLink = async (studentId, sendEmail = false) => {
        setGeneratingLink(studentId);
        setError(null);

        try {
            const url = `http://localhost:5000/api/personality/generate-link/${studentId}${sendEmail ? '?sendEmail=true' : ''}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                if (data.data.emailSent) {
                    toast.success(`Survey link sent to student's email!`);
                } else if (data.data.emailError) {
                    toast.error(`Link generated but email failed: ${data.data.emailError}`);
                } else {
                    toast.success('Survey link generated successfully!');
                }
                await fetchStudentsResults();
            } else {
                setError(data.message);
                toast.error(data.message);
            }
        } catch (err) {
            setError('Failed to generate survey link');
            toast.error('Failed to generate survey link');
        } finally {
            setGeneratingLink(null);
        }
    };

    const generateBulkLinks = async (sendEmail = false) => {
        if (selectedStudents.size === 0) {
            toast.error('Please select at least one student');
            return;
        }

        setBulkGenerating(true);
        try {
            const response = await fetch('http://localhost:5000/api/personality/generate-links-bulk', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    studentIds: Array.from(selectedStudents),
                    sendEmail
                })
            });
            const data = await response.json();

            if (data.success) {
                toast.success(`Generated links for ${data.data.successful}/${data.data.totalRequested} students`);
                setSelectedStudents(new Set());
                await fetchStudentsResults();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error('Failed to generate bulk links');
        } finally {
            setBulkGenerating(false);
        }
    };

    const downloadPDF = async (studentId, studentName) => {
        setDownloadingPDF(studentId);
        try {
            const response = await fetch(`http://localhost:5000/api/personality/profile/${studentId}/pdf`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${studentName.replace(/\s+/g, '_')}_Personality_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            toast.error('Failed to download PDF');
        } finally {
            setDownloadingPDF(null);
        }
    };

    const copyToClipboard = (url, studentId) => {
        navigator.clipboard.writeText(url);
        setCopiedLink(studentId);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopiedLink(null), 2000);
    };

    const toggleStudentSelection = (studentId) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(studentId)) {
            newSelected.delete(studentId);
        } else {
            newSelected.add(studentId);
        }
        setSelectedStudents(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedStudents.size === studentsData.length) {
            setSelectedStudents(new Set());
        } else {
            setSelectedStudents(new Set(studentsData.map(s => s.studentId)));
        }
    };

    const getStatusBadge = (linkStatus) => {
        switch (linkStatus) {
            case 'completed':
                return <span className="px-3 py-1 bg-green-900/30 border border-green-700/50 text-green-400 rounded-full text-sm font-medium">✓ Completed</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-900/30 border border-yellow-700/50 text-yellow-400 rounded-full text-sm font-medium">⏳ Pending</span>;
            case 'expired':
                return <span className="px-3 py-1 bg-red-900/30 border border-red-700/50 text-red-400 rounded-full text-sm font-medium">✗ Expired</span>;
            default:
                return <span className="px-3 py-1 bg-gray-700/50 border border-gray-600 text-gray-400 rounded-full text-sm font-medium">No Link</span>;
        }
    };

    const viewPersonalityDetails = (student) => {
        setSelectedStudent(student);
    };

    const closeModal = () => {
        setSelectedStudent(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-400">Loading students data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Student Personality Surveys</h1>
                            <p className="text-purple-100 mt-1">Generate survey links and view personality profiles</p>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedStudents.size > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => generateBulkLinks(false)}
                                disabled={bulkGenerating}
                                className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Generate {selectedStudents.size} Links
                            </button>
                            <button
                                onClick={() => generateBulkLinks(true)}
                                disabled={bulkGenerating}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <Mail className="w-4 h-4" />
                                Generate & Email
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Total Students</div>
                    <div className="text-3xl font-bold text-white">{studentsData.length}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Completed</div>
                    <div className="text-3xl font-bold text-green-400">
                        {studentsData.filter(s => s.linkStatus === 'completed').length}
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Pending</div>
                    <div className="text-3xl font-bold text-yellow-400">
                        {studentsData.filter(s => s.linkStatus === 'pending').length}
                    </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="text-gray-400 text-sm mb-1">Selected</div>
                    <div className="text-3xl font-bold text-purple-400">{selectedStudents.size}</div>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-gray-800 rounded-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-white">Students & Survey Links</h2>
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                    >
                        {selectedStudents.size === studentsData.length ? (
                            <CheckSquare className="w-5 h-5" />
                        ) : (
                            <Square className="w-5 h-5" />
                        )}
                        Select All
                    </button>
                </div>

                <div className="divide-y divide-gray-700">
                    {studentsData.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No students assigned yet</p>
                        </div>
                    ) : (
                        studentsData.map((student) => (
                            <div key={student.studentId} className="p-6 hover:bg-gray-700/30 transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleStudentSelection(student.studentId)}
                                        className="mt-1"
                                    >
                                        {selectedStudents.has(student.studentId) ? (
                                            <CheckSquare className="w-6 h-6 text-purple-400" />
                                        ) : (
                                            <Square className="w-6 h-6 text-gray-500 hover:text-gray-400" />
                                        )}
                                    </button>

                                    {/* Student Info & Actions */}
                                    <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Student Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-white">{student.name}</h3>
                                                {getStatusBadge(student.linkStatus)}
                                            </div>
                                            <div className="text-sm text-gray-400 space-y-1">
                                                <div>USN: {student.usn} | {student.department}</div>
                                                {student.email && <div>Email: {student.email}</div>}
                                                {student.linkCreatedAt && (
                                                    <div className="flex items-center gap-2 text-xs">
                                                        <Clock className="w-4 h-4" />
                                                        Link created: {new Date(student.linkCreatedAt).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-2">
                                            {student.linkStatus === 'no_link' && (
                                                <>
                                                    <button
                                                        onClick={() => generateSurveyLink(student.studentId, false)}
                                                        disabled={generatingLink === student.studentId}
                                                        className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                        Generate Link
                                                    </button>
                                                    <button
                                                        onClick={() => generateSurveyLink(student.studentId, true)}
                                                        disabled={generatingLink === student.studentId}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                                                    >
                                                        <Mail className="w-4 h-4" />
                                                        Generate & Email
                                                    </button>
                                                </>
                                            )}

                                            {student.linkStatus === 'pending' && student.surveyUrl && (
                                                <>
                                                    <button
                                                        onClick={() => copyToClipboard(student.surveyUrl, student.studentId)}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        {copiedLink === student.studentId ? (
                                                            <>
                                                                <CheckCircle className="w-4 h-4" />
                                                                Copied!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-4 h-4" />
                                                                Copy Link
                                                            </>
                                                        )}
                                                    </button>
                                                    <a
                                                        href={student.surveyUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        Open
                                                    </a>
                                                </>
                                            )}

                                            {student.linkStatus === 'expired' && (
                                                <button
                                                    onClick={() => generateSurveyLink(student.studentId)}
                                                    disabled={generatingLink === student.studentId}
                                                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                    Regenerate
                                                </button>
                                            )}

                                            {student.hasPersonalityData && (
                                                <>
                                                    <button
                                                        onClick={() => viewPersonalityDetails(student)}
                                                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        <Brain className="w-4 h-4" />
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => downloadPDF(student.studentId, student.name)}
                                                        disabled={downloadingPDF === student.studentId}
                                                        className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        {downloadingPDF === student.studentId ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                Downloading...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4" />
                                                                PDF
                                                            </>
                                                        )}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Personality Profile Modal (same as before) */}
            {selectedStudent && selectedStudent.personalityData && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" onClick={closeModal}>
                    <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedStudent.name}'s Personality Profile</h2>
                                <p className="text-purple-100 text-sm">{selectedStudent.usn} | {selectedStudent.department}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Radar Chart */}
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">OCEAN Personality Traits</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <RadarChart data={[
                                        { trait: 'Openness', value: selectedStudent.personalityData.oceanScores.Openness * 100 },
                                        { trait: 'Conscientiousness', value: selectedStudent.personalityData.oceanScores.Conscientiousness * 100 },
                                        { trait: 'Extraversion', value: selectedStudent.personalityData.oceanScores.Extraversion * 100 },
                                        { trait: 'Agreeableness', value: selectedStudent.personalityData.oceanScores.Agreeableness * 100 },
                                        { trait: 'Neuroticism', value: (1 - selectedStudent.personalityData.oceanScores.Neuroticism) * 100 },
                                    ]}>
                                        <PolarGrid stroke="#374151" />
                                        <PolarAngleAxis dataKey="trait" stroke="#9ca3af" />
                                        <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" />
                                        <Radar
                                            name="Scores"
                                            dataKey="value"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                            labelStyle={{ color: '#f3f4f6' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Score Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {Object.entries(selectedStudent.personalityData.oceanScores).map(([trait, score]) => (
                                    <div key={trait} className="bg-gray-700/50 rounded-lg p-4 text-center">
                                        <div className="text-xs text-gray-400 mb-1">{trait}</div>
                                        <div className="text-2xl font-bold text-purple-400">{Math.round(score * 100)}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Insights */}
                            {selectedStudent.personalityData.insights && selectedStudent.personalityData.insights.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
                                    <div className="space-y-2">
                                        {selectedStudent.personalityData.insights.map((insight, idx) => (
                                            <div key={idx} className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3 text-gray-300">
                                                {insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Interpretation */}
                            {selectedStudent.personalityData.interpretation && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Mentor Tips</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedStudent.personalityData.interpretation).map(([trait, data]) => (
                                            <div key={trait} className="bg-gray-700/30 rounded-lg p-4 border border-gray-600">
                                                <h4 className="font-semibold text-white mb-2">{trait}</h4>
                                                <div className="text-sm text-gray-400 space-y-1">
                                                    <div><span className="font-medium text-purple-400">Level:</span> {data.level}</div>
                                                    <div><span className="font-medium text-purple-400">Tip:</span> {data.mentorTip}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentSurveyLinksPage;
