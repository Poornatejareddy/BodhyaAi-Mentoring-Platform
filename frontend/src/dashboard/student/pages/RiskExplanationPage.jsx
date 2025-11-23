import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Brain, AlertCircle, Lightbulb, Target, Sparkles, Clock, MessageCircle, TrendingUp, CheckCircle } from 'lucide-react';
import FeatureImpactChart from '../../common/components/FeatureImpactChart';
import ProgressIndicator from '../../../components/ProgressIndicator';

const RiskExplanationPage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);
    const [riskData, setRiskData] = useState(null);
    const [explanation, setExplanation] = useState(null);
    const [student, setStudent] = useState(null);

    const fetchRiskExplanation = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/students/my-profile', {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();

            if (data.success) {
                setStudent(data.data);
                setRiskData(data.data.academicRisk);

                if (data.data.academicRisk?.insights) {
                    setExplanation({
                        insights: data.data.academicRisk.insights || [],
                        recommendations: data.data.academicRisk.recommendations || [],
                        shapValues: generateShapValues(data.data)
                    });
                } else {
                    setExplanation(generateMockExplanation(data.data));
                }
            }
        } catch (error) {
            console.error('Error fetching risk explanation:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateShapValues = (student) => {
        const riskInputs = student.riskInputs || {};
        return {
            CGPA: riskInputs.CGPA > 7.0 ? -0.15 : 0.25,
            Attendance: riskInputs.Attendance > 85 ? -0.20 : 0.30,
            Backlogs: riskInputs.Backlogs > 0 ? 0.35 : -0.05,
            StudyHoursPerDay: riskInputs.StudyHoursPerDay >= 4 ? -0.10 : 0.15,
            StressScore: riskInputs.StressScore > 7 ? 0.20 : -0.05,
        };
    };

    const generateMockExplanation = (student) => {
        const riskInputs = student.riskInputs || {};
        const cgpa = riskInputs.CGPA || 0;
        const attendance = riskInputs.Attendance || 0;
        const backlogs = riskInputs.Backlogs || 0;

        const shapValues = generateShapValues(student);
        const insights = [];
        const recommendations = [];

        if (cgpa < 6.0) {
            insights.push(`Your CGPA (${cgpa.toFixed(2)}) indicates room for improvement`);
            recommendations.push({
                priority: 'HIGH',
                action: 'Boost Academic Performance',
                target: 'Aim for CGPA above 6.5',
                impact: 'Significant growth potential',
            });
        }

        if (attendance < 75) {
            insights.push(`Attendance (${attendance}%) is a key focus area`);
            recommendations.push({
                priority: 'URGENT',
                action: 'Improve Attendance',
                target: 'Maintain 85%+ attendance',
                impact: 'Critical for success',
            });
        }

        if (backlogs > 0) {
            insights.push(`You have ${backlogs} subject(s) to clear`);
            recommendations.push({
                priority: 'URGENT',
                action: 'Clear Backlogs',
                target: 'Clear pending subjects this semester',
                impact: 'Essential step forward',
            });
        }

        return { shapValues, insights, recommendations };
    };

    React.useEffect(() => {
        fetchRiskExplanation();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Analyzing your potential...</p>
                </div>
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-800 border border-blue-600 rounded-xl p-8 text-center">
                    <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-3">Analysis Pending</h3>
                    <p className="text-gray-300">
                        We are gathering data to generate your growth analysis. Please check back soon.
                    </p>
                </div>
            </div>
        );
    }

    const featureData = explanation?.shapValues ? Object.entries(explanation.shapValues).map(([name, impact]) => ({
        name,
        impact,
        value: student?.riskInputs?.[name] || 'N/A'
    })) : [];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-8 text-white shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Growth Potential Analysis</h1>
                        <p className="text-blue-100 mt-2">AI-powered insights to help you succeed</p>
                    </div>
                </div>
            </div>

            {/* Main Status Card */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-white mb-4">Current Status</h2>
                        <ProgressIndicator
                            level={riskData.prediction}
                            size="card"
                        />
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex flex-col gap-3 min-w-[250px]">
                        {riskData.prediction === 'HIGH' && (
                            <>
                                <button className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Connect with Mentor
                                </button>
                                <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    View Study Resources
                                </button>
                            </>
                        )}
                        {riskData.prediction === 'MEDIUM' && (
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                <Target className="w-5 h-5" />
                                Update Study Plan
                            </button>
                        )}
                        {riskData.prediction === 'LOW' && (
                            <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Explore Advanced Topics
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {featureData.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-400" />
                        Strengths & Areas for Improvement
                    </h2>
                    <FeatureImpactChart features={featureData} />
                </div>
            )}

            {/* Insights & Focus Areas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {explanation && explanation.insights.length > 0 && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                            Key Observations
                        </h2>
                        <div className="space-y-3">
                            {explanation.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-800/50">
                                    <div className="mt-0.5">
                                        <CheckCircle className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {riskData.warnings && riskData.warnings.length > 0 && (
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-orange-400" />
                            Focus Areas
                        </h2>
                        <div className="space-y-3">
                            {riskData.warnings.map((warning, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-orange-900/20 rounded-lg border border-orange-800/50">
                                    <div className="mt-0.5">
                                        <Target className="w-5 h-5 text-orange-400" />
                                    </div>
                                    <p className="text-sm text-gray-300">{warning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Plan */}
            {explanation && explanation.recommendations.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        Your Action Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {explanation.recommendations.map((rec, i) => (
                            <div
                                key={i}
                                className={`p-5 rounded-xl border-l-4 ${rec.priority === 'URGENT' ? 'bg-orange-900/20 border-orange-500' :
                                    rec.priority === 'HIGH' ? 'bg-blue-900/20 border-blue-500' :
                                        'bg-green-900/20 border-green-500'
                                    }`}
                            >
                                <div className="flex justify-between mb-3">
                                    <h3 className="font-semibold text-white">{rec.action}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${rec.priority === 'URGENT' ? 'bg-orange-500/20 text-orange-300' :
                                        rec.priority === 'HIGH' ? 'bg-blue-500/20 text-blue-300' : 'bg-green-500/20 text-green-300'
                                        }`}>
                                        {rec.priority === 'URGENT' ? 'High Priority' : rec.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-300 mb-2">
                                    <strong>Goal:</strong> {rec.target}
                                </p>
                                <p className="text-sm text-gray-400">
                                    <strong>Potential Impact:</strong> {rec.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {riskData.model && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-400 text-center">
                        Powered by <span className="font-mono text-purple-400">{riskData.model}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RiskExplanationPage;
