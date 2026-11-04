/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  logoutUser,
  verifyOtp,
  resendOtp,
} from '../services/authService';

const AuthContext = createContext(null);

const ROLE_CONFIGS = {
  citizen: {
    key: 'citizen',
    label: 'Citizen',
    tagline: 'Report & Get Help',
    description:
      'Disaster-affected citizen seeking emergency rescue, food, or safe shelter.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  volunteer: {
    key: 'volunteer',
    label: 'Volunteer',
    tagline: 'Join & Support',
    description:
      'Community volunteer assisting with relief logistics, search & rescue, and aid distribution.',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  administrator: {
    key: 'administrator',
    label: 'Administrator',
    tagline: 'Manage & Coordinate',
    description:
      'Disaster coordinator & system admin managing shelter occupancy, supply inventory, and emergency response.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
  // Legacy coordinator alias mapped to administrator styling
  coordinator: {
    key: 'administrator',
    label: 'Administrator / Coordinator',
    tagline: 'Manage & Coordinate',
    description:
      'Disaster coordinator / Shelter admin managing supply inventory, needs, and pledges.',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    badgeClass: 'bg-emerald-100 text-emerald-800',
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load and verify existing session on initial load
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        if (isMounted) {
          setUser(currentUser || null);
        }
      } catch (err) {
        console.warn('Could not restore auth session:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Real backend login - handles OTP flow and direct login
   */
  const login = async (email, password) => {
    const result = await loginUser({ email, password });
    if (result.requiresOtp) {
      return result;
    }
    if (result.user) {
      setUser(result.user);
      return result;
    }
    throw new Error('Login failed: user data missing from server response.');
  };

  /**
   * Verify OTP code and activate authenticated session
   */
  const verifyOtpCode = async (tempToken, otp) => {
    const result = await verifyOtp({ tempToken, otp });
    if (result.user) {
      setUser(result.user);
      return result.user;
    }
    throw new Error('Verification failed: user data missing from server response.');
  };

  /**
   * Request resending a fresh OTP code
   */
  const resendOtpCode = async (tempToken) => {
    return await resendOtp({ tempToken });
  };

  /**
   * Real backend registration (citizen or volunteer)
   */
  const register = async (userData) => {
    const result = await registerUser(userData);
    if (result.user) {
      setUser(result.user);
      return result.user;
    }
    throw new Error('Registration failed: user data missing from server response.');
  };

  /**
   * Real backend logout
   */
  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  /**
   * Fast authentic account switch
   * Performs genuine backend JWT authentication with seeded verified accounts.
   */
  const switchAccount = async (targetRole) => {
    let email = 'citizen@resqlanka.lk';
    let password = 'password123';
    if (targetRole === 'administrator' || targetRole === 'coordinator') {
      email = 'admin@resqlanka.lk';
      password = 'Admin@ResQ2026!';
    } else if (targetRole === 'volunteer') {
      email = 'volunteer@resqlanka.lk';
      password = 'password123';
    }
    return await login(email, password);
  };

  // Canonical role strictly determined by authentic logged-in user profile
  const activeRole = user?.role === 'coordinator' ? 'administrator' : (user?.role || 'citizen');

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        activeRole,
        roleConfig: ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.citizen,
        login,
        verifyOtp: verifyOtpCode,
        resendOtp: resendOtpCode,
        register,
        logout,
        switchAccount,
        switchRole: switchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
