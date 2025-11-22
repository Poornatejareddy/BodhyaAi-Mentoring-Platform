import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

const RiskBadge = ({ risk, confidence, size = 'md', showIcon = true, showConfidence = false }) => {
    // Risk configuration
    const riskConfig = {
        HIGH: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            label: 'High Risk',
        },
        MEDIUM: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            icon: AlertCircle,
            iconColor: 'text-yellow-600',
            label: 'Medium Risk',
        },
        LOW: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            icon: CheckCircle,
            iconColor: 'text-green-600',
            label: 'Low Risk',
        },
    };

    // Size variants
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const config = riskConfig[risk] || riskConfig.MEDIUM;
    const Icon = config.icon;

    if (!risk) {
        return (
            <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full bg-gray-100 text-gray-600 border border-gray-300 font-semibold`}>
                <AlertCircle className={iconSizes[size]} />
                Unknown
            </span>
        );
    }

    return (
        <div className="inline-flex flex-col gap-1">
            <span
                className={`inline-flex items-center gap-1.5 ${sizeClasses[size]} rounded-full ${config.bg} ${config.text} border ${config.border} font-semibold transition-all hover:scale-105`}
                title={`Academic Risk: ${config.label}${confidence ? ` (${Math.round(confidence * 100)}% confidence)` : ''}`}
            >
                {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
                {config.label}
            </span>

            {showConfidence && confidence && (
                <span className="text-xs text-gray-500 text-center">
                    {Math.round(confidence * 100)}% confidence
                </span>
            )}
        </div>
    );
};

export default RiskBadge;
