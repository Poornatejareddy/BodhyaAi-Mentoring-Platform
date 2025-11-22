import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';

const InterventionModal = ({ isOpen, onClose, onSubmit, studentId, studentName }) => {
    const [formData, setFormData] = useState({
        type: 'MEETING',
        title: '',
        description: '',
        priority: 'MEDIUM',
        scheduledDate: '',
        deadline: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, studentId });
        onClose();
        setFormData({
            type: 'MEETING',
            title: '',
            description: '',
            priority: 'MEDIUM',
            scheduledDate: '',
            deadline: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Create Intervention</h2>
                        <p className="text-gray-400 text-sm mt-1">For {studentName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="MEETING">Meeting</option>
                            <option value="TASK">Task</option>
                            <option value="COUNSELING">Counseling</option>
                            <option value="ACADEMIC_PLAN">Academic Plan</option>
                            <option value="FOLLOW_UP">Follow Up</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Discuss study plan for midterms"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Detailed description of the intervention..."
                            required
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => (
                                <button
                                    key={priority}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority })}
                                    className={`py-2 px-4 rounded-lg font-medium transition-colors ${formData.priority === priority
                                            ? priority === 'URGENT' ? 'bg-red-600 text-white' :
                                                priority === 'HIGH' ? 'bg-orange-600 text-white' :
                                                    priority === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                                                        'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {priority}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Scheduled Date
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledDate}
                                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Deadline
                            </label>
                            <input
                                type="date"
                                value={formData.deadline}
                                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Create Intervention
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterventionModal;
