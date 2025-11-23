import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Trash2, Bell, Filter } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

function MentorAlertsPage() {
    const { token } = useAuth();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchAlerts();
    }, [token]);

    const fetchAlerts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts/my-alerts', {
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

    const handleMarkAsRead = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/alerts/${alertId}/read`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAlerts(alerts.map(a => a._id === alertId ? { ...a, read: true } : a));
            }
        } catch (error) {
            console.error('Error marking alert as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alerts/mark-all-read', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAlerts(alerts.map(a => ({ ...a, read: true })));
            }
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleDelete = async (alertId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/alerts/${alertId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setAlerts(alerts.filter(a => a._id !== alertId));
            }
        } catch (error) {
            console.error('Error deleting alert:', error);
        }
    };

    const filteredAlerts = alerts.filter(alert => {
        if (filter === 'unread') return !alert.read;
        if (filter === 'read') return alert.read;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Bell className="w-6 h-6 text-yellow-400" />
                        Alerts & Notifications
                    </h1>
                    <p className="text-gray-400 mt-1">Manage your pending actions and notifications</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleMarkAllAsRead}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        Mark All Read
                    </button>
                    <div className="relative">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="appearance-none bg-gray-700 text-white px-4 py-2 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Alerts</option>
                            <option value="unread">Unread Only</option>
                            <option value="read">Read Only</option>
                        </select>
                        <Filter className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                {filteredAlerts.length === 0 ? (
                    <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
                        <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">No alerts found</p>
                    </div>
                ) : (
                    filteredAlerts.map((alert) => (
                        <div
                            key={alert._id}
                            className={`p-4 rounded-xl border transition-all ${alert.read
                                    ? 'bg-gray-800 border-gray-700 opacity-75'
                                    : 'bg-gray-800 border-l-4 border-l-yellow-500 border-y-gray-700 border-r-gray-700 shadow-lg'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full ${alert.type === 'CRITICAL' ? 'bg-red-900/30 text-red-400' :
                                        alert.type === 'WARNING' ? 'bg-yellow-900/30 text-yellow-400' :
                                            'bg-blue-900/30 text-blue-400'
                                    }`}>
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-semibold ${alert.read ? 'text-gray-300' : 'text-white'}`}>
                                            {alert.title}
                                        </h3>
                                        <span className="text-xs text-gray-500">
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mt-1">{alert.message}</p>

                                    {/* Actions */}
                                    <div className="flex gap-3 mt-3">
                                        {!alert.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(alert._id)}
                                                className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                                            >
                                                <CheckCircle className="w-3 h-3" />
                                                Mark as Read
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(alert._id)}
                                            className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete
                                        </button>
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

export default MentorAlertsPage;
