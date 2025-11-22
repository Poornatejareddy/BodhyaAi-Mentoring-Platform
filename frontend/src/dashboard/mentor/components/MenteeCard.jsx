import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, TrendingUp, Calendar, User } from 'lucide-react';
import RiskBadge from '../../../components/RiskBadge';

/**
 * Enhanced Mentee Card Component
 * Modern card design for displaying student information in mentor dashboard
 */
const MenteeCard = ({ mentee }) => {
    const { user, usn, riskInputs, academicRisk } = mentee;

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all shadow-lg hover:shadow-xl group">
            {/* Header with Avatar and Risk Badge */}
            <div className="p-6 border-b border-gray-700">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {user?.name?.charAt(0) || 'S'}
                        </div>

                        {/* Name and USN */}
                        <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                {user?.name || 'Unknown Student'}
                            </h3>
                            <p className="text-sm text-gray-400">{usn || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Risk Badge */}
                    {academicRisk?.prediction && (
                        <RiskBadge
                            risk={academicRisk.prediction}
                            size="md"
                        />
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="p-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">CGPA</p>
                    <p className={`text-2xl font-bold ${riskInputs?.CGPA >= 7.5 ? 'text-green-400' :
                            riskInputs?.CGPA >= 6.0 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {riskInputs?.CGPA?.toFixed(2) || 'N/A'}
                    </p>
                </div>

                <div className="bg-gray-700/30 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Attendance</p>
                    <p className={`text-2xl font-bold ${riskInputs?.Attendance >= 85 ? 'text-green-400' :
                            riskInputs?.Attendance >= 75 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                        {riskInputs?.Attendance || 'N/A'}%
                    </p>
                </div>
            </div>

            {/* Last Interaction */}
            {academicRisk?.calculatedAt && (
                <div className="px-6 pb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>Risk assessed: {new Date(academicRisk.calculatedAt).toLocaleDateString()}</span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 border-t border-gray-700 flex gap-2">
                <Link
                    to={`/dashboard/mentor/mentees/${mentee._id}`}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <User className="w-4 h-4" />
                    View Profile
                </Link>

                <Link
                    to={`/dashboard/mentor/chat`}
                    className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <MessageSquare className="w-4 h-4" />
                </Link>

                <button
                    onClick={() => {/* Calculate risk logic */ }}
                    className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="Calculate Risk"
                >
                    <TrendingUp className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default MenteeCard;
