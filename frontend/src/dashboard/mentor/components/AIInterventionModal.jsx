import React from 'react';
import { X, Sparkles, CheckCircle, BookOpen, Heart, Users } from 'lucide-react';

const AIInterventionModal = ({ isOpen, onClose, recommendations, loading, onApply }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-gray-800 p-6 border-b border-gray-700 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                        AI Recommended Interventions
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-4"></div>
                            <p className="text-gray-400">Analyzing student profile and generating recommendations...</p>
                        </div>
                    ) : recommendations ? (
                        <>
                            <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg p-4 mb-6">
                                <p className="text-gray-300 text-sm">
                                    Based on the student's risk profile (CGPA, Attendance, Behavior), here are personalized intervention strategies.
                                </p>
                            </div>

                            {/* Render the raw text for now, or parse if structured */}
                            <div className="prose prose-invert max-w-none">
                                <div className="whitespace-pre-wrap text-gray-300">
                                    {recommendations.interventions}
                                </div>
                            </div>

                            {recommendations.resources && recommendations.resources.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-white mb-3">Suggested Resources</h3>
                                    <ul className="space-y-2">
                                        {recommendations.resources.map((res, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-blue-400">
                                                <BookOpen className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <a href={res.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                    {res.title || res}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            No recommendations generated yet.
                        </div>
                    )}
                </div>

                <div className="sticky bottom-0 bg-gray-800 p-6 border-t border-gray-700 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onApply}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Apply to Action Plan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIInterventionModal;
