import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatWindow from '../../components/ChatWindow';
import { MessageCircle, Search, User } from 'lucide-react';

const ChatListPage = () => {
    const { token, user } = useAuth();
    const { unreadMessagesCount } = useSocket();
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        fetchContacts();
    }, [token, user]);

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
                const res = await fetch('http://localhost:5000/api/mentors/me', {
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
                const res = await fetch('http://localhost:5000/api/students/my-profile', {
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
                const res = await fetch('http://localhost:5000/api/admin/users', {
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
                return 'text-red-600 bg-red-100';
            case 'MEDIUM':
                return 'text-yellow-600 bg-yellow-100';
            case 'LOW':
                return 'text-green-600 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-lg">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
                            <p className="text-sm text-gray-500">
                                {user.role === 'mentor' && `Chat with your ${contacts.length} mentees`}
                                {user.role === 'student' && 'Chat with your mentor'}
                                {user.role === 'admin' && `Chat with ${contacts.length} users`}
                            </p>
                        </div>
                    </div>
                    {unreadMessagesCount > 0 && (
                        <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                            {unreadMessagesCount} unread
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                    />
                </div>
            </div>

            {/* Contacts List */}
            <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center p-8">
                            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
                                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                        {contact.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-800 truncate">
                                                {contact.name}
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
                                        <p className="text-sm text-gray-500 capitalize">
                                            {contact.role}
                                            {contact.usn && ` • ${contact.usn}`}
                                            {contact.department && ` • ${contact.department}`}
                                        </p>
                                    </div>

                                    {/* Arrow Icon */}
                                    <svg
                                        className="w-5 h-5 text-gray-400"
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
