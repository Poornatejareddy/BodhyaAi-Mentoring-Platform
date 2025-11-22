import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
    Users,
    UserCheck,
    AlertTriangle,
    MessageSquare,
    Bell,
    TrendingUp,
    Activity,
    Server,
} from 'lucide-react';
import StatCard from '../../common/components/StatCard';

const AdminOverviewPage = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, [token]);

    const fetchDashboardStats = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await response.json();
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
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-400">Failed to load dashboard statistics</p>
            </div>
        );
    }

    // Chart data
    const userRoleData = [
        { name: 'Students', value: stats.users.totalStudents, color: '#3b82f6' },
        { name: 'Mentors', value: stats.users.totalMentors, color: '#8b5cf6' },
        { name: 'Admins', value: stats.users.totalAdmins, color: '#ec4899' },
    ];

    const riskData = [
        { name: 'High', value: stats.risk.high, color: '#ef4444' },
        { name: 'Medium', value: stats.risk.medium, color: '#f59e0b' },
        { name: 'Low', value: stats.risk.low, color: '#10b981' },
    ];

    const activityData = [
        { name: 'Messages', value: stats.messages.total },
        { name: 'Alerts', value: stats.alerts.total },
        { name: 'Active Users', value: stats.activity.activeUsersCount },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-gray-400 mt-2 text-lg">System overview and analytics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    subtitle={`${stats.users.totalStudents} students`}
                    icon={Users}
                    gradient="from-blue-600 to-cyan-600"
                />

                <StatCard
                    title="Assigned Students"
                    value={stats.students.assigned}
                    subtitle={`${stats.students.unassigned} unassigned`}
                    icon={UserCheck}
                    gradient="from-green-600 to-emerald-600"
                />

                <StatCard
                    title="High Risk"
                    value={stats.risk.high}
                    subtitle="Require attention"
                    icon={AlertTriangle}
                    gradient="from-red-600 to-orange-600"
                />

                <StatCard
                    title="Total Messages"
                    value={stats.messages.total}
                    subtitle={`${stats.messages.unread} unread`}
                    icon={MessageSquare}
                    gradient="from-purple-600 to-pink-600"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Distribution */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-400" />
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
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Risk Distribution */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
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
                                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                labelStyle={{ color: '#f3f4f6' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    Activity Overview
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            labelStyle={{ color: '#f3f4f6' }}
                        />
                        <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* System Health */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-400" />
                    System Health
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 mb-1">Assignment Rate</p>
                        <p className="text-3xl font-bold text-blue-400">
                            {stats.students.total > 0
                                ? Math.round((stats.students.assigned / stats.students.total) * 100)
                                : 0}%
                        </p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 mb-1">Active Users (7d)</p>
                        <p className="text-3xl font-bold text-green-400">{stats.activity.activeUsersCount}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 mb-1">Unread Alerts</p>
                        <p className="text-3xl font-bold text-yellow-400">{stats.alerts.unread}</p>
                    </div>
                    <div className="bg-gray-700/30 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-400 mb-1">Avg Messages</p>
                        <p className="text-3xl font-bold text-purple-400">
                            {stats.users.total > 0
                                ? Math.round(stats.messages.total / stats.users.total)
                                : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all cursor-pointer">
                    <UserCheck className="w-8 h-8 text-blue-400 mb-3" />
                    <h4 className="text-white font-semibold text-lg mb-2">Manage Users</h4>
                    <p className="text-gray-400 text-sm">{stats.users.total} total users</p>
                </div>

                <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all cursor-pointer">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
                    <h4 className="text-white font-semibold text-lg mb-2">Review Alerts</h4>
                    <p className="text-gray-400 text-sm">{stats.alerts.urgent} urgent alerts</p>
                </div>

                <div className="bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl p-6 transition-all cursor-pointer">
                    <Activity className="w-8 h-8 text-purple-400 mb-3" />
                    <h4 className="text-white font-semibold text-lg mb-2">View Activity</h4>
                    <p className="text-gray-400 text-sm">{stats.activity.recentAuditLogs} recent logs</p>
                </div>
            </div>
        </div>
    );
};

export default AdminOverviewPage;
