import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Brain, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const PublicSurveyPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [linkInfo, setLinkInfo] = useState(null);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [responses, setResponses] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    // BFI-44 Questions organized by trait
    const questions = [
        // Extraversion (8 items)
        { id: 1, text: 'I am the life of the party', trait: 'Extraversion' },
        { id: 6, text: 'I don\'t talk a lot', trait: 'Extraversion', reverse: true },
        { id: 11, text: 'I feel comfortable around people', trait: 'Extraversion' },
        { id: 16, text: 'I keep in the background', trait: 'Extraversion', reverse: true },
        { id: 21, text: 'I start conversations', trait: 'Extraversion' },
        { id: 26, text: 'I have little to say', trait: 'Extraversion', reverse: true },
        { id: 31, text: 'I talk to a lot of different people at parties', trait: 'Extraversion' },
        { id: 36, text: 'I don\'t like to draw attention to myself', trait: 'Extraversion', reverse: true },

        // Agreeableness (9 items)  
        { id: 2, text: 'I sympathize with others\' feelings', trait: 'Agreeableness' },
        { id: 7, text: 'I am not interested in other people\'s problems', trait: 'Agreeableness', reverse: true },
        { id: 12, text: 'I feel others\' emotions', trait: 'Agreeableness' },
        { id: 17, text: 'I am not really interested in others', trait: 'Agreeableness', reverse: true },
        { id: 22, text: 'I make people feel at ease', trait: 'Agreeableness' },
        { id: 27, text: 'I insult people', trait: 'Agreeableness', reverse: true },
        { id: 32, text: 'I have a soft heart', trait: 'Agreeableness' },
        { id: 37, text: 'I am not interested in others', trait: 'Agreeableness', reverse: true },
        { id: 42, text: 'I take time out for others', trait: 'Agreeableness' },

        // Conscientiousness (9 items)
        { id: 3, text: 'I get chores done right away', trait: 'Conscientiousness' },
        { id: 8, text: 'I often forget to put things back in their proper place', trait: 'Conscientiousness', reverse: true },
        { id: 13, text: 'I like order', trait: 'Conscientiousness' },
        { id: 18, text: 'I make a mess of things', trait: 'Conscientiousness', reverse: true },
        { id: 23, text: 'I follow a schedule', trait: 'Conscientiousness' },
        { id: 28, text: 'I shirk my duties', trait: 'Conscientiousness', reverse: true },
        { id: 33, text: 'I am always prepared', trait: 'Conscientiousness' },
        { id: 38, text: 'I leave my belongings around', trait: 'Conscientiousness', reverse: true },
        { id: 43, text: 'I pay attention to details', trait: 'Conscientiousness' },

        // Neuroticism (8 items)
        { id: 4, text: 'I get stressed out easily', trait: 'Neuroticism' },
        { id: 9, text: 'I am relaxed most of the time', trait: 'Neuroticism', reverse: true },
        { id: 14, text: 'I worry about things', trait: 'Neuroticism' },
        { id: 19, text: 'I seldom feel blue', trait: 'Neuroticism', reverse: true },
        { id: 24, text: 'I am easily disturbed', trait: 'Neuroticism' },
        { id: 29, text: 'I don\'t worry about things that have already happened', trait: 'Neuroticism', reverse: true },
        { id: 34, text: 'I get upset easily', trait: 'Neuroticism' },
        { id: 39, text: 'I have frequent mood swings', trait: 'Neuroticism' },

        // Openness (10 items)
        { id: 5, text: 'I have a rich vocabulary', trait: 'Openness' },
        { id: 10, text: 'I have difficulty understanding abstract ideas', trait: 'Openness', reverse: true },
        { id: 15, text: 'I have a vivid imagination', trait: 'Openness' },
        { id: 20, text: 'I am not interested in abstract ideas', trait: 'Openness', reverse: true },
        { id: 25, text: 'I have excellent ideas', trait: 'Openness' },
        { id: 30, text: 'I do not have a good imagination', trait: 'Openness', reverse: true },
        { id: 35, text: 'I am quick to understand things', trait: 'Openness' },
        { id: 40, text: 'I have difficulty imagining things', trait: 'Openness', reverse: true },
        { id: 44, text: 'I spend time reflecting on things', trait: 'Openness' },
        { id: 45, text: 'I am full of ideas', trait: 'Openness' },

        // Additional filler items to reach 50
        { id: 41, text: 'I enjoy being part of a loud crowd', trait: 'Extraversion' },
        { id: 46, text: 'I avoid philosophical discussions', trait: 'Openness', reverse: true },
        { id: 47, text: 'I trust others', trait: 'Agreeableness' },
        { id: 48, text: 'I complete tasks successfully', trait: 'Conscientiousness' },
        { id: 49, text: 'I panic easily', trait: 'Neuroticism' },
        { id: 50, text: 'I love to help others', trait: 'Agreeableness' },
    ];

    const questionsPerPage = 10;
    const totalPages = Math.ceil(questions.length / questionsPerPage);

    useEffect(() => {
        validateSurveyLink();
    }, [token]);

    const validateSurveyLink = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/personality/link/${token}`);
            const data = await response.json();

            if (data.success) {
                setLinkInfo(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to validate survey link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResponseChange = (questionId, value) => {
        setResponses(prev => ({
            ...prev,
            [`Q${questionId}`]: parseInt(value)
        }));
    };

    const getCurrentPageQuestions = () => {
        const startIdx = currentPage * questionsPerPage;
        const endIdx = startIdx + questionsPerPage;
        return questions.slice(startIdx, endIdx);
    };

    const getProgressPercentage = () => {
        return (Object.keys(responses).length / questions.length) * 100;
    };

    const canProceedToNext = () => {
        const currentQuestions = getCurrentPageQuestions();
        return currentQuestions.every(q => responses[`Q${q.id}`]);
    };

    const canSubmit = () => {
        return Object.keys(responses).length === questions.length;
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePrevious = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        if (!canSubmit()) return;

        setSubmitting(true);
        try {
            const response = await fetch(`http://localhost:5000/api/personality/link/${token}/submit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(responses),
            });

            const data = await response.json();

            if (data.success) {
                setResults(data.data);
                setSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to submit survey. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-spin" />
                    <p className="text-white text-lg">Validating survey link...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-800 rounded-xl p-8 border border-red-600 text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">Invalid Survey Link</h2>
                    <p className="text-gray-300">{error}</p>
                </div>
            </div>
        );
    }

    if (submitted && results) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-8 text-white mb-8 text-center">
                        <CheckCircle className="w-20 h-20 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold mb-3">Survey Completed!</h1>
                        <p className="text-lg">Thank you for completing the personality assessment.</p>
                        <p className="text-emerald-100 mt-2">Your mentor can now view your results.</p>
                    </div>

                    {/* Personality Scores */}
                    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                            <Brain className="w-6 h-6 text-purple-400" />
                            Your Personality Profile (OCEAN)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                            {Object.entries(results.oceanScores).map(([trait, score]) => (
                                <div key={trait} className="bg-gray-700/50 rounded-lg p-4 text-center">
                                    <h3 className="text-sm font-medium text-gray-400 mb-2">{trait}</h3>
                                    <div className="text-3xl font-bold text-purple-400">
                                        {Math.round(score * 100)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">out of 100</div>
                                </div>
                            ))}
                        </div>

                        {/* Insights */}
                        {results.insights && results.insights.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold text-white mb-3">Key Insights:</h3>
                                {results.insights.map((insight, idx) => (
                                    <div key={idx} className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3 text-gray-300">
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6 text-center">
                        <h3 className="text-xl font-semibold text-white mb-2">What's Next?</h3>
                        <p className="text-gray-300">
                            Your mentor (<span className="font-semibold text-blue-400">{linkInfo.mentorName}</span>)
                            will review your personality profile and use these insights to provide personalized guidance
                            and support tailored to your learning style and strengths.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Personality Assessment (BFI-44)</h1>
                            <p className="text-purple-100 mt-1">Discover your unique personality traits</p>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4 space-y-2">
                        <p className="text-sm"><span className="font-semibold">Student:</span> {linkInfo.studentName} ({linkInfo.usn})</p>
                        <p className="text-sm"><span className="font-semibold">Department:</span> {linkInfo.department}</p>
                        <p className="text-sm"><span className="font-semibold">Mentor:</span> {linkInfo.mentorName}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">Progress</span>
                        <span className="text-purple-400 font-semibold">{Math.round(getProgressPercentage())}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage()}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <span>{Object.keys(responses).length} / {questions.length} answered</span>
                    </div>
                </div>

                {/* Questions */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white mb-2">
                            Rate how much you agree with each statement
                        </h2>
                        <p className="text-gray-400 text-sm">1 = Strongly Disagree, 5 = Strongly Agree</p>
                    </div>

                    <div className="space-y-6">
                        {getCurrentPageQuestions().map((question) => (
                            <div key={question.id} className="bg-gray-700/30 rounded-lg p-4">
                                <p className="text-white mb-4 font-medium">
                                    {question.id}. {question.text}
                                </p>
                                <div className="flex gap-2 justify-between items-center">
                                    <span className="text-xs text-gray-400 w-24">Strongly Disagree</span>
                                    <div className="flex gap-3 flex-1 justify-center">
                                        {[1, 2, 3, 4, 5].map((value) => (
                                            <label key={value} className="cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`Q${question.id}`}
                                                    value={value}
                                                    checked={responses[`Q${question.id}`] === value}
                                                    onChange={() => handleResponseChange(question.id, value)}
                                                    className="hidden peer"
                                                />
                                                <div className="w-12 h-12 rounded-lg border-2 border-gray-600 flex items-center justify-center font-semibold text-lg transition-all
                                                    peer-checked:border-purple-500 peer-checked:bg-purple-500 peer-checked:text-white
                                                    hover:border-purple-400 text-gray-400 peer-checked:scale-110">
                                                    {value}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400 w-24 text-right">Strongly Agree</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4">
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 0}
                        className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Previous
                    </button>

                    {currentPage < totalPages - 1 ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceedToNext()}
                            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit() || submitting}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Submit Survey
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicSurveyPage;
