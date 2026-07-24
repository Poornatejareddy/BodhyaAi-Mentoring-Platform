import React from 'react';
import { TrendingUp, Target, Award, ArrowUpRight } from 'lucide-react';

const ProgressIndicator = ({ level, size = 'md', showIcon = true, showLabel = true }) => {
    // Growth Mindset Configuration using soft transparent alphas and variables
    const config = {
        HIGH: {
            label: 'Focus Required',
            subLabel: 'Let\'s boost this!',
            color: 'text-[var(--warning)]',
            bg: 'var-warning',
            border: 'var-warning',
            icon: Target,
            gradient: '',
            message: "You have great potential. Let's focus on key areas to unlock it."
        },
        MEDIUM: {
            label: 'Room for Growth',
            subLabel: 'Making progress',
            color: 'text-[var(--brand)]',
            bg: 'bg-[var(--brand)]',
            border: 'border-[var(--brand)]',
            icon: TrendingUp,
            gradient: ' ',
            message: "You're doing well! A little more consistency will take you far."
        },
        LOW: {
            label: 'On Track',
            subLabel: 'Keep it up!',
            color: 'text-[var(--success)]',
            bg: 'bg-[var(--success-muted)]',
            border: 'border-[var(--success)]',
            icon: Award,
            gradient: ' ',
            message: "Excellent work! You're mastering your academic journey."
        },
        UNKNOWN: {
            label: 'Calculating...',
            subLabel: 'Gathering data',
            color: 'text-[var(--ink-muted)]',
            bg: 'bg-[var(--surface-hover)]',
            border: 'border-[var(--line)]',
            icon: ArrowUpRight,
            gradient: ' ',
            message: "We're analyzing your data to provide personalized insights."
        }
    };

    const status = config[level?.toUpperCase()] || config.UNKNOWN;
    const Icon = status.icon;

    // Size variants
    const sizes = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-1 text-xs',
        lg: 'px-3.5 py-1.5 text-sm',
    };

    if (size === 'card') {
        return (
            <div className={`rounded-xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-sm`}>
                <div className={`h-1.5 w-full bg-[var(--surface)] ${status.gradient}`} />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                      <div>
                          <h3 className={`font-semibold text-sm ${status.color}`}>{status.label}</h3>
                          <p className="text-[10px] text-[var(--ink-muted)] mt-0.5">{status.subLabel}</p>
                      </div>
                      <div className={`p-2 rounded-lg ${status.bg} ${status.color}`}>
                          <Icon className="w-4 h-4" />
                      </div>
                  </div>
                  <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                      {status.message}
                  </p>
                </div>
            </div>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${status.bg} ${status.color} ${status.border} ${sizes[size]}`}>
            {showIcon && <Icon className="w-3.5 h-3.5" />}
            {showLabel && status.label}
        </span>
    );
};

export default ProgressIndicator;
