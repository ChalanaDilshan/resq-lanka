import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resq_lanka_secure_dev_jwt_secret_key_2026_swt';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user (Public can ONLY register as citizen or volunteer)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', phone, district } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Role Security: Public registration may NEVER grant administrative access
    const requestedRole = (role || 'citizen').toLowerCase();
    if (['administrator', 'coordinator', 'admin'].includes(requestedRole)) {
      return res.status(403).json({
        success: false,
        message:
          'Administrative and coordinator accounts cannot be registered publicly. They must be provisioned by an administrator.',
      });
    }

    if (!['citizen', 'volunteer'].includes(requestedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Public registration allows only 'citizen' or 'volunteer'.",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: requestedRole,
      phone: phone ? phone.trim() : '',
      district: district ? district.trim() : 'Ampara District',
    });

    const token = generateToken(newUser._id, newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: newUser.toSafeObject(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

/**
 * Log in with email and password
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Query user and explicitly include password for verification
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated.',
      });
    }

    return res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving user profile.',
    });
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};
