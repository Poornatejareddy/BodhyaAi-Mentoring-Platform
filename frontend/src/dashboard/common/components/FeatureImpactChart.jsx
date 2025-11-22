import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Feature Impact Bar Chart - SHAP-style horizontal bars
 * Shows positive and negative feature impacts on risk prediction
 * @param {Array} features - Array of {name, impact, value} objects
 */
const FeatureImpactChart = ({ features = [] }) => {
    // Sort by absolute impact
    const sortedFeatures = [...features].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    // Prepare data for chart
    const chartData = sortedFeatures.map(f => ({
        name: f.name,
        impact: f.impact,
        value: f.value
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-semibold">{data.name}</p>
                    <p className="text-sm text-gray-300">Current Value: {data.value}</p>
                    <p className={`text-sm ${data.impact > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        Impact: {data.impact > 0 ? '+' : ''}{data.impact.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        {data.impact > 0 ? 'Increases Risk' : 'Decreases Risk'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Feature Impact Analysis</h3>
            <p className="text-sm text-gray-400 mb-6">
                How each factor affects the risk prediction
            </p>

            <ResponsiveContainer width="100%" height={features.length * 60 + 50}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis type="category" dataKey="name" stroke="#9ca3af" width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.impact > 0 ? '#ef4444' : '#10b981'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-300">Increases Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-300">Decreases Risk</span>
                </div>
            </div>
        </div>
    );
};

export default FeatureImpactChart;
