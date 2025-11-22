import React from 'react';
import { ResponsiveContainer } from 'recharts';

/**
 * Reusable Chart Container Component
 * Provides consistent styling and responsive behavior for all charts
 */
const ChartContainer = ({
    children,
    height = 300,
    className = '',
    title,
    subtitle
}) => {
    return (
        <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                    {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {children}
            </ResponsiveContainer>
        </div>
    );
};

export default ChartContainer;
