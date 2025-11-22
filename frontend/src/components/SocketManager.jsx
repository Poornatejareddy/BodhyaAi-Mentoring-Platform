import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/**
 * SocketManager - Handles Socket.IO connection lifecycle
 * Connects when user is authenticated, disconnects on logout
 */
const SocketManager = () => {
    const { user, token } = useAuth();
    const { connect, disconnect, connected } = useSocket();

    useEffect(() => {
        if (user && token) {
            // User is logged in, connect socket
            console.log('🔌 Connecting Socket.IO for user:', user.name);
            connect(token);
        } else {
            // User logged out, disconnect socket
            console.log('🔌 Disconnecting Socket.IO');
            disconnect();
        }
    }, [user, token]);

    useEffect(() => {
        if (connected) {
            console.log('✅ Socket.IO connected successfully');
        }
    }, [connected]);

    // This component doesn't render anything
    return null;
};

export default SocketManager;
