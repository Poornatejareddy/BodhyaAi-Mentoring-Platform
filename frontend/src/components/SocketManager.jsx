import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

/**
 * SocketManager - Handles Socket.IO connection lifecycle
 * Connects when user is authenticated, disconnects on logout
 */
const SocketManager = () => {
    const { user, token } = useAuth();
    const { connect, disconnect } = useSocket();

    useEffect(() => {
        if (!user || !token) {
            disconnect();
            return undefined;
        }

        // Delay the initial connection by one task. Strict Mode cleans up its
        // development-only first effect before this runs, preventing a duplicate
        // connection from appearing on the server or in the browser console.
        const connectTimer = window.setTimeout(() => connect(token), 0);

        return () => {
            window.clearTimeout(connectTimer);
            disconnect();
        };
    }, [user, token, connect, disconnect]);

    // This component doesn't render anything
    return null;
};

export default SocketManager;
