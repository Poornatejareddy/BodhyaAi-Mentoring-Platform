import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { BookOpen, Calendar, Target, Zap, Sparkles, Download } from 'lucide-react';

const StudyPlanGeneratorPage = () => {
    const { token, user } = useAuth();
    const [formData, setFormData] = useState({
        weakSubjects: '',
        availableHours: 20,
        targetCGPA: '',
        weeks: 8,
    });
    const [loading, setLoading] = useState(false);
    const [studyPlan, setStudyPlan] = useState(null);
    const [resources, setResources] = useState([]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/llm/study-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    targetCgpa: formData.targetCGPA ? parseFloat(formData.targetCGPA) : null,
                    weeks: parseInt(formData.weeks),
                    studyHours: parseInt(formData.availableHours)
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStudyPlan(data.study_plan);
                setResources(data.recommended_resources || []);
            } else {
                alert('Failed to generate study plan: ' + data.error);
            }
        } catch (error) {
            console.error('Error generating study plan:', error);
            alert('Error generating study plan. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">AI Study Plan Generator</h1>
                        <p className="text-blue-100 mt-1">
                            Get a personalized study roadmap powered by AI
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-600" />
                            Your Details
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current CGPA
                                </label>
                                <input
                                    type="number"
                                    name="currentCGPA"
                                    value={formData.currentCGPA}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    placeholder="e.g., 7.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weak Subjects (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    name="weakSubjects"
                                    value={formData.weakSubjects}
                                    onChange={handleChange}
                                    placeholder="e.g., Calculus, Data Structures"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Study Hours/Week: {formData.availableHours}h
                                </label>
                                <input
                                    type="range"
                                    name="availableHours"
                                    value={formData.availableHours}
                                    onChange={handleChange}
                                    min="5"
                                    max="40"
                                    step="5"
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>5h</span>
                                    <span>40h</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Target CGPA (optional)
                                </label>
                                <input
                                    type="number"
                                    name="targetCGPA"
                                    value={formData.targetCGPA}
                                    onChange={handleChange}
                                    step="0.01"
                                    min="0"
                                    max="10"
                                    placeholder="e.g., 8.5"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plan Duration: {formData.weeks} weeks
                                </label>
                                <select
                                    name="weeks"
                                    value={formData.weeks}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                                >
                                    <option value="4">4 weeks</option>
                                    <option value="8">8 weeks</option>
                                    <option value="12">12 weeks</option>
                                    <option value="16">16 weeks (1 semester)</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Generating Plan...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Generate Study Plan
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    {!studyPlan && !loading && (
                        <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                No Study Plan Yet
                            </h3>
                            <p className="text-gray-500">
                                Fill out the form and click "Generate Study Plan" to get your personalized roadmap
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">
                                Analyzing your profile and generating personalized study plan...
                            </p>
                        </div>
                    )}

                    {studyPlan && !loading && (
                        <div className="space-y-6">
                            {/* Study Plan */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                        Your Personalized Study Plan
                                    </h2>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                                        <Download className="w-4 h-4" />
                                        Export
                                    </button>
                                </div>

                                <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {studyPlan}
                                </div>
                            </div>

                            {/* Recommended Resources */}
                            {resources.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-purple-600" />
                                        Recommended Resources
                                    </h3>
                                    <div className="space-y-3">
                                        {resources.map((resource, index) => (
                                            <div
                                                key={index}
                                                className="p-4 bg-purple-50 rounded-lg border border-purple-200"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-purple-900 mb-1">
                                                            {resource.source}
                                                        </p>
                                                        <p className="text-sm text-gray-600 line-clamp-2">
                                                            {resource.content}
                                                        </p>
                                                    </div>
                                                    <span className="ml-3 px-2 py-1 bg-purple-200 text-purple-700 text-xs font-bold rounded">
                                                        {Math.round(resource.score * 100)}% match
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudyPlanGeneratorPage;
