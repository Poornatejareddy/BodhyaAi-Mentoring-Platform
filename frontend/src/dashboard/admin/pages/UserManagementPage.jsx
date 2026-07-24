import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, X, Check, UserCog } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';
import ReassignMentorModal from '../components/ReassignMentorModal';

function UserManagementPage() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [currentUser, setCurrentUser] = useState(null);
    const [showReassignModal, setShowReassignModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        usn: '',
        department: '',
        section: '',
        specialization: ''
    });

    useEffect(() => {
        fetchUsers();
    }, [token]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users?limit=100`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = modalMode === 'create'
            ? `${API_BASE_URL}/admin/users`
            : `${API_BASE_URL}/admin/users/${currentUser._id}`;

        const method = modalMode === 'create' ? 'POST' : 'PUT';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.success) {
                fetchUsers();
                setShowModal(false);
                resetForm();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setModalMode('edit');
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Leave blank to keep unchanged
            role: user.role,
            // Note: In a real app, we'd fetch the profile details (USN, Dept) here too
            // For now, we'll just allow editing basic user info
        });
        setShowModal(true);
    };

    const openReassignModal = async (user) => {
        // Fetch full student details including current mentor
        try {
            const response = await fetch(`${API_BASE_URL}/admin/students`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const studentDetails = data.data.find(s => s.user._id === user._id);
                if (studentDetails) {
                    setSelectedStudent({
                        studentId: studentDetails._id,
                        name: user.name,
                        email: user.email,
                        currentMentor: studentDetails.mentor?.user?.name || 'Not assigned'
                    });
                    setShowReassignModal(true);
                }
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'student',
            usn: '',
            department: '',
            section: '',
            specialization: ''
        });
        setCurrentUser(null);
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-2xl font-bold text-[var(--ink)]">User Management</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-[var(--surface)] p-4 rounded-xl border border-[var(--line)]">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 text-[var(--ink)] absolute left-3 top-2.5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--surface)] text-[var(--ink)] pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    />
                </div>
                <div className="relative">
                    <Filter className="w-5 h-5 text-[var(--ink)] absolute left-3 top-2.5" />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-[var(--surface)] text-[var(--ink)] pl-10 pr-8 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="mentor">Mentors</option>
                        <option value="admin">Admins</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[var(--surface)] text-[var(--ink)] text-sm uppercase">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Joined</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[var(--ink)]">Loading...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-[var(--ink)]">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-[var(--surface)] transition-colors">
                                        <td className="px-6 py-4 font-medium text-[var(--ink)]">{user.name}</td>
                                        <td className="px-6 py-4 text-[var(--ink)]">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-[var(--brand)] text-[var(--brand)]' :
                                                user.role === 'mentor' ? 'bg-[var(--brand)] text-[var(--brand)]' :
                                                    'bg-[var(--success-muted)] text-[var(--success)]'
                                                }`}>
                                                {user.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--ink)] text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.role === 'student' && (
                                                    <button
                                                        onClick={() => openReassignModal(user)}
                                                        className="p-1.5 hover:bg-[var(--surface)] rounded-lg text-[var(--brand)] transition-colors"
                                                        title="Change Mentor"
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 hover:bg-[var(--surface)] rounded-lg text-[var(--brand)] transition-colors"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-1.5 hover:bg-[var(--surface)] rounded-lg text-[var(--danger)] transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[color:var(--overlay)] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] w-full max-w-md shadow-xl">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--line)]">
                            <h2 className="text-xl font-bold text-[var(--ink)]">
                                {modalMode === 'create' ? 'Add New User' : 'Edit User'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-[var(--ink)] hover:text-[var(--ink)]">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                                    {modalMode === 'create' ? 'Password' : 'New Password (Optional)'}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={modalMode === 'create'}
                                    className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--ink)] mb-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                >
                                    <option value="student">Student</option>
                                    <option value="mentor">Mentor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            {/* Role Specific Fields */}
                            {formData.role === 'student' && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--ink)] mb-1">USN (Optional)</label>
                                            <input
                                                type="text"
                                                name="usn"
                                                value={formData.usn}
                                                onChange={handleInputChange}
                                                className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--ink)] mb-1">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {formData.role === 'mentor' && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--ink)] mb-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleInputChange}
                                        className="w-full bg-[var(--surface)] text-[var(--ink)] px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-[var(--ink)] hover:text-[var(--ink)] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg font-medium transition-colors"
                                >
                                    {modalMode === 'create' ? 'Create User' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reassign Mentor Modal */}
            <ReassignMentorModal
                isOpen={showReassignModal}
                onClose={() => setShowReassignModal(false)}
                student={selectedStudent}
                token={token}
                onSuccess={fetchUsers}
            />
        </div>
    );
}

export default UserManagementPage;
