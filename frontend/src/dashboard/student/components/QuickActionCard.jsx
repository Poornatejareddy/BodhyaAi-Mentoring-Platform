import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/**
 * QuickActionCard Component
 * Reusable card for quick navigation with gradient backgrounds and icons
 */
const QuickActionCard = ({
    title,
    description,
    icon: Icon,
    gradient = " ",
    href,
    badge = null
}) => {
    return (
        <Link
            to={href}
            className="group relative overflow-hidden bg-[var(--surface)] rounded-xl border border-[var(--line)] hover:border-[var(--brand)] transition-all shadow-sm hover:translate-y-[-2px] duration-300"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-[var(--surface)] ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

            {/* Content */}
            <div className="relative p-6">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-[var(--surface)] ${gradient} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-[var(--ink)]" />
                </div>

                {/* Text */}
                <div className="mb-4">
                    <h3 className="text-sm font-semibold text-[var(--ink)] mb-1.5 flex items-center justify-between">
                        {title}
                        {badge && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-[var(--danger)] text-[var(--ink)] rounded-full">
                                {badge}
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-[var(--ink-muted)] leading-relaxed">{description}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center text-xs font-semibold text-[var(--brand)]">
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
};

export default QuickActionCard;
