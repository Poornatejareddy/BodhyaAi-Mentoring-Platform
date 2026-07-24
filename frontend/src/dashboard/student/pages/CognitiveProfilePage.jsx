import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, TrendingUp, Lightbulb, Target, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';

const CognitiveProfilePage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cognitiveData, setCognitiveData] = useState(null);

    useEffect(() => {
        fetchCognitiveProfile();
    }, []);

    const fetchCognitiveProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/students/my-profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success && data.data.personalityProfile && data.data.personalityProfile.predictions) {
                const profile = data.data.personalityProfile;
                setCognitiveData({
                    bigFive: {
                        openness: profile.predictions.Openness,
                        conscientiousness: profile.predictions.Conscientiousness,
                        extraversion: profile.predictions.Extraversion,
                        agreeableness: profile.predictions.Agreeableness,
                        neuroticism: profile.predictions.Neuroticism
                    },
                    learningStyle: profile.learningStyle || { visual: 50, auditory: 50, kinesthetic: 50 },
                    strengths: profile.strengths || [],
                    growthAreas: profile.growthAreas || [],
                    careerSuggestions: profile.careerSuggestions || []
                });
            } else {
                // Generate mock data for demo
                setCognitiveData(generateMockProfile());
            }
        } catch (error) {
            console.error('Error fetching cognitive profile:', error);
            setCognitiveData(generateMockProfile());
        } finally {
            setLoading(false);
        }
    };

    const generateMockProfile = () => ({
        bigFive: {
            openness: 75,
            conscientiousness: 65,
            extraversion: 55,
            agreeableness: 70,
            neuroticism: 45
        },
        learningStyle: {
            visual: 80,
            auditory: 60,
            kinesthetic: 50
        },
        strengths: [
            'Creative problem solving',
            'Strong analytical skills',
            'Good team collaboration',
            'Attention to detail'
        ],
        growthAreas: [
            'Time management',
            'Public speaking',
            'Stress management'
        ],
        careerSuggestions: [
            { title: 'Software Engineer', compatibility: 85 },
            { title: 'Data Scientist', compatibility: 80 },
            { title: 'UX Designer', compatibility: 75 }
        ]
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
                    <p className="text-[var(--ink)]">Loading your personality profile...</p>
                </div>
            </div>
        );
    }

    if (!cognitiveData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-[var(--surface)] border border-[var(--warning)] rounded-xl p-8 text-center">
                    <Brain className="w-16 h-16 text-[var(--warning)] mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-[var(--ink)] mb-3">Profile Not Available</h3>
                    <p className="text-[var(--ink)]">Complete the personality assessment to view your cognitive profile.</p>
                </div>
            </div>
        );
    }

    // Prepare radar chart data
    const radarData = [
        { trait: 'Openness', value: cognitiveData.bigFive.openness },
        { trait: 'Conscientiousness', value: cognitiveData.bigFive.conscientiousness },
        { trait: 'Extraversion', value: cognitiveData.bigFive.extraversion },
        { trait: 'Agreeableness', value: cognitiveData.bigFive.agreeableness },
        { trait: 'Neuroticism', value: 100 - cognitiveData.bigFive.neuroticism } // Inverted for better visualization
    ];

    const getTraitColor = (value) => {
        if (value >= 70) return 'text-[var(--success)]';
        if (value >= 50) return 'text-[var(--warning)]';
        return 'text-[var(--warning)]';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="bg-[var(--surface)]    rounded-xl p-8 text-[var(--ink)]">
                <div className="flex items-center gap-4">
                    <div className="bg-[var(--surface)] p-4 rounded-lg backdrop-blur-sm">
                        <Brain className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Your Cognitive Profile</h1>
                        <p className="text-[var(--brand)] mt-2 text-lg">Discover your personality traits and learning style</p>
                    </div>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-[var(--surface)] rounded-xl p-8 border border-[var(--line)]">
                <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-[var(--brand)]" />
                    Big Five Personality Traits
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="var(--chart-grid)" />
                        <PolarAngleAxis dataKey="trait" stroke="var(--chart-text)" />
                        <PolarRadiusAxis domain={[0, 100]} stroke="var(--chart-text)" />
                        <Radar
                            name="Your Profile"
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

            {/* Trait Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(cognitiveData.bigFive).map(([trait, value]) => (
                    <div key={trait} className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
                        <h3 className="text-sm text-[var(--ink)] mb-2 capitalize">{trait}</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-3xl font-bold ${getTraitColor(value)}`}>{Math.round(value)}</span>
                                <span className="text-xs text-[var(--ink)]">/ 100</span>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-[var(--surface)]">
                                <div
                                    style={{ width: `${value}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-[var(--ink)] justify-center ${value >= 70 ? 'bg-[var(--success-muted)]' : value >= 50 ? 'bg-[var(--warning-muted)]' : 'bg-[var(--warning-muted)]'
                                        }`}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Learning Style */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
                <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[var(--brand)]" />
                    Learning Style Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(cognitiveData.learningStyle).map(([style, value]) => (
                        <div key={style} className="bg-[var(--surface)] rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-[var(--ink)] mb-3 capitalize">{style} Learner</h3>
                            <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold text-[var(--brand)]">{value}%</span>
                                </div>
                                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-[var(--surface)]">
                                    <div
                                        style={{ width: `${value}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-[var(--ink)] justify-center bg-[var(--surface)]  "
                                    ></div>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--ink)] mt-3">
                                {style === 'visual' && 'Learn best through diagrams and visuals'}
                                {style === 'auditory' && 'Learn best through listening and discussion'}
                                {style === 'kinesthetic' && 'Learn best through hands-on practice'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Strengths and Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
                    <h2 className="text-xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--success)]" />
                        Your Strengths
                    </h2>
                    <ul className="space-y-3">
                        {cognitiveData.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-[var(--success-muted)] rounded-lg border border-[var(--success)]">
                                <div className="w-2 h-2 rounded-full bg-[var(--success-muted)] mt-1.5"></div>
                                <span className="text-[var(--ink)]">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Growth Areas */}
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
                    <h2 className="text-xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-[var(--warning)]" />
                        Growth Opportunities
                    </h2>
                    <ul className="space-y-3">
                        {cognitiveData.growthAreas.map((area, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-[var(--warning-muted)] rounded-lg border border-[var(--warning)]">
                                <div className="w-2 h-2 rounded-full bg-[var(--warning-muted)] mt-1.5"></div>
                                <span className="text-[var(--ink)]">{area}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Career Suggestions */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
                <h2 className="text-2xl font-semibold text-[var(--ink)] mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[var(--brand)]" />
                    Career Path Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cognitiveData.careerSuggestions.map((career, i) => (
                        <div key={i} className="bg-[var(--surface)]   rounded-lg p-5 border border-[var(--brand)]">
                            <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">{career.title}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 bg-[var(--surface)] rounded-full h-2">
                                    <div
                                        className="bg-[var(--surface)]   h-2 rounded-full"
                                        style={{ width: `${career.compatibility}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-[var(--brand)]">{career.compatibility}%</span>
                            </div>
                            <p className="text-xs text-[var(--ink)]">Compatibility Match</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CognitiveProfilePage;
