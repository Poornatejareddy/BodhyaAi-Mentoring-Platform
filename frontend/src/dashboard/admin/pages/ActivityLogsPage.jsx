import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Activity, User, Calendar, Filter, Search } from 'lucide-react';

function ActivityLogsPage() {
    const { token } = useAuth();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionFilter, setActionFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all');

    useEffect(() => {
        fetchLogs();
    }, [token]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/admin/audit-logs?limit=100', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setLogs(data.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        if (action.includes('DELETE')) return 'text-red-400 bg-red-900/20';
        if (action.includes('CREATE')) return 'text-green-400 bg-green-900/20';
        if (action.includes('UPDATE')) return 'text-yellow-400 bg-yellow-900/20';
        if (action.includes('VIEW')) return 'text-blue-400 bg-blue-900/20';
        return 'text-gray-400 bg-gray-700/20';
    };

    const getRoleColor = (role) => {
        if (role === 'admin') return 'bg-purple-900/50 text-purple-400';
        if (role === 'mentor') return 'bg-blue-900/50 text-blue-400';
        return 'bg-green-900/50 text-green-400';
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAction = actionFilter === 'all' || log.action === actionFilter;
        const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;
        return matchesSearch && matchesAction && matchesRole;
    });

    // Get unique actions for filter
    const uniqueActions = [...new Set(logs.map(log => log.action))].sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
                    <p className="text-gray-400 mt-1">Monitor all system actions and audit trails</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <p className="text-sm text-gray-400">Total Logs</p>
                    <p className="text-2xl font-bold text-white">{logs.length}</p>
                </div>
                <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/50">
                    <p className="text-sm text-gray-400">Admin Actions</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {logs.filter(l => l.userRole === 'admin').length}
                    </p>
                </div>
                <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-700/50">
                    <p className="text-sm text-gray-400">Mentor Actions</p>
                    <p className="text-2xl font-bold text-blue-400">
                        {logs.filter(l => l.userRole === 'mentor').length}
                    </p>
                </div>
                <div className="bg-green-900/20 rounded-lg p-4 border border-green-700/50">
                    <p className="text-sm text-gray-400">Student Actions</p>
                    <p className="text-2xl font-bold text-green-400">
                        {logs.filter(l => l.userRole === 'student').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search by user or action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="mentor">Mentor</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-700/50 text-gray-400 text-sm">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Action</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Result</th>
                                <th className="px-6 py-3">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{log.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{log.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(log.userRole)}`}>
                                                {log.userRole?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.result === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                                                    log.result === 'FAILURE' ? 'bg-red-900/50 text-red-400' :
                                                        'bg-gray-700 text-gray-400'
                                                }`}>
                                                {log.result || 'SUCCESS'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(log.createdAt).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ActivityLogsPage;
