import axios from 'axios';
import { API_AUTH_URL } from './apiConfig';

const AUTH_API_URL = API_AUTH_URL;
const TOKEN_KEY = 'resq_jwt_token';

// Set up initial Authorization header if token exists
const initialToken = localStorage.getItem(TOKEN_KEY);
if (initialToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * Register a new citizen or volunteer account
 */
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/register`, userData);
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Registration failed. Please check your inputs.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Log in with email and password
 */
export const loginUser = async ({ email, password }) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/login`, {
      email,
      password,
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Invalid email or password.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Verify 6-digit OTP code using temporary session token
 */
export const verifyOtp = async ({ tempToken, otp }) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/verify-otp`, {
      tempToken,
      otp,
    });
    if (response.data?.token) {
      setAuthToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Invalid or expired verification code.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Resend a new OTP code to user's email
 */
export const resendOtp = async ({ tempToken }) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/resend-otp`, {
      tempToken,
    });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Failed to resend verification code.';
    throw new Error(message, { cause: error });
  }
};

/**
 * Fetch authenticated user profile using stored JWT
 */
export const fetchCurrentUser = async () => {
  const token = getToken();
  if (!token) return null;

  try {
    setAuthToken(token);
    const response = await axios.get(`${AUTH_API_URL}/me`, {
      timeout: 4000,
    });
    return response.data?.user || null;
  } catch (error) {
    // If token expired or invalid, clear it
    if (error.response?.status === 401) {
      setAuthToken(null);
    }
    return null;
  }
};

/**
 * Log out user and clear stored credentials
 */
export const logoutUser = async () => {
  try {
    await axios.post(`${AUTH_API_URL}/logout`, {}, { timeout: 2000 });
  } catch {
    // Ignore network error during logout
  } finally {
    setAuthToken(null);
  }
};
