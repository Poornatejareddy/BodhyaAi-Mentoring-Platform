import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../../components/ChatWindow';
import { API_BASE_URL } from '../../utils/api';
import { MessageCircle, Search, User } from 'lucide-react';

const ChatListPage = () => {
    const { token, user } = useAuth();
    const { unreadMessagesCount } = useSocket();
    const location = useLocation();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, [token, user]);

    // Handle opening chat from notification click
    useEffect(() => {
        if (location.state?.openChatWith && contacts.length > 0) {
            const contactToOpen = contacts.find(c => c.id === location.state.openChatWith);
            if (contactToOpen) {
                setSelectedContact(contactToOpen);
            }
        }
    }, [location.state, contacts]);

    useEffect(() => {
        if (searchTerm) {
            setFilteredContacts(
                contacts.filter((contact) =>
                    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        } else {
            setFilteredContacts(contacts);
        }
    }, [searchTerm, contacts]);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            let endpoint = '';

            if (user.role === 'mentor') {
                // Fetch mentor's mentees
                const res = await fetch(`${API_BASE_URL}/mentors/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const menteesList = data.data.mentees.map((mentee) => ({
                        id: mentee.user._id,
                        name: mentee.user.name,
                        role: 'student',
                        usn: mentee.usn,
                        risk: mentee.academicRisk?.prediction || 'N/A',
                    }));
                    setContacts(menteesList);
                    setFilteredContacts(menteesList);
                }
            } else if (user.role === 'student') {
                // Fetch student's mentor
                const res = await fetch(`${API_BASE_URL}/students/my-profile`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.data.mentor) {
                        const mentorData = [{
                            id: data.data.mentor.user._id,
                            name: data.data.mentor.user.name,
                            role: 'mentor',
                            department: data.data.mentor.department || 'N/A',
                        }];
                        setContacts(mentorData);
                        setFilteredContacts(mentorData);
                    }
                }
            } else if (user.role === 'admin') {
                // Admins can chat with everyone - fetch all users
                const res = await fetch(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    const usersList = data.data
                        .filter((u) => u._id !== user._id)
                        .map((u) => ({
                            id: u._id,
                            name: u.name,
                            role: u.role,
                        }));
                    setContacts(usersList);
                    setFilteredContacts(usersList);
                }
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (risk) => {
        switch (risk?.toUpperCase()) {
            case 'HIGH':
                return 'text-[var(--danger)] bg-[var(--danger-muted)]';
            case 'MEDIUM':
                return 'text-[var(--warning)] bg-[var(--warning-muted)]';
            case 'LOW':
                return 'text-[var(--success)] bg-[var(--success-muted)]';
            default:
                return 'text-[var(--ink)] bg-[var(--surface)]';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-[var(--surface)] rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[var(--surface)]   p-3 rounded-lg">
                            <MessageCircle className="w-6 h-6 text-[var(--ink)]" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[var(--ink)]">Messages</h1>
                            <p className="text-sm text-[var(--ink)]">
                                {user.role === 'mentor' && `Chat with your ${contacts.length} mentees`}
                                {user.role === 'student' && 'Chat with your mentor'}
                                {user.role === 'admin' && `Chat with ${contacts.length} users`}
                            </p>
                        </div>
                    </div>
                    {unreadMessagesCount > 0 && (
                        <div className="bg-[var(--danger-muted)] text-[var(--ink)] px-4 py-2 rounded-full text-sm font-semibold">
                            {unreadMessagesCount} unread
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--ink)] w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[var(--line)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand)] text-[var(--ink)]"
                    />
                </div>
            </div>

            {/* Contacts List */}
            <div className="bg-[var(--surface)] rounded-lg shadow-sm flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand)]"></div>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[var(--ink)]">
                        <div className="text-center p-8">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-[var(--ink)]" />
                            <p className="font-medium text-lg">No contacts found</p>
                            <p className="text-sm">
                                {searchTerm
                                    ? 'Try a different search term'
                                    : user.role === 'student'
                                        ? 'You don\'t have an assigned mentor yet'
                                        : 'No mentees assigned yet'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 overflow-y-auto h-full">
                        {filteredContacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => setSelectedContact(contact)}
                                className="p-4 hover:bg-[var(--surface)] cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-[var(--surface)]   rounded-full flex items-center justify-center text-[var(--ink)] font-bold text-lg flex-shrink-0">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-[var(--ink)] truncate">
                                                {contact.name || 'Unknown User'}
                                            </h3>
                                            {contact.risk && (
                                                <span
                                                    className={`text-xs font-semibold px-2 py-1 rounded ${getRiskColor(
                                                        contact.risk
                                                    )}`}
                                                >
                                                    {contact.risk}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-[var(--ink)] capitalize">
                                            {contact.role}
                                            {contact.usn && ` • ${contact.usn}`}
                                            {contact.department && ` • ${contact.department}`}
                                        </p>
                                    </div>

                                    {/* Arrow Icon */}
                                    <svg
                                        className="w-5 h-5 text-[var(--ink)]"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Window */}
            {selectedContact && (
                <ChatWindow
                    recipientId={selectedContact.id}
                    recipientName={selectedContact.name}
                    recipientRole={selectedContact.role}
                    onClose={() => setSelectedContact(null)}
                />
            )}
        </div>
    );
};

export default ChatListPage;
