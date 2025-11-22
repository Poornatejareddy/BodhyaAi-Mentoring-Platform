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
    gradient,
    href,
    badge = null
}) => {
    return (
        <Link
            to={href}
            className="group relative overflow-hidden bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
        >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

            {/* Content */}
            <div className="relative p-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-between">
                        {title}
                        {badge && (
                            <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                                {badge}
                            </span>
                        )}
                    </h3>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>

                {/* Arrow */}
                <div className="flex items-center text-sm font-medium text-blue-400 group-hover:text-blue-300">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>

            {/* Hover Effect Border */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none`}></div>
        </Link>
    );
};

export default QuickActionCard;
