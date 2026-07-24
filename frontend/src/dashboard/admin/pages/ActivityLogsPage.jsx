import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
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
            const response = await fetch(`${API_BASE_URL}/admin/audit-logs?limit=100`, {
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
        if (action.includes('DELETE')) return 'text-[var(--danger)] bg-[var(--danger-muted)]';
        if (action.includes('CREATE')) return 'text-[var(--success)] bg-[var(--success-muted)]';
        if (action.includes('UPDATE')) return 'text-[var(--warning)] bg-[var(--warning-muted)]';
        if (action.includes('VIEW')) return 'text-[var(--brand)] bg-[var(--brand)]';
        return 'text-[var(--ink)] bg-[var(--surface)]';
    };

    const getRoleColor = (role) => {
        if (role === 'admin') return 'bg-[var(--brand)] text-[var(--brand)]';
        if (role === 'mentor') return 'bg-[var(--brand)] text-[var(--brand)]';
        return 'bg-[var(--success-muted)] text-[var(--success)]';
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
                    <h1 className="text-3xl font-bold text-[var(--ink)]">Activity Logs</h1>
                    <p className="text-[var(--ink)] mt-1">Monitor all system actions and audit trails</p>
                </div>
                <button
                    onClick={fetchLogs}
                    className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg transition-colors"
                >
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--surface)] rounded-lg p-4 border border-[var(--line)]">
                    <p className="text-sm text-[var(--ink)]">Total Logs</p>
                    <p className="text-2xl font-bold text-[var(--ink)]">{logs.length}</p>
                </div>
                <div className="bg-[var(--brand)] rounded-lg p-4 border border-[var(--brand)]">
                    <p className="text-sm text-[var(--ink)]">Admin Actions</p>
                    <p className="text-2xl font-bold text-[var(--brand)]">
                        {logs.filter(l => l.userRole === 'admin').length}
                    </p>
                </div>
                <div className="bg-[var(--brand)] rounded-lg p-4 border border-[var(--brand)]">
                    <p className="text-sm text-[var(--ink)]">Mentor Actions</p>
                    <p className="text-2xl font-bold text-[var(--brand)]">
                        {logs.filter(l => l.userRole === 'mentor').length}
                    </p>
                </div>
                <div className="bg-[var(--success-muted)] rounded-lg p-4 border border-[var(--success)]">
                    <p className="text-sm text-[var(--ink)]">Student Actions</p>
                    <p className="text-2xl font-bold text-[var(--success)]">
                        {logs.filter(l => l.userRole === 'student').length}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="w-5 h-5 text-[var(--ink)] absolute left-3 top-2.5" />
                        <input
                            type="text"
                            placeholder="Search by user or action..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[var(--surface)] text-[var(--ink)] pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="w-5 h-5 text-[var(--ink)] absolute left-3 top-2.5" />
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full bg-[var(--surface)] text-[var(--ink)] pl-10 pr-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                        >
                            <option value="all">All Actions</option>
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <User className="w-5 h-5 text-[var(--ink)] absolute left-3 top-2.5" />
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full bg-[var(--surface)] text-[var(--ink)] pl-10 pr-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
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
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface)] text-[var(--ink)] text-sm">
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
                                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--ink)]">
                                        Loading activity logs...
                                    </td>
                                </tr>
                            ) : filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-[var(--ink)]">
                                        No activity logs found
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-[var(--surface)] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[var(--surface)]   flex items-center justify-center text-[var(--ink)] text-sm font-bold">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-[var(--ink)] font-medium">{log.user?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-[var(--ink)]">{log.user?.email}</p>
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
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.result === 'SUCCESS' ? 'bg-[var(--success-muted)] text-[var(--success)]' :
                                                    log.result === 'FAILURE' ? 'bg-[var(--danger-muted)] text-[var(--danger)]' :
                                                        'bg-[var(--surface)] text-[var(--ink)]'
                                                }`}>
                                                {log.result || 'SUCCESS'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--ink)] text-sm">
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
