import React, { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, TrendingUp, Lightbulb, Target, BookOpen, Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const CognitiveProfilePage = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cognitiveData, setCognitiveData] = useState(null);

    useEffect(() => {
        fetchCognitiveProfile();
    }, []);

    const fetchCognitiveProfile = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/students/my-profile', {
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
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading your personality profile...</p>
                </div>
            </div>
        );
    }

    if (!cognitiveData) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-gray-800 border border-yellow-600 rounded-xl p-8 text-center">
                    <Brain className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-3">Profile Not Available</h3>
                    <p className="text-gray-300">Complete the personality assessment to view your cognitive profile.</p>
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
        if (value >= 70) return 'text-green-400';
        if (value >= 50) return 'text-yellow-400';
        return 'text-orange-400';
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl p-8 text-white">
                <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-lg backdrop-blur-sm">
                        <Brain className="w-10 h-10" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">Your Cognitive Profile</h1>
                        <p className="text-purple-100 mt-2 text-lg">Discover your personality traits and learning style</p>
                    </div>
                </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Target className="w-6 h-6 text-purple-400" />
                    Big Five Personality Traits
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="trait" stroke="#9ca3af" />
                        <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" />
                        <Radar
                            name="Your Profile"
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

            {/* Trait Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(cognitiveData.bigFive).map(([trait, value]) => (
                    <div key={trait} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <h3 className="text-sm text-gray-400 mb-2 capitalize">{trait}</h3>
                        <div className="relative pt-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-3xl font-bold ${getTraitColor(value)}`}>{Math.round(value)}</span>
                                <span className="text-xs text-gray-500">/ 100</span>
                            </div>
                            <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-700">
                                <div
                                    style={{ width: `${value}%` }}
                                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                                        }`}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Learning Style */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    Learning Style Preferences
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(cognitiveData.learningStyle).map(([style, value]) => (
                        <div key={style} className="bg-gray-700/30 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-white mb-3 capitalize">{style} Learner</h3>
                            <div className="relative pt-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-2xl font-bold text-blue-400">{value}%</span>
                                </div>
                                <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-700">
                                    <div
                                        style={{ width: `${value}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-500"
                                    ></div>
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-3">
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
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Your Strengths
                    </h2>
                    <ul className="space-y-3">
                        {cognitiveData.strengths.map((strength, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-green-900/20 rounded-lg border border-green-700/50">
                                <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5"></div>
                                <span className="text-gray-300">{strength}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Growth Areas */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Growth Opportunities
                    </h2>
                    <ul className="space-y-3">
                        {cognitiveData.growthAreas.map((area, i) => (
                            <li key={i} className="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5"></div>
                                <span className="text-gray-300">{area}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Career Suggestions */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-400" />
                    Career Path Recommendations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cognitiveData.careerSuggestions.map((career, i) => (
                        <div key={i} className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-5 border border-purple-700/50">
                            <h3 className="text-lg font-semibold text-white mb-2">{career.title}</h3>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex-1 bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                        style={{ width: `${career.compatibility}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-medium text-purple-400">{career.compatibility}%</span>
                            </div>
                            <p className="text-xs text-gray-400">Compatibility Match</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CognitiveProfilePage;
