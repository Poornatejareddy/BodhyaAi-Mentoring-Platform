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
        <div className={`bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && <h3 className="text-lg font-semibold text-[var(--ink)]">{title}</h3>}
                    {subtitle && <p className="text-sm text-[var(--ink)] mt-1">{subtitle}</p>}
                </div>
            )}
            <ResponsiveContainer width="100%" height={height}>
                {children}
            </ResponsiveContainer>
        </div>
    );
};

export default ChartContainer;
