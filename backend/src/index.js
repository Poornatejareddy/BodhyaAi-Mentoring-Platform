const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors'); // <-- 1. IMPORT CORS


// Import route files
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const mentorRoutes = require('./routes/mentorRoutes');
const adminRoutes = require('./routes/adminRoutes');


// Import middleware
const { protect, authorize } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});