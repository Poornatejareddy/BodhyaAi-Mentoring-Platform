import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

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
            const res = await fetch('http://localhost:5000/api/alerts/my-alerts?limit=50', {
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
            const res = await fetch(`http://localhost:5000/api/alerts/${alertId}/read`, {
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
            const res = await fetch('http://localhost:5000/api/alerts/mark-all-read', {
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
            const res = await fetch(`http://localhost:5000/api/alerts/${alertId}`, {
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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT':
                return 'bg-red-100 border-red-500 text-red-900';
            case 'HIGH':
                return 'bg-orange-100 border-orange-500 text-orange-900';
            case 'MEDIUM':
                return 'bg-yellow-100 border-yellow-500 text-yellow-900';
            case 'LOW':
                return 'bg-blue-100 border-blue-500 text-blue-900';
            default:
                return 'bg-gray-100 border-gray-500 text-gray-900';
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
                return 'ℹ️';
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
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Notifications"
            >
                <svg
                    className="w-6 h-6 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadAlertsCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                        {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                    </span>
                )}
            </button>

            {/* Alerts Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadAlertsCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 rounded p-1"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Alerts List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2">Loading alerts...</p>
                            </div>
                        ) : combinedAlerts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <p className="font-medium">No notifications</p>
                                <p className="text-sm">You're all caught up!</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {combinedAlerts.map((alert) => (
                                    <div
                                        key={alert._id}
                                        className={`p-4 hover:bg-gray-50 transition ${!alert.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getPriorityIcon(alert.priority)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className="font-semibold text-sm text-gray-900">
                                                        {alert.title}
                                                    </h4>
                                                    {!alert.read && (
                                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(alert.createdAt).toLocaleString()}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        {!alert.read && (
                                                            <button
                                                                onClick={() => handleMarkAsRead(alert._id)}
                                                                className="text-xs text-blue-600 hover:text-blue-800"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteAlert(alert._id)}
                                                            className="text-xs text-red-600 hover:text-red-800"
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
            )}
        </div>
    );
};

export default AlertsPanel;
