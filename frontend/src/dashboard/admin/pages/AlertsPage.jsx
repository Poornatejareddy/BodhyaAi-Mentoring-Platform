import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
import { Bell, AlertTriangle, Info, CheckCircle, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AlertsPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, urgent, high, medium, low
    const [readFilter, setReadFilter] = useState('all'); // all, read, unread

    useEffect(() => {
        fetchAlerts();
    }, [token]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setAlerts(data.data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId) => {
        try {
            await fetch(`${API_BASE_URL}/admin/alerts/${alertId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAlerts();
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    const deleteAlert = async (alertId) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;
        try {
            await fetch(`${API_BASE_URL}/admin/alerts/${alertId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAlerts();
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'URGENT':
                return <AlertTriangle className="w-5 h-5 text-[var(--danger)]" />;
            case 'HIGH':
                return <AlertTriangle className="w-5 h-5 text-[var(--warning)]" />;
            case 'MEDIUM':
                return <Info className="w-5 h-5 text-[var(--warning)]" />;
            default:
                return <Bell className="w-5 h-5 text-[var(--brand)]" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'border-l-4 border-[var(--danger)] bg-[var(--danger-muted)]';
            case 'HIGH':
                return 'border-l-4 border-[var(--warning)] bg-[var(--warning-muted)]';
            case 'MEDIUM':
                return 'border-l-4 border-[var(--warning)] bg-[var(--warning-muted)]';
            default:
                return 'border-l-4 border-[var(--brand)] bg-[var(--brand)]';
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter !== 'all' && alert.priority !== filter.toUpperCase()) return false;
        if (readFilter === 'read' && !alert.read) return false;
        if (readFilter === 'unread' && alert.read) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--ink)]">System Alerts</h1>
                    <p className="text-[var(--ink)] mt-1">Monitor and manage system alerts</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchAlerts}
                        className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--line)]">
                    <p className="text-sm text-[var(--ink)]">Total</p>
                    <p className="text-2xl font-bold text-[var(--ink)]">{alerts.length}</p>
                </div>
                <div className="bg-[var(--danger-muted)] rounded-lg p-4 border border-[var(--danger)]">
                    <p className="text-sm text-[var(--ink)]">Urgent</p>
                    <p className="text-2xl font-bold text-[var(--danger)]">
                        {alerts.filter(a => a.priority === 'URGENT').length}
                    </p>
                </div>
                <div className="bg-[var(--warning-muted)] rounded-lg p-4 border border-[var(--warning)]">
                    <p className="text-sm text-[var(--ink)]">High</p>
                    <p className="text-2xl font-bold text-[var(--warning)]">
                        {alerts.filter(a => a.priority === 'HIGH').length}
                    </p>
                </div>
                <div className="bg-[var(--warning-muted)] rounded-lg p-4 border border-[var(--warning)]">
                    <p className="text-sm text-[var(--ink)]">Medium</p>
                    <p className="text-2xl font-bold text-[var(--warning)]">
                        {alerts.filter(a => a.priority === 'MEDIUM').length}
                    </p>
                </div>
                <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--line)]">
                    <p className="text-sm text-[var(--ink)]">Unread</p>
                    <p className="text-2xl font-bold text-[var(--ink)]">
                        {alerts.filter(a => !a.read).length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
                <div>
                    <label className="block text-sm text-[var(--ink)] mb-2">Priority</label>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    >
                        <option value="all">All Priorities</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-[var(--ink)] mb-2">Status</label>
                    <select
                        value={readFilter}
                        onChange={(e) => setReadFilter(e.target.value)}
                        className="bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    >
                        <option value="all">All</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-[var(--ink)]">Loading alerts...</div>
                ) : filteredAlerts.length === 0 ? (
                    <div className="bg-[var(--surface)] rounded-xl p-12 text-center border border-[var(--line)]">
                        <Bell className="w-16 h-16 text-[var(--ink)] mx-auto mb-4" />
                        <p className="text-[var(--ink)]">No alerts found</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert._id}
                            className={`bg-[var(--surface)] rounded-xl p-5 border border-[var(--line)] ${getPriorityColor(alert.priority)} ${!alert.read ? 'shadow-lg' : 'opacity-75'
                                }`}
                        >
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 mt-1">
                                    {getPriorityIcon(alert.priority)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-[var(--ink)] font-semibold text-lg">{alert.title}</h3>
                                            <p className="text-[var(--ink)] text-sm mt-1">{alert.message}</p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {!alert.read && (
                                                <button
                                                    onClick={() => markAsRead(alert._id)}
                                                    className="p-2 hover:bg-[var(--surface)] rounded-lg text-[var(--success)] transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteAlert(alert._id)}
                                                className="p-2 hover:bg-[var(--surface)] rounded-lg text-[var(--danger)] transition-colors"
                                                title="Delete"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs text-[var(--ink)]">
                                        <span>Type: {alert.type}</span>
                                        <span>Priority: {alert.priority}</span>
                                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                                        {alert.actionLink && (
                                            <button
                                                onClick={() => navigate(alert.actionLink)}
                                                className="flex items-center gap-1 text-[var(--brand)] hover:text-[var(--brand)]"
                                            >
                                                View Details <ExternalLink className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default AlertsPage;
