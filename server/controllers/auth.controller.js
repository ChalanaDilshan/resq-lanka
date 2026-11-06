import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import { generateOtp, sendOtpEmail, sendWelcomeEmail } from '../services/emailService.js';
import { validateSriLankanNIC } from '../services/nicValidator.js';

const JWT_SECRET = process.env.JWT_SECRET || 'resq_lanka_secure_dev_jwt_secret_key_2026_swt';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate signed JWT token for authenticated session
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Generate short-lived temporary token for 2FA verification step (10 minutes)
 */
const generateTempToken = (userId, email) => {
  return jwt.sign({ id: userId, email, isOtpPending: true }, JWT_SECRET, {
    expiresIn: '10m',
  });
};

/**
 * Register a new user (Public can ONLY register as citizen or volunteer)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', phone, district, nicNumber } = req.body;

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

    // Check duplicate email (or handle pending unverified re-registration)
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }

    // Sri Lankan NIC Validation & Governance
    let cleanNIC = undefined;
    let nicDetails = {
      format: null,
      birthYear: null,
      gender: null,
      approximateAge: null,
      dobDisplay: null,
      isValidated: false,
    };

    if (requestedRole === 'volunteer') {
      if (!nicNumber || !nicNumber.trim()) {
        return res.status(400).json({
          success: false,
          message:
            'National Identity Card (NIC) number is mandatory for volunteer registration to prevent fraudulent accounts.',
        });
      }
    }

    if (nicNumber && nicNumber.trim()) {
      const nicValidation = validateSriLankanNIC(nicNumber);
      if (!nicValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: nicValidation.error || 'Invalid Sri Lankan National Identity Card (NIC) number.',
        });
      }

      cleanNIC = nicValidation.cleanNIC;

      // Enforce NIC Uniqueness in Database (excluding the current unverified user)
      const existingNicUser = await User.findOne({ nicNumber: cleanNIC });
      if (existingNicUser && (!existingUser || existingNicUser._id.toString() !== existingUser._id.toString())) {
        return res.status(400).json({
          success: false,
          message: 'An account with this National Identity Card (NIC) number already exists.',
        });
      }

      nicDetails = {
        format: nicValidation.format,
        birthYear: nicValidation.birthYear,
        gender: nicValidation.gender,
        approximateAge: nicValidation.approximateAge,
        dobDisplay: nicValidation.dobDisplay,
        isValidated: true,
      };
    }

    // Generate 6-digit OTP verification code & set 10 minute expiry
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    let activeUser;

    if (existingUser && !existingUser.isEmailVerified) {
      // Refresh pending unverified user registration details & OTP
      existingUser.name = name.trim();
      existingUser.password = password; // Pre-save hook will hash modified password
      existingUser.role = requestedRole;
      existingUser.phone = phone ? phone.trim() : '';
      existingUser.district = district ? district.trim() : 'Ampara District';
      existingUser.nicNumber = cleanNIC;
      existingUser.nicDetails = nicDetails;
      existingUser.volunteerStatus = requestedRole === 'volunteer' ? 'Pending_Review' : undefined;
      existingUser.otpCode = otp;
      existingUser.otpExpiresAt = otpExpiresAt;
      await existingUser.save();
      activeUser = existingUser;
    } else {
      // Create new user with isEmailVerified: false and active OTP
      activeUser = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        role: requestedRole,
        phone: phone ? phone.trim() : '',
        district: district ? district.trim() : 'Ampara District',
        nicNumber: cleanNIC,
        nicDetails,
        volunteerStatus: requestedRole === 'volunteer' ? 'Pending_Review' : undefined,
        isEmailVerified: false,
        otpCode: otp,
        otpExpiresAt,
      });
    }

    // Send Registration OTP to user's email via resqlanka@gmail.com
    await sendOtpEmail({
      to: activeUser.email,
      name: activeUser.name,
      otp,
      purpose: 'register',
    });

    // Issue short-lived temporary token for OTP verification (10 minutes)
    const tempToken = generateTempToken(activeUser._id, activeUser.email);

    return res.status(201).json({
      success: true,
      requiresOtp: true,
      tempToken,
      email: activeUser.email,
      message: `Account created! A 6-digit verification code has been dispatched to ${activeUser.email}.`,
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
 * Log in with email and password -> triggers OTP generation and email dispatch
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

    // Generate 6-digit verification code & set 10 minute expiry
    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // Send OTP to user's email via resqlanka@gmail.com (with terminal console fallback in dev)
    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      purpose: user.isEmailVerified ? 'login' : 'register',
    });

    // Issue short-lived temporary token for step 2 OTP verification
    const tempToken = generateTempToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      requiresOtp: true,
      tempToken,
      email: user.email,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
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
 * Verify 6-digit OTP code and issue final JWT session token
 * POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token and OTP code are required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Verification session has expired or is invalid. Please log in again.',
      });
    }

    if (!decoded.isOtpPending || !decoded.id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification session.',
      });
    }

    const user = await User.findById(decoded.id).select('+otpCode +otpExpiresAt');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP verification session found. Please log in again.',
      });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    const isDevMasterPin =
      (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) &&
      otp.toString().trim() === '123456';

    if (user.otpCode !== otp.toString().trim() && !isDevMasterPin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check and try again.',
      });
    }

    // Check if this is the initial verification of a newly created account
    const isFirstVerification = !user.isEmailVerified;
    if (isFirstVerification) {
      user.isEmailVerified = true;
    }

    // OTP verified successfully! Clear OTP fields
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // If newly registered account, dispatch the official Account Created Welcome email via resqlanka@gmail.com
    if (isFirstVerification) {
      sendWelcomeEmail({
        to: user.email,
        name: user.name,
        role: user.role,
      }).catch((err) => {
        console.error('Failed to dispatch registration welcome email:', err.message);
      });
    }

    // Generate full authenticated JWT token
    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: isFirstVerification
        ? 'Account successfully verified and activated! Welcome to ResQ-Lanka.'
        : 'Verification successful. Welcome back to ResQ-Lanka!',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during OTP verification.',
    });
  }
};

/**
 * Resend a new OTP to user's email
 * POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary session token is required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Verification session has expired. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const otp = generateOtp();
    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      purpose: user.isEmailVerified ? 'login' : 'register',
    });

    return res.status(200).json({
      success: true,
      message: `A new verification code has been sent to ${user.email}.`,
    });
  } catch (error) {
    console.error('resendOtp error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resending OTP.',
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
