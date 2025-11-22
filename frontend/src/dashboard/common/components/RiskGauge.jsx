import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Risk Gauge Component - Visual circular gauge for risk level
 * @param {Object} props
 * @param {string} props.risk - Risk level: 'HIGH', 'MEDIUM', 'LOW'
 * @param {number} props.confidence - Confidence score (0-1)
 * @param {string} props.className - Additional classes
 */
const RiskGauge = ({ risk = 'MEDIUM', confidence = 0.8, className = '' }) => {
    // Map risk to score (0-100)
    const riskScores = {
        'HIGH': 85,
        'MEDIUM': 50,
        'LOW': 15
    };

    const score = riskScores[risk] || 50;

    // Color mapping
    const riskColors = {
        'HIGH': '#ef4444',
        'MEDIUM': '#f59e0b',
        'LOW': '#10b981'
    };

    const color = riskColors[risk] || riskColors.MEDIUM;

    // Data for gauge (pie chart)
    const data = [
        { name: 'Risk', value: score },
        { name: 'Safe', value: 100 - score }
    ];

    const COLORS = [color, '#1e293b'];

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Gauge Chart */}
            <div className="relative w-64 h-32">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={0}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-start pt-12">
                    <AlertTriangle className="w-8 h-8 mb-2" style={{ color }} />
                    <p className="text-4xl font-bold" style={{ color }}>
                        {score}
                    </p>
                    <p className="text-sm text-gray-400">Risk Score</p>
                </div>
            </div>

            {/* Risk Level Label */}
            <div className="mt-4 text-center">
                <p className="text-2xl font-bold" style={{ color }}>
                    {risk === 'HIGH' ? 'High Risk' : risk === 'MEDIUM' ? 'Medium Risk' : 'Low Risk'}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                    Confidence: {(confidence * 100).toFixed(1)}%
                </p>
            </div>
        </div>
    );
};

export default RiskGauge;
