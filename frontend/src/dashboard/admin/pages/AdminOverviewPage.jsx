import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
    Users,
    UserCheck,
    AlertTriangle,
    MessageSquare,
    Activity,
    Server,
} from 'lucide-react';
import StatCard from '../../common/components/StatCard';

const AdminOverviewPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, [token]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/admin/dashboard-stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--brand)] mx-auto mb-4"></div>
                    <p className="text-[var(--ink-muted)] text-sm">Loading admin console...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center p-8 border border-[var(--line)] rounded-xl bg-[var(--surface)]">
                <p className="text-[var(--ink-muted)] text-sm">Failed to load dashboard statistics.</p>
            </div>
        );
    }

    // Chart data
    const userRoleData = [
        { name: 'Students', value: stats.users.totalStudents, color: 'var(--brand)' },
        { name: 'Mentors', value: stats.users.totalMentors, color: 'var(--brand)' },
        { name: 'Admins', value: stats.users.totalAdmins, color: 'var(--danger)' },
    ];

    const riskData = [
        { name: 'High', value: stats.risk.high, color: 'var(--danger)' },
        { name: 'Medium', value: stats.risk.medium, color: 'var(--warning)' },
        { name: 'Low', value: stats.risk.low, color: 'var(--success)' },
    ];

    const activityData = [
        { name: 'Messages', value: stats.messages.total },
        { name: 'Alerts', value: stats.alerts.total },
        { name: 'Active Users', value: stats.activity.activeUsersCount },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--ink)]">Admin Dashboard</h1>
                <p className="text-xs text-[var(--ink-muted)] mt-1">System overview and compliance logs</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    subtitle={`${stats.users.totalStudents} students`}
                    icon={Users}
                />

                <StatCard
                    title="Assigned Students"
                    value={stats.students.assigned}
                    subtitle={`${stats.students.unassigned} unassigned`}
                    icon={UserCheck}
                />

                <StatCard
                    title="High Risk"
                    value={stats.risk.high}
                    subtitle="Require attention"
                    icon={AlertTriangle}
                />

                <StatCard
                    title="Total Messages"
                    value={stats.messages.total}
                    subtitle={`${stats.messages.unread} unread`}
                    icon={MessageSquare}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution */}
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[var(--brand)]" />
                        User Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={userRoleData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                                {userRoleData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                                labelStyle={{ color: 'var(--ink)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk Distribution */}
                <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
                    <h3 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
                        Risk Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                                labelStyle={{ color: 'var(--ink)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[var(--brand)]" />
                    Activity Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
                        <XAxis dataKey="name" stroke="var(--ink-muted)" fontSize={12} />
                        <YAxis stroke="var(--ink-muted)" fontSize={12} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '8px', color: 'var(--ink)' }}
                        />
                        <Bar dataKey="value" fill="var(--brand)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* System Health */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--line)] shadow-sm">
                <h3 className="text-sm font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Server className="w-4 h-4 text-[var(--success)]" />
                    System Health
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--surface-hover)]/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-[var(--ink-muted)] mb-1">Assignment Rate</p>
                        <p className="text-2xl font-bold text-[var(--brand)]">
                            {stats.students.total > 0
                                ? Math.round((stats.students.assigned / stats.students.total) * 100)
                                : 0}%
                        </p>
                    </div>
                    <div className="bg-[var(--surface-hover)]/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-[var(--ink-muted)] mb-1">Active Users (7d)</p>
                        <p className="text-2xl font-bold text-[var(--success)]">{stats.activity.activeUsersCount}</p>
                    </div>
                    <div className="bg-[var(--surface-hover)]/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-[var(--ink-muted)] mb-1">Unread Alerts</p>
                        <p className="text-2xl font-bold text-[var(--warning)]">{stats.alerts.unread}</p>
                    </div>
                    <div className="bg-[var(--surface-hover)]/50 rounded-lg p-4 text-center">
                        <p className="text-xs text-[var(--ink-muted)] mb-1">Avg Messages</p>
                        <p className="text-2xl font-bold text-[var(--brand)]">
                            {stats.users.total > 0
                                ? Math.round(stats.messages.total / stats.users.total)
                                : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    onClick={() => navigate('/dashboard/admin/users')}
                    className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all cursor-pointer shadow-sm hover:translate-y-[-2px] duration-200 group"
                >
                    <UserCheck className="w-7 h-7 text-[var(--brand)] mb-3 group-hover:scale-105 transition" />
                    <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">Manage Users</h4>
                    <p className="text-[var(--ink-muted)] text-xs">{stats.users.total} total accounts active</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/admin/alerts')}
                    className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all cursor-pointer shadow-sm hover:translate-y-[-2px] duration-200 group"
                >
                    <AlertTriangle className="w-7 h-7 text-[var(--danger)] mb-3 group-hover:scale-105 transition" />
                    <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">Review Alerts</h4>
                    <p className="text-[var(--ink-muted)] text-xs">{stats.alerts.urgent} urgent notifications</p>
                </div>

                <div
                    onClick={() => navigate('/dashboard/admin/activity')}
                    className="bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--line)] rounded-xl p-6 transition-all cursor-pointer shadow-sm hover:translate-y-[-2px] duration-200 group"
                >
                    <Activity className="w-7 h-7 text-[var(--brand)] mb-3 group-hover:scale-105 transition" />
                    <h4 className="text-[var(--ink)] font-semibold text-sm mb-1">View Activity</h4>
                    <p className="text-[var(--ink-muted)] text-xs">{stats.activity.recentAuditLogs} audits recorded</p>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
