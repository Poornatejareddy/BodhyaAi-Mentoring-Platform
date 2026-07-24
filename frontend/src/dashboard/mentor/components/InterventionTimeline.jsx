import React from 'react';
import { CheckCircle, Circle, Clock, MessageSquare, Calendar } from 'lucide-react';

const InterventionTimeline = ({ interventions, onUpdate }) => {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
            case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-[var(--warning)]" />;
            default: return <Circle className="w-5 h-5 text-[var(--ink)]" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'border-[var(--danger)] bg-[var(--danger-muted)]';
            case 'HIGH': return 'border-[var(--warning)] bg-[var(--warning-muted)]';
            case 'MEDIUM': return 'border-[var(--warning)] bg-[var(--warning-muted)]';
            default: return 'border-[var(--brand)] bg-[var(--brand)]';
        }
    };

    if (!interventions || interventions.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--ink)]">
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
                                <h4 className="text-[var(--ink)] font-semibold text-lg">{intervention.title}</h4>
                                <p className="text-[var(--ink)] text-sm">{intervention.type}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${intervention.status === 'COMPLETED' ? 'bg-[var(--success-muted)] text-[var(--ink)]' :
                                intervention.status === 'IN_PROGRESS' ? 'bg-[var(--warning-muted)] text-[var(--ink)]' :
                                    'bg-[var(--surface)] text-[var(--ink)]'
                            }`}>
                            {intervention.status}
                        </span>
                    </div>

                    {/* Description */}
                    <p className="text-[var(--ink)] text-sm mb-3">{intervention.description}</p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-xs text-[var(--ink)]">
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
                                className="px-3 py-1 bg-[var(--warning-muted)] hover:bg-[var(--warning-muted)] text-[var(--ink)] rounded text-xs font-medium"
                            >
                                Mark In Progress
                            </button>
                            <button
                                onClick={() => onUpdate(intervention._id, { status: 'COMPLETED', completedDate: new Date() })}
                                className="px-3 py-1 bg-[var(--success-muted)] hover:bg-[var(--success-muted)] text-[var(--ink)] rounded text-xs font-medium"
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
