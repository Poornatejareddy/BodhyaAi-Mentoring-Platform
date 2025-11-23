const User = require('../models/User');
const Student = require('../models/Student'); // <-- IMPORT
const Mentor = require('../models/Mentor');   // <-- IMPORT

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, usn, department, section } = req.body;

    // 1. Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // 2. Create a new user
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    // 3. Create the role-specific profile linked to the new user
    if (user.role === 'student') {
      if (!usn || !department || !section) {
        // Rollback user creation if student details are missing
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Please provide USN, Department, and Section' });
      }
      await Student.create({
        user: user._id,
        name: user.name, // Student model requires name
        usn,
        department,
        section
      });
    } else if (user.role === 'mentor') {
      if (!department) {
        // Rollback
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ success: false, message: 'Please provide Department' });
      }
      await Mentor.create({ user: user._id, department });
    } else if (user.role === 'admin') {
      // You can add admin profile creation here if needed
      // await Admin.create({ user: user._id });
    }

    // 4. Generate a token and send the response
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, userId: user._id });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // 2. Check if user exists and get password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. Generate a token and send the response
    const token = user.getSignedJwtToken();
    res.status(200).json({ success: true, token });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};