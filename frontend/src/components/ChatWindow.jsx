import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { API_BASE_URL } from '../utils/api';
import { Send, X, Loader2, MoreVertical, Edit2, Trash2, Check, XCircle } from 'lucide-react';

const ChatWindow = ({ recipientId, recipientName, recipientRole, onClose }) => {
    const { token, user } = useAuth();
    const { socket, emitTypingStart, emitTypingStop } = useSocket();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [showDropdown, setShowDropdown] = useState(null);
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

    // Listen for new messages from socket (ONLY for human chats)
    useEffect(() => {
        if (!socket || !recipientId) return;

        const handleNewMessage = (message) => {
            console.log('ChatWindow received message:', message);

            // Extract IDs from sender/receiver (they might be objects or strings)
            const messageSenderId = message.sender?._id || message.sender;
            const messageReceiverId = message.receiver?._id || message.receiver;
            const currentUserId = user._id;

            // Check if this message is part of this conversation
            const isPartOfConversation =
                (messageSenderId === recipientId && messageReceiverId === currentUserId) ||  // From recipient to me
                (messageSenderId === currentUserId && messageReceiverId === recipientId);   // From me to recipient

            console.log('Message check:', {
                messageSenderId,
                messageReceiverId,
                currentUserId,
                recipientId,
                isPartOfConversation
            });

            if (isPartOfConversation) {
                setMessages((prev) => {
                    // Check if message already exists (avoid duplicates)
                    const exists = prev.some(m => m._id === message._id);
                    if (exists) {
                        console.log('Message already exists, skipping');
                        return prev;
                    }
                    console.log('Adding message to chat');
                    return [...prev, message];
                });

                // Mark as read if the message is from the recipient
                if (messageSenderId === recipientId) {
                    markMessagesAsRead();
                }
            } else {
                console.log('Message not part of this conversation');
            }
        };

        const handleTyping = (data) => {
            if (data.senderId === recipientId) {
                setIsTyping(true);

                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

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
    }, [socket, recipientId, user, recipientRole]);

    // Socket.IO listeners for edit/delete
    useEffect(() => {
        if (!socket) return;

        const handleMessageEdit = (editedMessage) => {
            console.log('Message edited:', editedMessage);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === editedMessage._id ? editedMessage : msg
                )
            );
        };

        const handleMessageDelete = (messageId) => {
            console.log('Message deleted:', messageId);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, content: 'This message was deleted', deleted: true }
                        : msg
                )
            );
        };

        socket.on('message:edited', handleMessageEdit);
        socket.on('message:deleted', handleMessageDelete);

        return () => {
            socket.off('message:edited', handleMessageEdit);
            socket.off('message:deleted', handleMessageDelete);
        };
    }, [socket]);

    const fetchChatHistory = async () => {
        console.log('=== FETCHING CHAT HISTORY ===');
        console.log('Recipient ID:', recipientId);
        console.log('Recipient Role:', recipientRole);

        setLoading(true);
        try {
            // For AI → skip fetching history (optional)
            if (recipientRole === "ai") {
                console.log('AI chat - skipping history');
                setMessages([]);
                setLoading(false);
                return;
            }

            const url = `${API_BASE_URL}/chat/history/${recipientId}`;
            console.log('Fetching from:', url);

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('Chat history response:', data);
                console.log('Number of messages:', data.data?.length || 0);

                if (data.data && data.data.length > 0) {
                    console.log('First message:', data.data[0]);
                }

                setMessages(data.data || []);
                await markMessagesAsRead();
            } else {
                console.error('Failed to fetch chat history:', res.status, await res.text());
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        } finally {
            setLoading(false);
            console.log('=== CHAT HISTORY FETCH COMPLETE ===');
        }
    };

    const markMessagesAsRead = async () => {
        if (recipientRole === "ai") return; // AI does not have read receipts

        try {
            await fetch(`${API_BASE_URL}/chat/mark-read/${recipientId}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    // Handler for editing a message
    const handleEditMessage = async (messageId) => {
        try {
            const res = await fetch(`${API_BASE_URL}/chat/edit/${messageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ content: editedContent }),
            });

            if (res.ok) {
                const data = await res.json();
                setMessages((prev) =>
                    prev.map((msg) => (msg._id === messageId ? data.data : msg))
                );
                setEditingMessageId(null);
                setEditedContent('');
            }
        } catch (error) {
            console.error('Error editing message:', error);
        }
    };

    // Handler for deleting a message
    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const res = await fetch(`${API_BASE_URL}/chat/delete/${messageId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId
                            ? { ...msg, content: 'This message was deleted', deleted: true }
                            : msg
                    )
                );
                setShowDropdown(null);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    // ⭐ UPDATED: AI chat uses /api/chat/ai-chat
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        const text = newMessage.trim();

        setSending(true);

        try {
            let url = "";
            let body = {};

            if (recipientRole === "ai") {
                // AI chatbot endpoint
                url = `${API_BASE_URL}/chat/ai-chat`;
                body = {
                    message: text,
                    userId: user._id,
                };
            } else {
                // Normal user-to-user chat
                url = `${API_BASE_URL}/chat/send`;
                body = {
                    receiverId: recipientId,
                    content: text,
                };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errorData = await res.json();
                alert(errorData.message || "Failed to send message");
                return;
            }

            const data = await res.json();
            setNewMessage("");

            // For AI chat → we manually insert both messages
            if (recipientRole === "ai") {
                // User message
                setMessages((prev) => [
                    ...prev,
                    {
                        _id: Date.now() + "-user",
                        sender: { _id: user._id },
                        receiver: "ai-bot",
                        content: text,
                        createdAt: new Date().toISOString(),
                        read: true,
                    },
                ]);

                // AI reply
                setMessages((prev) => [
                    ...prev,
                    {
                        _id: Date.now() + "-ai",
                        sender: { _id: "ai-bot" },
                        receiver: user._id,
                        content: data.reply,
                        createdAt: new Date().toISOString(),
                        read: true,
                    },
                ]);
            } else {
                // For human chat → add message to UI immediately
                setMessages((prev) => [
                    ...prev,
                    {
                        ...data.data,
                        sender: { _id: user._id, name: user.name },
                    },
                ]);

                // Stop typing
                emitTypingStop(recipientId, `${user._id}-${recipientId}`);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (e) => {
        setNewMessage(e.target.value);

        if (recipientRole === "ai") return; // AI doesn’t use typing indicators

        if (e.target.value.length > 0) {
            emitTypingStart(recipientId, `${user._id}-${recipientId}`);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

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
        }

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-[var(--surface)] rounded-lg shadow-2xl border border-[var(--line)] flex flex-col z-50">

            {/* Header */}
            <div className="bg-[var(--surface)]   text-[var(--ink)] p-4 rounded-t-lg flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">{recipientName}</h3>
                    <p className="text-xs text-[var(--brand)] capitalize">{recipientRole}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-[var(--surface)] rounded transition"
                    aria-label="Close chat"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--surface)]">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand)]" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-[var(--ink)]">
                        <div className="text-center">
                            <svg
                                className="w-16 h-16 mx-auto mb-4 text-[var(--ink)]"
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
                        {console.log('Rendering messages:', messages.length)}
                        {messages.map((msg) => {
                            const messageSenderId = String(msg.sender?._id || msg.sender);
                            const currentUserId = String(user._id);
                            const isMine = messageSenderId === currentUserId;
                            const senderName = msg.sender?.name || recipientName;

                            return (
                                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] relative group`}>
                                        {/* Sender name for received messages */}
                                        {!isMine && (
                                            <p className="text-xs text-[var(--ink)] mb-1 ml-2 font-medium">
                                                {senderName}
                                            </p>
                                        )}

                                        <div
                                            className={`rounded-lg px-4 py-2 ${isMine
                                                    ? 'bg-[var(--surface)]   text-[var(--ink)] shadow-md'
                                                    : 'bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] shadow-sm'
                                                } ${msg.deleted ? 'italic opacity-60' : ''}`}
                                        >
                                            {/* Edit/Delete Menu - only for own messages */}
                                            {isMine && !msg.deleted && (
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setShowDropdown(showDropdown === msg._id ? null : msg._id)}
                                                        className="p-1 hover:bg-[var(--surface)] rounded"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {showDropdown === msg._id && (
                                                        <div className="absolute right-0 mt-1 bg-[var(--surface)] text-[var(--ink)] rounded shadow-lg border z-10 min-w-[120px]">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingMessageId(msg._id);
                                                                    setEditedContent(msg.content);
                                                                    setShowDropdown(null);
                                                                }}
                                                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[var(--surface)] text-sm"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleDeleteMessage(msg._id);
                                                                    setShowDropdown(null);
                                                                }}
                                                                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-[var(--surface)] text-sm text-[var(--danger)]"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Message Content - editable or normal */}
                                            {editingMessageId === msg._id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editedContent}
                                                        onChange={(e) => setEditedContent(e.target.value)}
                                                        className="flex-1 bg-[var(--surface)] border border-[var(--line)] rounded px-2 py-1 text-sm text-[var(--ink)]"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleEditMessage(msg._id)}
                                                        className="p-1 hover:bg-[var(--surface)] rounded"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingMessageId(null);
                                                            setEditedContent('');
                                                        }}
                                                        className="p-1 hover:bg-[var(--surface)] rounded"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                                            )}

                                            <div
                                                className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-[var(--brand)]' : 'text-[var(--ink)]'
                                                    }`}
                                            >
                                                <span>{formatTime(msg.createdAt)}</span>
                                                {msg.edited && <span className="ml-1">(edited)</span>}
                                                {isMine && msg.read && <span className="ml-1">✓✓</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-[var(--surface)] rounded-lg px-4 py-3 max-w-[75%]">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-[var(--surface)] rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-[var(--surface)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-[var(--surface)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-[var(--line)] p-3 bg-[var(--surface)] rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-[var(--line)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent text-[var(--ink)]"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-[var(--brand)] text-[var(--ink)] p-2 rounded-full hover:bg-[var(--brand)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                    >
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatWindow;
