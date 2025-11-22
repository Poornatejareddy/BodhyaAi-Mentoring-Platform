import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Reusable Stat Card Component with gradient background
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.icon - Icon component
 * @param {string} props.gradient - Gradient class (from-color to-color)
 * @param {number} props.trend - Trend percentage (positive/negative)
 * @param {string} props.className - Additional classes
 */
const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    gradient = 'from-blue-600 to-purple-600',
    trend,
    className = '',
}) => {
    const getTrendIcon = () => {
        if (!trend) return null;
        if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-400" />;
        if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
        return <Minus className="w-4 h-4 text-gray-400" />;
    };

    const getTrendColor = () => {
        if (!trend) return '';
        if (trend > 0) return 'text-green-400';
        if (trend < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ${className}`}
        >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />

            {/* Icon */}
            {Icon && (
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <Icon className="w-6 h-6 text-white" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                <p className="text-white/80 text-sm font-medium mb-2">{title}</p>
                <h3 className="text-white text-4xl font-bold mb-1">{value}</h3>

                {/* Trend or Subtitle */}
                {trend !== undefined ? (
                    <div className="flex items-center gap-2 mt-2">
                        {getTrendIcon()}
                        <span className={`text-sm font-medium ${getTrendColor()}`}>
                            {trend > 0 && '+'}
                            {trend}%
                        </span>
                        {subtitle && <span className="text-white/70 text-xs">vs last month</span>}
                    </div>
                ) : subtitle ? (
                    <p className="text-white/70 text-sm">{subtitle}</p>
                ) : null}
            </div>
        </div>
    );
};

export default StatCard;
