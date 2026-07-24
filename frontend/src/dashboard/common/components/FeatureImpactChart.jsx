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
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-lg p-3 shadow-xl">
                    <p className="text-[var(--ink)] font-semibold">{data.name}</p>
                    <p className="text-sm text-[var(--ink)]">Current Value: {data.value}</p>
                    <p className={`text-sm ${data.impact > 0 ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
                        Impact: {data.impact > 0 ? '+' : ''}{data.impact.toFixed(3)}
                    </p>
                    <p className="text-xs text-[var(--ink)] mt-1">
                        {data.impact > 0 ? 'Increases Risk' : 'Decreases Risk'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)]">
            <h3 className="text-lg font-semibold text-[var(--ink)] mb-4">Feature Impact Analysis</h3>
            <p className="text-sm text-[var(--ink)] mb-6">
                How each factor affects the risk prediction
            </p>

            <ResponsiveContainer width="100%" height={features.length * 60 + 50}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis type="number" stroke="var(--chart-text)" />
                    <YAxis type="category" dataKey="name" stroke="var(--chart-text)" width={110} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="impact" radius={[0, 8, 8, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.impact > 0 ? 'var(--danger)' : 'var(--success)'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[var(--danger-muted)] rounded"></div>
                    <span className="text-[var(--ink)]">Increases Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[var(--success-muted)] rounded"></div>
                    <span className="text-[var(--ink)]">Decreases Risk</span>
                </div>
            </div>
        </div>
    );
};

export default FeatureImpactChart;
