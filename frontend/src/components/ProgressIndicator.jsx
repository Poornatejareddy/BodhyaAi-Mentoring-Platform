import React from 'react';
import { TrendingUp, Target, Award, ArrowUpRight } from 'lucide-react';

const ProgressIndicator = ({ level, size = 'md', showIcon = true, showLabel = true }) => {
    // Growth Mindset Configuration
    const config = {
        HIGH: {
            label: 'Focus Required',
            subLabel: 'Let\'s boost this!',
            color: 'text-orange-600',
            bg: 'bg-orange-100',
            border: 'border-orange-200',
            icon: Target,
            gradient: 'from-orange-500 to-red-500',
            message: "You have great potential. Let's focus on key areas to unlock it."
        },
        MEDIUM: {
            label: 'Room for Growth',
            subLabel: 'Making progress',
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-200',
            icon: TrendingUp,
            gradient: 'from-blue-500 to-cyan-500',
            message: "You're doing well! A little more consistency will take you far."
        },
        LOW: {
            label: 'On Track',
            subLabel: 'Keep it up!',
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            border: 'border-emerald-200',
            icon: Award,
            gradient: 'from-emerald-500 to-green-500',
            message: "Excellent work! You're mastering your academic journey."
        },
        UNKNOWN: {
            label: 'Calculating...',
            subLabel: 'Gathering data',
            color: 'text-gray-600',
            bg: 'bg-gray-100',
            border: 'border-gray-200',
            icon: ArrowUpRight,
            gradient: 'from-gray-500 to-gray-600',
            message: "We're analyzing your data to provide personalized insights."
        }
    };

    const status = config[level?.toUpperCase()] || config.UNKNOWN;
    const Icon = status.icon;

    // Size variants
    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    if (size === 'card') {
        return (
            <div className={`rounded-xl border ${status.border} bg-white overflow-hidden shadow-sm`}>
                <div className={`h-2 w-full bg-gradient-to-r ${status.gradient}`} />
                <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <h3 className={`font-bold text-lg ${status.color}`}>{status.label}</h3>
                            <p className="text-gray-500 text-sm">{status.subLabel}</p>
                        </div>
                        <div className={`p-2 rounded-full ${status.bg}`}>
                            <Icon className={`w-5 h-5 ${status.color}`} />
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                        {status.message}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${status.bg} ${status.color} ${status.border} ${sizes[size]}`}>
            {showIcon && <Icon className="w-4 h-4" />}
            {showLabel && status.label}
        </span>
    );
};

export default ProgressIndicator;
