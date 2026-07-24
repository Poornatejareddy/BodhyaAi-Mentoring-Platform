import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import { Bell, Trash2, Check, X, Inbox } from 'lucide-react';

const AlertsPanel = () => {
    const { alerts, unreadAlertsCount, clearAlert, clearAllAlerts } = useSocket();
    const { token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [allAlerts, setAllAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch all alerts from API when panel opens
    useEffect(() => {
        if (isOpen && token) {
            fetchAlerts();
        }
    }, [isOpen, token]);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/alerts/my-alerts?limit=50`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAllAlerts(data.data);
            }
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (alertId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/alerts/${alertId}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                // Update local state
                setAllAlerts((prev) =>
                    prev.map((alert) =>
                        alert._id === alertId ? { ...alert, read: true } : alert
                    )
                );
                clearAlert(alertId);
            }
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setAllAlerts((prev) => prev.map((alert) => ({ ...alert, read: true })));
                clearAllAlerts();
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDeleteAlert = async (alertId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                setAllAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
                clearAlert(alertId);
            }
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    const getPriorityStyle = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-[var(--danger-muted)] border-[var(--danger)] text-[var(--danger)]';
            case 'HIGH':
                return 'var-warning var-warning var-warning';
            case 'MEDIUM':
                return 'bg-[var(--brand)] border-[var(--brand)] text-[var(--brand)]';
            case 'LOW':
                return 'bg-[var(--success-muted)] border-[var(--success)] text-[var(--success)]';
            default:
                return 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink)]';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'URGENT':
                return '🚨';
            case 'HIGH':
                return '⚠️';
            case 'MEDIUM':
                return '📌';
            case 'LOW':
                return '✨';
            default:
                return '📢';
        }
    };

    const combinedAlerts = [...alerts, ...allAlerts].reduce((acc, alert) => {
        if (!acc.find((a) => a._id === alert._id)) {
            acc.push(alert);
        }
        return acc;
    }, []);

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-secondary)] hover:bg-[var(--surface-hover)] transition-all cursor-pointer"
                aria-label="Notifications"
            >
                <Bell size={16} />
                {unreadAlertsCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 text-[10px] font-bold text-[var(--ink)] bg-[var(--danger)] rounded-full border-2 border-[var(--surface)]">
                        {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                    </span>
                )}
            </button>

            {/* Alerts Dropdown Panel */}
            {isOpen && (
                <>
                    {/* Backdrop for easy closing */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    
                    <div className="absolute right-0 mt-2 w-96 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--line)] z-50 max-h-[500px] overflow-hidden flex flex-col animate-fade-in">
                        {/* Header */}
                        <div className="p-4 border-b border-[var(--line)] flex justify-between items-center bg-[var(--surface-muted)]">
                            <div>
                                <h3 className="font-semibold text-sm text-[var(--ink)]">Notifications</h3>
                                <p className="text-[10px] text-[var(--ink-muted)]">Stay updated on risk flags & messages</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadAlertsCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="text-xs text-[var(--brand)] hover:underline flex items-center gap-1 font-medium bg-transparent border-0 cursor-pointer"
                                    >
                                        <Check size={12} />
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-hover)] rounded-lg p-1 transition cursor-pointer"
                                    aria-label="Close notifications"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Alerts List */}
                        <div className="overflow-y-auto flex-1 divide-y divide-[var(--line)]">
                            {loading ? (
                                <div className="p-8 text-center text-[var(--ink-muted)]">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--brand)] mx-auto mb-3"></div>
                                    <p className="text-xs">Loading notifications...</p>
                                </div>
                            ) : combinedAlerts.length === 0 ? (
                                <div className="p-8 text-center text-[var(--ink-muted)] flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-[var(--surface-hover)] flex items-center justify-center mb-3">
                                        <Inbox size={20} className="text-[var(--ink-muted)]" />
                                    </div>
                                    <p className="font-semibold text-sm text-[var(--ink)]">All caught up!</p>
                                    <p className="text-xs text-[var(--ink-muted)] mt-0.5">No notifications at the moment.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[var(--line)]">
                                    {combinedAlerts.map((alert) => (
                                        <div
                                            key={alert._id}
                                            className={`p-4 transition hover:bg-[var(--surface-hover)] ${
                                                !alert.read ? 'bg-[var(--brand-light)]/20' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-xl leading-none">{getPriorityIcon(alert.priority)}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-xs text-[var(--ink)] leading-snug">
                                                            {alert.title}
                                                        </h4>
                                                        {!alert.read && (
                                                            <span className="inline-block w-1.5 h-1.5 bg-[var(--brand)] rounded-full flex-shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[var(--ink-secondary)] mt-1 leading-relaxed">{alert.message}</p>
                                                    <div className="flex items-center justify-between mt-3">
                                                        <span className="text-[10px] text-[var(--ink-muted)]">
                                                            {new Date(alert.createdAt).toLocaleString()}
                                                        </span>
                                                        <div className="flex gap-2">
                                                            {!alert.read && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(alert._id)}
                                                                    className="text-[10px] text-[var(--brand)] hover:underline bg-transparent border-0 cursor-pointer"
                                                                >
                                                                    Mark read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteAlert(alert._id)}
                                                                className="text-[10px] text-[var(--danger)] hover:underline bg-transparent border-0 cursor-pointer"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AlertsPanel;
