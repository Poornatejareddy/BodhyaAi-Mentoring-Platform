import React from 'react';
import { CheckCircle, Circle, Clock, MessageSquare, Calendar } from 'lucide-react';

const InterventionTimeline = ({ interventions, onUpdate }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-400" />;
            case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-yellow-400" />;
            default: return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'border-red-500 bg-red-900/20';
            case 'HIGH': return 'border-orange-500 bg-orange-900/20';
            case 'MEDIUM': return 'border-yellow-500 bg-yellow-900/20';
            default: return 'border-blue-500 bg-blue-900/20';
        }
    };

    if (!interventions || interventions.length === 0) {
        return (
            <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No interventions recorded yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {interventions.map((intervention, index) => (
                <div key={intervention._id} className={`border-l-4 rounded-lg p-4 ${getPriorityColor(intervention.priority)}`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                            {getStatusIcon(intervention.status)}
                            <div>
                                <h4 className="text-white font-semibold text-lg">{intervention.title}</h4>
                                <p className="text-gray-400 text-sm">{intervention.type}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${intervention.status === 'COMPLETED' ? 'bg-green-500 text-white' :
                                intervention.status === 'IN_PROGRESS' ? 'bg-yellow-500 text-black' :
                                    'bg-gray-600 text-white'
                            }`}>
                            {intervention.status}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-300 text-sm mb-3">{intervention.description}</p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                        {intervention.scheduledDate && (
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(intervention.scheduledDate).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>Created {new Date(intervention.createdAt).toLocaleDateString()}</span>
                        </div>
                        {intervention.notes && intervention.notes.length > 0 && (
                            <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{intervention.notes.length} note{intervention.notes.length > 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {intervention.status !== 'COMPLETED' && (
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => onUpdate(intervention._id, { status: 'IN_PROGRESS' })}
                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-xs font-medium"
                            >
                                Mark In Progress
                            </button>
                            <button
                                onClick={() => onUpdate(intervention._id, { status: 'COMPLETED', completedDate: new Date() })}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                            >
                                Mark Complete
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InterventionTimeline;
