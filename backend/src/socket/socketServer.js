const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io; // Global IO instance

/**
 * Initialize Socket.IO server
 * @param {Server} server - HTTP server instance
 * @returns {SocketIO} io instance
 */
const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: No token provided'));
            }

            // Verify JWT token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            // Attach user to socket
            socket.user = user;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    // Handle socket connections
    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.name} (${socket.user.role}) - Socket ID: ${socket.id}`);

        // Join user-specific room (for targeted notifications)
        socket.join(`user:${socket.user._id}`);

        // Also join role-specific room
        socket.join(`role:${socket.user.role}`);

        // Handle typing events for chat
        socket.on('typing:start', (data) => {
            // Broadcast to the recipient
            if (data.recipientId) {
                socket.to(`user:${data.recipientId}`).emit('user:typing', {
                    userId: socket.user._id,
                    userName: socket.user.name,
                    chatId: data.chatId,
                });
            }
        });

        socket.on('typing:stop', (data) => {
            if (data.recipientId) {
                socket.to(`user:${data.recipientId}`).emit('user:stop-typing', {
                    userId: socket.user._id,
                    chatId: data.chatId,
                });
            }
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.name} - Socket ID: ${socket.id}`);
        });

        // Test event (for debugging)
        socket.on('ping', () => {
            socket.emit('pong', { message: 'Socket.IO is working!' });
        });
    });

    console.log('🔌 Socket.IO initialized successfully');
    return io;
};

/**
 * Get the IO instance (must call initializeSocket first)
 * @returns {SocketIO} io instance
 */
const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO not initialized. Call initializeSocket first.');
    }
    return io;
};

/**
 * Emit an alert to a specific user
 * @param {String} userId - User ID to send alert to
 * @param {Object} alert - Alert object
 */
const emitAlertToUser = (userId, alert) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return;
    }

    io.to(`user:${userId}`).emit('new:alert', alert);
    console.log(`📢 Alert emitted to user ${userId}:`, alert.title);
};

/**
 * Emit a new message notification
 * @param {String} userId - User ID to send notification to
 * @param {Object} message - Message object
 */
const emitMessageToUser = (userId, message) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return;
    }

    io.to(`user:${userId}`).emit('new:message', message);
    console.log(`💬 Message emitted to user ${userId}`);
};

/**
 * Emit to all users with a specific role
 * @param {String} role - User role (student, mentor, admin)
 * @param {String} event - Event name
 * @param {Object} data - Data to emit
 */
const emitToRole = (role, event, data) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return;
    }

    io.to(`role:${role}`).emit(event, data);
    console.log(`📡 Event "${event}" emitted to role: ${role}`);
};

/**
 * Emit message edit event
 * @param {String} userId - User ID to send update to
 * @param {Object} message - Updated message object
 */
const emitMessageEdit = (userId, message) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return;
    }

    io.to(`user:${userId}`).emit('message:edited', message);
    console.log(`✏️ Message edit emitted to user ${userId}`);
};

/**
 * Emit message delete event
 * @param {String} userId - User ID to send update to
 * @param {String} messageId - ID of deleted message
 */
const emitMessageDelete = (userId, messageId) => {
    if (!io) {
        console.error('Socket.IO not initialized');
        return;
    }

    io.to(`user:${userId}`).emit('message:deleted', messageId);
    console.log(`🗑️ Message delete emitted to user ${userId}`);
};

module.exports = {
    initializeSocket,
    getIO,
    emitAlertToUser,
    emitMessageToUser,
    emitToRole,
    emitMessageEdit,
    emitMessageDelete,
};
