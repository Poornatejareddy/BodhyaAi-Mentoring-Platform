import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL, SOCKET_URL } from '../../../utils/api';
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
        const socket = io(SOCKET_URL, {
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
            const response = await fetch(`${API_BASE_URL}/personality/my-students-results`, {
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
            const url = `${API_BASE_URL}/personality/generate-link/${studentId}${sendEmail ? '?sendEmail=true' : ''}`;
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
            const response = await fetch(`${API_BASE_URL}/personality/generate-links-bulk`, {
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
            const response = await fetch(`${API_BASE_URL}/personality/profile/${studentId}/pdf`, {
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
                return <span className="px-3 py-1 bg-[var(--success-muted)] border border-[var(--success)] text-[var(--success)] rounded-full text-sm font-medium">✓ Completed</span>;
            case 'pending':
                return <span className="px-3 py-1 bg-[var(--warning-muted)] border border-[var(--warning)] text-[var(--warning)] rounded-full text-sm font-medium">⏳ Pending</span>;
            case 'expired':
                return <span className="px-3 py-1 bg-[var(--danger-muted)] border border-[var(--danger)] text-[var(--danger)] rounded-full text-sm font-medium">✗ Expired</span>;
            default:
                return <span className="px-3 py-1 bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] rounded-full text-sm font-medium">No Link</span>;
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
                    <Loader2 className="w-16 h-16 text-[var(--brand)] mx-auto mb-4 animate-spin" />
                    <p className="text-[var(--ink)]">Loading students data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-[var(--surface)]   rounded-xl p-8 text-[var(--ink)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-[var(--surface)] p-4 rounded-lg backdrop-blur-sm">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Student Personality Surveys</h1>
                            <p className="text-[var(--brand)] mt-1">Generate survey links and view personality profiles</p>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedStudents.size > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => generateBulkLinks(false)}
                                disabled={bulkGenerating}
                                className="px-4 py-2 bg-[var(--surface)] backdrop-blur-sm hover:bg-[var(--surface)] rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                                <LinkIcon className="w-4 h-4" />
                                Generate {selectedStudents.size} Links
                            </button>
                            <button
                                onClick={() => generateBulkLinks(true)}
                                disabled={bulkGenerating}
                                className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] rounded-lg font-medium transition-all flex items-center gap-2"
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
                <div className="bg-[var(--danger-muted)] border border-[var(--danger)] rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-[var(--danger)]" />
                    <p className="text-[var(--danger)]">{error}</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--line)]">
                    <div className="text-[var(--ink)] text-sm mb-1">Total Students</div>
                    <div className="text-3xl font-bold text-[var(--ink)]">{studentsData.length}</div>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--line)]">
                    <div className="text-[var(--ink)] text-sm mb-1">Completed</div>
                    <div className="text-3xl font-bold text-[var(--success)]">
                        {studentsData.filter(s => s.linkStatus === 'completed').length}
                    </div>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--line)]">
                    <div className="text-[var(--ink)] text-sm mb-1">Pending</div>
                    <div className="text-3xl font-bold text-[var(--warning)]">
                        {studentsData.filter(s => s.linkStatus === 'pending').length}
                    </div>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-6 border border-[var(--line)]">
                    <div className="text-[var(--ink)] text-sm mb-1">Selected</div>
                    <div className="text-3xl font-bold text-[var(--brand)]">{selectedStudents.size}</div>
                </div>
            </div>

            {/* Students List */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                <div className="p-6 border-b border-[var(--line)] flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-[var(--ink)]">Students & Survey Links</h2>
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-[var(--brand)] hover:text-[var(--brand)] transition-colors"
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
                        <div className="p-8 text-center text-[var(--ink)]">
                            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No students assigned yet</p>
                        </div>
                    ) : (
                        studentsData.map((student) => (
                            <div key={student.studentId} className="p-6 hover:bg-[var(--surface)] transition-colors">
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => toggleStudentSelection(student.studentId)}
                                        className="mt-1"
                                    >
                                        {selectedStudents.has(student.studentId) ? (
                                            <CheckSquare className="w-6 h-6 text-[var(--brand)]" />
                                        ) : (
                                            <Square className="w-6 h-6 text-[var(--ink)] hover:text-[var(--ink)]" />
                                        )}
                                    </button>

                                    {/* Student Info & Actions */}
                                    <div className="flex-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Student Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-[var(--ink)]">{student.name}</h3>
                                                {getStatusBadge(student.linkStatus)}
                                            </div>
                                            <div className="text-sm text-[var(--ink)] space-y-1">
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
                                                        className="px-3 py-2 bg-[var(--brand)] text-[var(--ink)] rounded-lg hover:bg-[var(--brand)] transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
                                                    >
                                                        <LinkIcon className="w-4 h-4" />
                                                        Generate Link
                                                    </button>
                                                    <button
                                                        onClick={() => generateSurveyLink(student.studentId, true)}
                                                        disabled={generatingLink === student.studentId}
                                                        className="px-3 py-2 bg-[var(--brand)] text-[var(--ink)] rounded-lg hover:bg-[var(--brand)] transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
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
                                                        className="px-3 py-2 bg-[var(--brand)] text-[var(--ink)] rounded-lg hover:bg-[var(--brand)] transition-colors text-sm flex items-center gap-2"
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
                                                        className="px-3 py-2 bg-[var(--surface)] text-[var(--ink)] rounded-lg hover:bg-[var(--surface)] transition-colors text-sm flex items-center gap-2"
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
                                                    className="px-3 py-2 bg-[var(--warning-muted)] text-[var(--ink)] rounded-lg hover:bg-[var(--warning-muted)] transition-colors text-sm flex items-center gap-2"
                                                >
                                                    <LinkIcon className="w-4 h-4" />
                                                    Regenerate
                                                </button>
                                            )}

                                            {student.hasPersonalityData && (
                                                <>
                                                    <button
                                                        onClick={() => viewPersonalityDetails(student)}
                                                        className="px-3 py-2 bg-[var(--success-muted)] text-[var(--ink)] rounded-lg hover:bg-[var(--success-muted)] transition-colors text-sm flex items-center gap-2"
                                                    >
                                                        <Brain className="w-4 h-4" />
                                                        View Profile
                                                    </button>
                                                    <button
                                                        onClick={() => downloadPDF(student.studentId, student.name)}
                                                        disabled={downloadingPDF === student.studentId}
                                                        className="px-3 py-2 bg-[var(--brand)] text-[var(--ink)] rounded-lg hover:bg-[var(--brand)] transition-colors text-sm flex items-center gap-2"
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
                <div className="fixed inset-0 bg-[color:var(--overlay)] flex items-center justify-center p-4 z-50" onClick={closeModal}>
                    <div className="bg-[var(--surface)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-[var(--line)]" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-[var(--surface)]   p-6 text-[var(--ink)] flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-bold">{selectedStudent.name}'s Personality Profile</h2>
                                <p className="text-[var(--brand)] text-sm">{selectedStudent.usn} | {selectedStudent.department}</p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="text-[var(--ink)] hover:bg-[var(--surface)] rounded-lg p-2 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-6">
                            {/* Radar Chart */}
                            <div>
                                <h3 className="text-xl font-semibold text-[var(--ink)] mb-4">OCEAN Personality Traits</h3>
                                <ResponsiveContainer width="100%" height={350}>
                                    <RadarChart data={[
                                        { trait: 'Openness', value: selectedStudent.personalityData.oceanScores.Openness * 100 },
                                        { trait: 'Conscientiousness', value: selectedStudent.personalityData.oceanScores.Conscientiousness * 100 },
                                        { trait: 'Extraversion', value: selectedStudent.personalityData.oceanScores.Extraversion * 100 },
                                        { trait: 'Agreeableness', value: selectedStudent.personalityData.oceanScores.Agreeableness * 100 },
                                        { trait: 'Neuroticism', value: (1 - selectedStudent.personalityData.oceanScores.Neuroticism) * 100 },
                                    ]}>
                                        <PolarGrid stroke="var(--chart-grid)" />
                                        <PolarAngleAxis dataKey="trait" stroke="var(--chart-text)" />
                                        <PolarRadiusAxis domain={[0, 100]} stroke="var(--chart-text)" />
                                        <Radar
                                            name="Scores"
                                            dataKey="value"
                                            stroke="var(--brand)"
                                            fill="var(--brand)"
                                            fillOpacity={0.6}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--chart-grid)', border: '1px solid var(--chart-grid)', borderRadius: '8px' }}
                                            labelStyle={{ color: 'var(--chart-text)' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Score Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {Object.entries(selectedStudent.personalityData.oceanScores).map(([trait, score]) => (
                                    <div key={trait} className="bg-[var(--surface)] rounded-lg p-4 text-center">
                                        <div className="text-xs text-[var(--ink)] mb-1">{trait}</div>
                                        <div className="text-2xl font-bold text-[var(--brand)]">{Math.round(score * 100)}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Insights */}
                            {selectedStudent.personalityData.insights && selectedStudent.personalityData.insights.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--ink)] mb-3">Key Insights</h3>
                                    <div className="space-y-2">
                                        {selectedStudent.personalityData.insights.map((insight, idx) => (
                                            <div key={idx} className="bg-[var(--brand)] border border-[var(--brand)] rounded-lg p-3 text-[var(--ink)]">
                                                {insight}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed Interpretation */}
                            {selectedStudent.personalityData.interpretation && (
                                <div>
                                    <h3 className="text-lg font-semibold text-[var(--ink)] mb-3">Mentor Tips</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(selectedStudent.personalityData.interpretation).map(([trait, data]) => (
                                            <div key={trait} className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--line)]">
                                                <h4 className="font-semibold text-[var(--ink)] mb-2">{trait}</h4>
                                                <div className="text-sm text-[var(--ink)] space-y-1">
                                                    <div><span className="font-medium text-[var(--brand)]">Level:</span> {data.level}</div>
                                                    <div><span className="font-medium text-[var(--brand)]">Tip:</span> {data.mentorTip}</div>
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
