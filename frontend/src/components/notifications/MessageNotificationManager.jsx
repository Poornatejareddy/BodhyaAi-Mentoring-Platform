import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MessageNotification from '../MessageNotification';

function MessageNotificationManager() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            console.log('New message received:', message); // Debug log

            // Skip AI messages - don't show notifications for AI chatbot
            if (message.senderRole === 'ai' || message.receiverRole === 'ai') {
                console.log('Skipping AI message notification');
                return;
            }

            // Add notification to queue
            const notification = {
                id: message._id || Date.now(),
                senderName: message.sender?.name || 'Unknown',
                content: message.content,
                senderId: message.sender?._id || message.sender,
            };

            setNotifications((prev) => [...prev, notification]);
        };

        socket.on('new:message', handleNewMessage);

        return () => {
            socket.off('new:message', handleNewMessage);
        };
    }, [socket]);

    const handleNotificationClick = (notification) => {
        // Navigate to role-based chat route and pass sender ID to open that chat
        const chatRoute = `/dashboard/${user.role}/chat`;
        navigate(chatRoute, { state: { openChatWith: notification.senderId } });
        removeNotification(notification.id);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <div className="fixed top-0 right-0 z-50 pointer-events-none">
            <div className="flex flex-col gap-2 p-4 pointer-events-auto">
                {notifications.map((notification, index) => (
                    <MessageNotification
                        key={notification.id}
                        message={notification}
                        onClose={() => removeNotification(notification.id)}
                        onClick={() => handleNotificationClick(notification)}
                    />
                ))}
            </div>
        </div>
    );
}

export default MessageNotificationManager;
