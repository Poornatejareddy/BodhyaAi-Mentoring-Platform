const express = require('express');
const http = require('http'); // <-- For Socket.IO
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // <-- 1. IMPORT CORS


// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatRoutes = require('./routes/chatRoutes'); // <-- IMPORT
const auditRoutes = require('./routes/auditRoutes'); // <-- IMPORT AUDIT ROUTES
const alertRoutes = require('./routes/alertRoutes'); // <-- IMPORT ALERT ROUTES
const interventionRoutes = require('./routes/interventionRoutes'); // <-- INTERVENTION ROUTES
const riskRoutes = require('./routes/riskRoutes'); // <-- RISK PREDICTION ROUTES
const cogRoutes = require('./routes/cogRoutes'); // <-- PERSONALITY/COG ROUTES
const llmRoutes = require('./routes/llmRoutes'); // <-- LLM ROUTES





// Import middleware
const { protect, authorize } = require('./middleware/authMiddleware');

// Import Socket.IO server
const { initializeSocket } = require('./socket/socketServer');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Create HTTP server (needed for Socket.IO)
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// --- USE MIDDLEWARE ---
app.use(cors()); // <-- 2. USE CORS MIDDLEWARE
app.use(express.json()); // Body parser middleware

// --- ROUTES ---
app.get('/', (req, res) => {
  res.send('BodhyaAI API is running...');
});

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/chat', chatRoutes); // <-- MOUNT THE NEW ROUTE
app.use('/api/audit', auditRoutes); // <-- MOUNT AUDIT ROUTES
app.use('/api/alerts', alertRoutes); // <-- MOUNT ALERT ROUTES
app.use('/api/interventions', interventionRoutes); // <-- MOUNT INTERVENTION ROUTES
app.use('/api/risk', riskRoutes); // <-- MOUNT RISK PREDICTION ROUTES
app.use('/api/personality', cogRoutes); // <-- MOUNT PERSONALITY/COG ROUTES
app.use('/api/llm', llmRoutes); // <-- MOUNT LLM ROUTES




// Protected test routes
app.get('/api/me', protect, (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});

app.get('/api/mentor-dashboard', protect, authorize('mentor', 'admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: `Welcome to the Mentor Dashboard, ${req.user.name}!`,
  });
});


const PORT = process.env.PORT || 5000;

// Use server.listen instead of app.listen (for Socket.IO)
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO ready for connections`);
});