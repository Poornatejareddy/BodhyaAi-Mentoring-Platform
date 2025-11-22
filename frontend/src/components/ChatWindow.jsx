import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Send, X, Loader2 } from 'lucide-react';

const ChatWindow = ({ recipientId, recipientName, recipientRole, onClose }) => {
    const { token, user } = useAuth();
    const { socket, emitTypingStart, emitTypingStop } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Scroll to bottom when messages change
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Fetch chat history
    useEffect(() => {
        if (recipientId && token) {
            fetchChatHistory();
        }
    }, [recipientId, token]);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            // Only add if it's from the current conversation
            if (
                (message.sender._id === recipientId && message.receiver === user._id) ||
                (message.sender._id === user._id && message.receiver === recipientId)
            ) {
                setMessages((prev) => [...prev, message]);

                // Mark as read if it's from the recipient
                if (message.sender._id === recipientId) {
                    markMessagesAsRead();
                }
            }
        };

        const handleTyping = (data) => {
            if (data.senderId === recipientId) {
                setIsTyping(true);

                // Clear existing timeout
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Set timeout to hide typing indicator
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false);
                }, 3000);
            }
        };

        const handleStopTyping = (data) => {
            if (data.senderId === recipientId) {
                setIsTyping(false);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
            }
        };

        socket.on('new:message', handleNewMessage);
        socket.on('user:typing', handleTyping);
        socket.on('user:stop-typing', handleStopTyping);

        return () => {
            socket.off('new:message', handleNewMessage);
            socket.off('user:typing', handleTyping);
            socket.off('user:stop-typing', handleStopTyping);
        };
    }, [socket, recipientId, user]);

    const fetchChatHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/chat/history/${recipientId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data.data || []);

                // Mark messages as read
                await markMessagesAsRead();
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoading(false);
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await fetch(`http://localhost:5000/api/chat/mark-read/${recipientId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const res = await fetch('http://localhost:5000/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    receiverId: recipientId,
                    content: newMessage.trim(),
                }),
            });

            if (res.ok) {
                const data = await res.json();
                // Message will be added via socket listener
                setNewMessage('');
                emitTypingStop(recipientId, `${user._id}-${recipientId}`);
            } else {
                const errorData = await res.json();
                alert(errorData.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        // Emit typing indicator
        if (e.target.value.length > 0) {
            emitTypingStart(recipientId, `${user._id}-${recipientId}`);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Set timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                emitTypingStop(recipientId, `${user._id}-${recipientId}`);
            }, 2000);
        } else {
            emitTypingStop(recipientId, `${user._id}-${recipientId}`);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">{recipientName}</h3>
                    <p className="text-xs text-blue-100 capitalize">{recipientRole}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/20 rounded transition"
                    aria-label="Close chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
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
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <p className="font-medium">No messages yet</p>
                            <p className="text-sm">Start a conversation!</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg) => {
                            const isMine = msg.sender._id === user._id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-lg px-4 py-2 ${isMine
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {msg.content}
                                        </p>
                                        <div
                                            className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'
                                                }`}
                                        >
                                            <span>{formatTime(msg.createdAt)}</span>
                                            {isMine && msg.read && (
                                                <span className="ml-1">✓✓</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 rounded-lg px-4 py-3 max-w-[75%]">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.1s' }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form
                onSubmit={handleSendMessage}
                className="border-t border-gray-200 p-3 bg-white rounded-b-lg"
            >
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        {sending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
