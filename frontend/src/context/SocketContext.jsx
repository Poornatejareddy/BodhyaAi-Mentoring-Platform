import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../utils/api';

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
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [alerts, setAlerts] = useState([]);
    const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

    // Initialize socket connection
    const connect = useCallback((token) => {
        if (!token || socketRef.current) {
            return socketRef.current;
        }

        const newSocket = io(SOCKET_URL, {
            auth: {
                token: token,
            },
            transports: ['websocket', 'polling'],
        });
        // State updates are asynchronous; the ref prevents a second socket from
        // being created during React Strict Mode's development effect replay.
        socketRef.current = newSocket;

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
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
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
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
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
        return newSocket;
    }, []);

    // Disconnect socket
    const disconnect = useCallback(() => {
        const activeSocket = socketRef.current;
        if (activeSocket) {
            socketRef.current = null;
            activeSocket.disconnect();
            setSocket(null);
            setConnected(false);
            setAlerts([]);
            setUnreadAlertsCount(0);
            setUnreadMessagesCount(0);
        }
    }, []);

    const requestNotificationPermission = useCallback(async () => {
        if (typeof Notification === 'undefined') {
            return 'unsupported';
        }

        if (Notification.permission !== 'default') {
            return Notification.permission;
        }

        return Notification.requestPermission();
    }, []);

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

    // Cleanup on unmount
    useEffect(() => {
        return disconnect;
    }, [disconnect]);

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
        requestNotificationPermission,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
