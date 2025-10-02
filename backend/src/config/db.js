// Import mongoose
const mongoose = require('mongoose');

// This is an async function because connecting to a DB returns a promise
const connectDB = async () => {
  try {
    // Get the MongoDB URI from environment variables
    const MONGO_URI = process.env.MONGO_URI;

    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected!');
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

// Export the function so we can use it elsewhere
module.exports = connectDB;