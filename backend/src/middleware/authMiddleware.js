const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes and verify the JWT
exports.protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header exists and is formatted correctly
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from the "Bearer <token>" string
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure the token exists
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by the ID from the token's payload
    // and attach the user object to the request (excluding the password)
    req.user = await User.findById(decoded.id).select('-password');
    
    // Proceed to the next middleware or the route handler
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};


// Middleware to grant access based on user role
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role (attached in the 'protect' middleware)
    // is included in the roles allowed for this route
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};