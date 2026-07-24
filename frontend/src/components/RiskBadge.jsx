import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const RiskBadge = ({ risk, confidence, size = 'md', showIcon = true, showConfidence = false }) => {
    // Risk configuration using soft transparent borders and backgrounds
    const riskConfig = {
        HIGH: {
            bg: 'bg-[var(--danger-muted)]',
            text: 'text-[var(--danger)]',
            border: 'border-[var(--danger)]',
            icon: AlertTriangle,
            iconColor: 'text-[var(--danger)]',
            label: 'High Risk',
        },
        MEDIUM: {
            bg: 'var-warning',
            text: 'text-[var(--warning)]',
            border: 'var-warning',
            icon: AlertCircle,
            iconColor: 'text-[var(--warning)]',
            label: 'Medium Risk',
        },
        LOW: {
            bg: 'bg-[var(--success-muted)]',
            text: 'text-[var(--success)]',
            border: 'border-[var(--success)]',
            icon: CheckCircle,
            iconColor: 'text-[var(--success)]',
            label: 'Low Risk',
        },
    };

    // Size variants
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.75 text-xs',
        lg: 'px-3.5 py-1 text-sm',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4',
    };

    const config = riskConfig[risk?.toUpperCase()] || riskConfig.MEDIUM;
    const Icon = config.icon;

    if (!risk) {
        return (
            <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-[var(--surface-hover)] text-[var(--ink-muted)] border border-[var(--line)] font-medium`}>
                <AlertCircle className={iconSizes[size]} />
                Unknown
            </span>
        );
    }

    return (
        <div className="inline-flex flex-col gap-1 items-start">
            <span
                className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full ${config.bg} ${config.text} border ${config.border} font-semibold transition-all hover:scale-102`}
                title={`Academic Risk: ${config.label}${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
            >
                {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
                {config.label}
            </span>

            {showConfidence && confidence && (
                <span className="text-[10px] text-[var(--ink-muted)] pl-1">
                    {Math.round(confidence * 100)}% confidence
                </span>
            )}
        </div>
    );
};

export default RiskBadge;
