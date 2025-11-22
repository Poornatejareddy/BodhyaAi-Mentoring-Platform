import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [connected, setConnected] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    // Initialize socket connection
    const connect = (token) => {
        if (socket) {
            return; // Already connected
        }

        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
                token: token,
            },
            transports: ['websocket', 'polling'],
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket.IO connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket.IO disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error.message);
            setConnected(false);
        });

        // Listen for new alerts
        newSocket.on('new:alert', (alert) => {
            console.log('🔔 New alert received:', alert);
            setAlerts((prev) => [alert, ...prev]);
            setUnreadAlertsCount((prev) => prev + 1);

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(alert.title, {
                    body: alert.message,
                    icon: '/logo.png',
                    badge: '/logo.png',
                });
            }
        });

        // Listen for new messages
        newSocket.on('new:message', (message) => {
            console.log('💬 New message received:', message);
            setUnreadMessagesCount((prev) => prev + 1);

            // Show browser notification if permitted
            if (Notification.permission === 'granted') {
                new Notification(`New message from ${message.sender?.name}`, {
                    body: message.content,
                    icon: '/logo.png',
                });
            }
        });

        // Listen for typing indicators
        newSocket.on('user:typing', (data) => {
            console.log('⌨️ User typing:', data);
            // Can be handled in chat components
        });

        newSocket.on('user:stop-typing', (data) => {
            console.log('⌨️ User stopped typing:', data);
            // Can be handled in chat components
        });

        setSocket(newSocket);
    };

    // Disconnect socket
    const disconnect = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setConnected(false);
            setAlerts([]);
            setUnreadAlertsCount(0);
            setUnreadMessagesCount(0);
        }
    };

    // Emit typing start
    const emitTypingStart = (recipientId, chatId) => {
        if (socket && connected) {
            socket.emit('typing:start', { recipientId, chatId });
        }
    };

    // Emit typing stop
    const emitTypingStop = (recipientId, chatId) => {
        if (socket && connected) {
            socket.emit('typing:stop', { recipientId, chatId });
        }
    };

    // Clear alert from local state
    const clearAlert = (alertId) => {
        setAlerts((prev) => prev.filter((alert) => alert._id !== alertId));
        setUnreadAlertsCount((prev) => Math.max(0, prev - 1));
    };

    // Clear all alerts
    const clearAllAlerts = () => {
        setAlerts([]);
        setUnreadAlertsCount(0);
    };

    // Request notification permission on mount
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
                console.log('Notification permission:', permission);
            });
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, [socket]);

    const value = {
        socket,
        connected,
        connect,
        disconnect,
        alerts,
        unreadAlertsCount,
        unreadMessagesCount,
        setUnreadMessagesCount,
        emitTypingStart,
        emitTypingStop,
        clearAlert,
        clearAllAlerts,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
