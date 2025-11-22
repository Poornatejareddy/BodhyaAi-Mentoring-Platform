import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const UpdateMenteeModal = ({ isOpen, onClose, student, onUpdate }) => {
    const [formData, setFormData] = useState({
        CGPA: student?.riskInputs?.CGPA || '',
        Attendance: student?.riskInputs?.Attendance || '',
        Backlogs: student?.riskInputs?.Backlogs || 0,
        StudyHoursPerDay: student?.riskInputs?.StudyHoursPerDay || '',
        SleepHours: student?.riskInputs?.SleepHours || '',
        StressScore: student?.riskInputs?.StressScore || '',
        MentalHealthIndex: student?.riskInputs?.MentalHealthIndex || '',
        PhysicalActivity: student?.riskInputs?.PhysicalActivity || '',
        SocialSupport: student?.riskInputs?.SocialSupport || '',
        FamilyIncome: student?.riskInputs?.FamilyIncome || '',
        ExtracurricularParticipation: student?.riskInputs?.ExtracurricularParticipation || ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'Backlogs' ? parseInt(value) || 0 : parseFloat(value) || value
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
                        <p className="text-gray-400 text-sm mt-1">{student?.user?.name}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Academic Performance */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Academic Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    CGPA <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="CGPA"
                                    value={formData.CGPA}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Attendance (%) <span className="text-red-400">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="Attendance"
                                    value={formData.Attendance}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Backlogs
                                </label>
                                <input
                                    type="number"
                                    name="Backlogs"
                                    value={formData.Backlogs}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Study & Lifestyle */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Study & Lifestyle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Study Hours/Day
                                </label>
                                <input
                                    type="number"
                                    name="StudyHoursPerDay"
                                    value={formData.StudyHoursPerDay}
                                    onChange={handleChange}
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Sleep Hours
                                </label>
                                <input
                                    type="number"
                                    name="SleepHours"
                                    value={formData.SleepHours}
                                    onChange={handleChange}
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Physical Activity (0-10)
                                </label>
                                <input
                                    type="number"
                                    name="PhysicalActivity"
                                    value={formData.PhysicalActivity}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mental Health & Wellbeing */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Mental Health & Wellbeing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Stress Score (0-10)
                                </label>
                                <input
                                    type="number"
                                    name="StressScore"
                                    value={formData.StressScore}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Mental Health Index (0-10)
                                </label>
                                <input
                                    type="number"
                                    name="MentalHealthIndex"
                                    value={formData.MentalHealthIndex}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Social Support (0-10)
                                </label>
                                <input
                                    type="number"
                                    name="SocialSupport"
                                    value={formData.SocialSupport}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Additional Factors */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Additional Factors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Family Income (Annual)
                                </label>
                                <input
                                    type="number"
                                    name="FamilyIncome"
                                    value={formData.FamilyIncome}
                                    onChange={handleChange}
                                    min="0"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Extracurricular (0-10)
                                </label>
                                <input
                                    type="number"
                                    name="ExtracurricularParticipation"
                                    value={formData.ExtracurricularParticipation}
                                    onChange={handleChange}
                                    min="0"
                                    max="10"
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
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
