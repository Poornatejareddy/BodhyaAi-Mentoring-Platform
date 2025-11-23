import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const UpdateMenteeModal = ({ isOpen, onClose, student, onUpdate }) => {
    const [formData, setFormData] = useState({
        // Academic
        CGPA: student?.riskInputs?.CGPA || '',
        Attendance: student?.riskInputs?.Attendance || '',
        Backlogs: student?.riskInputs?.Backlogs || 0,
        StudyHoursPerDay: student?.riskInputs?.StudyHoursPerDay || '',
        IAT1: student?.riskInputs?.IAT1 || '',
        IAT2: student?.riskInputs?.IAT2 || '',
        IAT3: student?.riskInputs?.IAT3 || '',

        // Socio-economic
        FatherIncome: student?.riskInputs?.FatherIncome || '',
        MotherIncome: student?.riskInputs?.MotherIncome || '',
        ParentEducation: student?.academicHistory?.parentEducation || 'Graduate',
        InternetAccess: student?.riskInputs?.InternetAccess ? 'Yes' : 'No',
        PartTimeJob: student?.riskInputs?.PartTimeJob ? 'Yes' : 'No',

        // Lifestyle & Health
        StressScore: student?.riskInputs?.StressScore || '',
        SleepHours: student?.riskInputs?.SleepHours || '',
        MentalHealthIndex: student?.riskInputs?.MentalHealthIndex || '',
        ExerciseHours: student?.riskInputs?.ExerciseHours || '',
        ScreenTime: student?.riskInputs?.ScreenTime || '',
        SocialHours: student?.riskInputs?.SocialHours || '',

        // Engagement
        ClubParticipation: student?.supportEngagement?.clubParticipation ? 'Yes' : 'No',
        MentorMeetings: student?.supportEngagement?.mentorMeetings || 0,
        CounselingSessions: student?.supportEngagement?.counselingSessions || 0
    });

    useEffect(() => {
        if (student) {
            setFormData({
                // Academic
                CGPA: student.riskInputs?.CGPA || '',
                Attendance: student.riskInputs?.Attendance || '',
                Backlogs: student.riskInputs?.Backlogs || 0,
                StudyHoursPerDay: student.riskInputs?.StudyHoursPerDay || '',
                IAT1: student.riskInputs?.IAT1 || '',
                IAT2: student.riskInputs?.IAT2 || '',
                IAT3: student.riskInputs?.IAT3 || '',

                // Socio-economic
                FatherIncome: student.riskInputs?.FatherIncome || '',
                MotherIncome: student.riskInputs?.MotherIncome || '',
                ParentEducation: student.academicHistory?.parentEducation || 'Graduate',
                InternetAccess: student.riskInputs?.InternetAccess ? 'Yes' : 'No',
                PartTimeJob: student.riskInputs?.PartTimeJob ? 'Yes' : 'No',

                // Lifestyle & Health
                StressScore: student.riskInputs?.StressScore || '',
                SleepHours: student.riskInputs?.SleepHours || '',
                MentalHealthIndex: student.riskInputs?.MentalHealthIndex || '',
                ExerciseHours: student.riskInputs?.ExerciseHours || '',
                ScreenTime: student.riskInputs?.ScreenTime || '',
                SocialHours: student.riskInputs?.SocialHours || '',

                // Engagement
                ClubParticipation: student.supportEngagement?.clubParticipation ? 'Yes' : 'No',
                MentorMeetings: student.supportEngagement?.mentorMeetings || 0,
                CounselingSessions: student.supportEngagement?.counselingSessions || 0
            });
        }
    }, [student]);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = value;

        // Parse numbers
        if (['CGPA', 'MentalHealthIndex'].includes(name)) {
            parsedValue = parseFloat(value) || value;
        } else if (['Attendance', 'Backlogs', 'StudyHoursPerDay', 'IAT1', 'IAT2', 'IAT3',
            'FatherIncome', 'MotherIncome', 'StressScore', 'SleepHours',
            'ExerciseHours', 'ScreenTime', 'SocialHours', 'MentorMeetings',
            'CounselingSessions'].includes(name)) {
            parsedValue = parseInt(value) || value;
        }

        setFormData(prev => ({
            ...prev,
            [name]: parsedValue
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onUpdate(formData);
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            alert('Failed to update student data');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Update Student Data</h2>
                        <p className="text-gray-400 text-sm mt-1">{student?.user?.name} - Comprehensive Risk Profile</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 1. Academic Performance */}
                    <div>
                        <h3 className="text-lg font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">Academic Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">CGPA *</label>
                                <input type="number" name="CGPA" value={formData.CGPA} onChange={handleChange} step="0.01" min="0" max="10" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Attendance (%) *</label>
                                <input type="number" name="Attendance" value={formData.Attendance} onChange={handleChange} min="0" max="100" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Backlogs</label>
                                <input type="number" name="Backlogs" value={formData.Backlogs} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Study Hrs/Day</label>
                                <input type="number" name="StudyHoursPerDay" value={formData.StudyHoursPerDay} onChange={handleChange} min="0" max="24" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">IAT 1 Score</label>
                                <input type="number" name="IAT1" value={formData.IAT1} onChange={handleChange} min="0" max="100" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">IAT 2 Score</label>
                                <input type="number" name="IAT2" value={formData.IAT2} onChange={handleChange} min="0" max="100" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">IAT 3 Score</label>
                                <input type="number" name="IAT3" value={formData.IAT3} onChange={handleChange} min="0" max="100" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* 2. Socio-Economic Background */}
                    <div>
                        <h3 className="text-lg font-semibold text-green-400 mb-4 border-b border-gray-700 pb-2">Socio-Economic Background</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Father's Income (Annual)</label>
                                <input type="number" name="FatherIncome" value={formData.FatherIncome} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mother's Income (Annual)</label>
                                <input type="number" name="MotherIncome" value={formData.MotherIncome} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Parent Education</label>
                                <select name="ParentEducation" value={formData.ParentEducation} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value="None">None</option>
                                    <option value="High School">High School</option>
                                    <option value="Graduate">Graduate</option>
                                    <option value="Post-Graduate">Post-Graduate</option>
                                    <option value="PhD">PhD</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Internet Access</label>
                                <select name="InternetAccess" value={formData.InternetAccess} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Part-Time Job</label>
                                <select name="PartTimeJob" value={formData.PartTimeJob} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 3. Lifestyle & Health */}
                    <div>
                        <h3 className="text-lg font-semibold text-purple-400 mb-4 border-b border-gray-700 pb-2">Lifestyle & Health</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Stress Score (0-10)</label>
                                <input type="number" name="StressScore" value={formData.StressScore} onChange={handleChange} min="0" max="10" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Sleep Hours</label>
                                <input type="number" name="SleepHours" value={formData.SleepHours} onChange={handleChange} min="0" max="24" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mental Health Index (0-10)</label>
                                <input type="number" name="MentalHealthIndex" value={formData.MentalHealthIndex} onChange={handleChange} min="0" max="10" step="0.1" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Exercise Hours/Week</label>
                                <input type="number" name="ExerciseHours" value={formData.ExerciseHours} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Screen Time (Hrs/Day)</label>
                                <input type="number" name="ScreenTime" value={formData.ScreenTime} onChange={handleChange} min="0" max="24" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Social Hours/Week</label>
                                <input type="number" name="SocialHours" value={formData.SocialHours} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* 4. Engagement */}
                    <div>
                        <h3 className="text-lg font-semibold text-yellow-400 mb-4 border-b border-gray-700 pb-2">Engagement</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Club Participation</label>
                                <select name="ClubParticipation" value={formData.ClubParticipation} onChange={handleChange} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Mentor Meetings</label>
                                <input type="number" name="MentorMeetings" value={formData.MentorMeetings} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Counseling Sessions</label>
                                <input type="number" name="CounselingSessions" value={formData.CounselingSessions} onChange={handleChange} min="0" className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateMenteeModal;
