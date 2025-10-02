const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email' ],
  },
  password: {
    type: String,
    // Password is not required if using an OAuth provider in the future
    required: function() { return !this.googleId; },
    minlength: 6,
    select: false, // Prevents password from being sent in API responses
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    required: true,
  },
  isVerified: { // For potential email verification flows
    type: Boolean,
    default: false,
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// --- Mongoose Middleware ---
// Hash password before saving the user document
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// --- Mongoose Methods ---
// Method to compare entered password with the hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate and sign a JSON Web Token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

module.exports = mongoose.model('User', userSchema);