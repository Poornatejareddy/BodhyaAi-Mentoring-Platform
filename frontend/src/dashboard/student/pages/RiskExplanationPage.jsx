import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
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
            const response = await fetch(`${API_BASE_URL}/students/my-profile`, {
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
                    <p className="text-[var(--ink)]">Analyzing your potential...</p>
                </div>
            </div>
        );
    }

    if (!riskData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-[var(--surface)] border border-[var(--brand)] rounded-xl p-8 text-center">
                    <Sparkles className="w-16 h-16 text-[var(--brand)] mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-[var(--ink)] mb-3">Analysis Pending</h3>
                    <p className="text-[var(--ink)]">
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
            <div className="bg-[var(--surface)]    rounded-xl p-8 text-[var(--ink)] shadow-2xl">
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface)] p-4 rounded-lg backdrop-blur-sm">
                        <TrendingUp className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Growth Potential Analysis</h1>
                        <p className="text-[var(--brand)] mt-2">AI-powered insights to help you succeed</p>
                    </div>
                </div>
            </div>

            {/* Main Status Card */}
            <div className="bg-[var(--surface)] rounded-xl p-8 border border-[var(--line)] shadow-xl">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1">
                        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">Current Status</h2>
                        <ProgressIndicator
                            level={riskData.prediction}
                            size="card"
                        />
                    </div>

                    {/* Action Buttons based on status */}
                    <div className="flex flex-col gap-3 min-w-[250px]">
                        {riskData.prediction === 'HIGH' && (
                            <>
                                <button className="px-6 py-3 bg-[var(--warning-muted)] hover:bg-[var(--warning-muted)] text-[var(--ink)] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    Connect with Mentor
                                </button>
                                <button className="px-6 py-3 bg-[var(--surface)] hover:bg-[var(--surface)] text-[var(--ink)] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    View Study Resources
                                </button>
                            </>
                        )}
                        {riskData.prediction === 'MEDIUM' && (
                            <button className="px-6 py-3 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                <Target className="w-5 h-5" />
                                Update Study Plan
                            </button>
                        )}
                        {riskData.prediction === 'LOW' && (
                            <button className="px-6 py-3 bg-[var(--success-muted)] hover:bg-[var(--success-muted)] text-[var(--ink)] rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                Explore Advanced Topics
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {featureData.length > 0 && (
                <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6">
                    <h2 className="text-xl font-bold text-[var(--ink)] mb-6 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-[var(--brand)]" />
                        Strengths & Areas for Improvement
                    </h2>
                    <FeatureImpactChart features={featureData} />
                </div>
            )}

            {/* Insights & Focus Areas Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {explanation && explanation.insights.length > 0 && (
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6">
                        <h2 className="text-xl font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                            <Lightbulb className="w-6 h-6 text-[var(--warning)]" />
                            Key Observations
                        </h2>
                        <div className="space-y-3">
                            {explanation.insights.map((insight, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-[var(--brand)] rounded-lg border border-[var(--brand)]">
                                    <div className="mt-0.5">
                                        <CheckCircle className="w-5 h-5 text-[var(--brand)]" />
                                    </div>
                                    <p className="text-sm text-[var(--ink)]">{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {riskData.warnings && riskData.warnings.length > 0 && (
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6">
                        <h2 className="text-xl font-bold text-[var(--ink)] mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-[var(--warning)]" />
                            Focus Areas
                        </h2>
                        <div className="space-y-3">
                            {riskData.warnings.map((warning, i) => (
                                <div key={i} className="flex gap-3 p-4 bg-[var(--warning-muted)] rounded-lg border border-[var(--warning)]">
                                    <div className="mt-0.5">
                                        <Target className="w-5 h-5 text-[var(--warning)]" />
                                    </div>
                                    <p className="text-sm text-[var(--ink)]">{warning}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Action Plan */}
            {explanation && explanation.recommendations.length > 0 && (
                <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] p-6">
                    <h2 className="text-2xl font-bold text-[var(--ink)] mb-6 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-[var(--success)]" />
                        Your Action Plan
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {explanation.recommendations.map((rec, i) => (
                            <div
                                key={i}
                                className={`p-5 rounded-xl border-l-4 ${rec.priority === 'URGENT' ? 'bg-[var(--warning-muted)] border-[var(--warning)]' :
                                    rec.priority === 'HIGH' ? 'bg-[var(--brand)] border-[var(--brand)]' :
                                        'bg-[var(--success-muted)] border-[var(--success)]'
                                    }`}
                            >
                                <div className="flex justify-between mb-3">
                                    <h3 className="font-semibold text-[var(--ink)]">{rec.action}</h3>
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${rec.priority === 'URGENT' ? 'bg-[var(--warning-muted)] text-[var(--warning)]' :
                                        rec.priority === 'HIGH' ? 'bg-[var(--brand)] text-[var(--brand)]' : 'bg-[var(--success-muted)] text-[var(--success)]'
                                        }`}>
                                        {rec.priority === 'URGENT' ? 'High Priority' : rec.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--ink)] mb-2">
                                    <strong>Goal:</strong> {rec.target}
                                </p>
                                <p className="text-sm text-[var(--ink)]">
                                    <strong>Potential Impact:</strong> {rec.impact}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {riskData.model && (
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-4">
                    <p className="text-sm text-[var(--ink)] text-center">
                        Powered by <span className="font-mono text-[var(--brand)]">{riskData.model}</span>
                    </p>
                </div>
            )}
        </div>
    );
};

export default RiskExplanationPage;
