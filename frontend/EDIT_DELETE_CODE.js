// Add inside ChatWindow component after line 20

// Handler functions for edit/delete
const handleEditMessage = async (messageId) => {
    try {
        const res = await fetch(`http://localhost:5000/api/chat/edit/${messageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: editedContent }),
        });

        if (res.ok) {
            const data = await res.json();
            // Update local messages
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

const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    try {
        const res = await fetch(`http://localhost:5000/api/chat/delete/${messageId}`, {
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
        }
    } catch (error) {
        console.error('Error deleting message:', error);
    }
};

// Socket.IO listeners - add in useEffect after line 110
useEffect(() => {
    if (!socket) return;

    // Listen for message edits
    const handleMessageEdit = (editedMessage) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg._id === editedMessage._id ? editedMessage : msg
            )
        );
    };

    // Listen for message deletions
    const handleMessageDelete = (messageId) => {
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

// REPLACE MESSAGE RENDERING (around line 370) with this:
{
    messages.map((msg) => {
        const messageSenderId = String(msg.sender?._id || msg.sender);
        const currentUserId = String(user._id);
        const isMine = messageSenderId === currentUserId;
        const senderName = msg.sender?.name || recipientName;

        return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] relative group`}>
                    {!isMine && (
                        <p className="text-xs text-gray-600 mb-1 ml-2 font-medium">
                            {senderName}
                        </p>
                    )}

                    <div
                        className={`rounded-lg px-4 py-2 ${isMine
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                            } ${msg.deleted ? 'italic opacity-60' : ''}`}
                    >
                        {/* Edit/Delete Menu - only for own messages */}
                        {isMine && !msg.deleted && (
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setShowDropdown(showDropdown === msg._id ? null : msg._id)}
                                    className="p-1 hover:bg-white/20 rounded"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>

                                {showDropdown === msg._id && (
                                    <div className="absolute right-0 mt-1 bg-white text-gray-800 rounded shadow-lg border z-10 min-w-[120px]">
                                        <button
                                            onClick={() => {
                                                setEditingMessageId(msg._id);
                                                setEditedContent(msg.content);
                                                setShowDropdown(null);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleDeleteMessage(msg._id);
                                                setShowDropdown(null);
                                            }}
                                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100 text-sm text-red-600"
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
                                    className="flex-1 bg-white/20 border border-white/40 rounded px-2 py-1 text-sm"
                                    autoFocus
                                />
                                <button
                                    onClick={() => handleEditMessage(msg._id)}
                                    className="p-1 hover:bg-white/20 rounded"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingMessageId(null);
                                        setEditedContent('');
                                    }}
                                    className="p-1 hover:bg-white/20 rounded"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        )}

                        <div
                            className={`flex items-center gap-1 mt-1 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'
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
    })
}
