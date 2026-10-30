import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Users,
  ShieldAlert,
  Building2,
  CheckCircle2,
  AlertCircle,
  Phone,
  MapPin,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import ResQLogo from '../../components/shared/ResQLogo';
import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOtp, resendOtp, register } = useAuth();

  // Mode: derived directly from current route URL
  const mode = location.pathname === '/register' ? 'register' : 'login';
  const isEmergencyRedirect = location.state?.from?.pathname === '/sos';

  // OTP Verification Step State
  const [otpStep, setOtpStep] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Ampara District');
  const [registerRole, setRegisterRole] = useState('citizen');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const loggedUserIsAdmin = (u) =>
    u.role === 'administrator' || u.role === 'coordinator';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const loginResponse = await login(email, password);

        // If backend requires 2FA OTP verification
        if (loginResponse.requiresOtp) {
          setTempToken(loginResponse.tempToken);
          setOtpStep(true);
          setResendCooldown(60);
          setSuccessMessage(
            `Security verification code sent to ${loginResponse.email || email}.`
          );
          return;
        }

        // Direct login fallback
        const loggedInUser = loginResponse.user || loginResponse;
        setSuccessMessage(`Welcome back, ${loggedInUser.name}.`);

        setTimeout(() => {
          const redirect =
            location.state?.from?.pathname ||
            (loggedInUser.role === 'administrator' || loggedUserIsAdmin(loggedInUser)
              ? '/coordinator'
              : loggedInUser.role === 'volunteer'
              ? '/supplies'
              : '/sos');
          navigate(redirect);
        }, 500);
      } else {
        // Register mode
        const registeredUser = await register({
          name,
          email,
          password,
          role: registerRole,
          phone,
          district,
        });

        setSuccessMessage(
          `Account created successfully. Welcome, ${registeredUser.name}.`
        );

        setTimeout(() => {
          if (registeredUser.role === 'volunteer') {
            navigate('/supplies');
          } else {
            const redirect = location.state?.from?.pathname || '/sos';
            navigate(redirect);
          }
        }, 500);
      }
    } catch (err) {
      console.error('Auth operation failed:', err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Please verify your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const verifiedUser = await verifyOtp(tempToken, otpCode.trim());
      setSuccessMessage(`Verified. Welcome back, ${verifiedUser.name}.`);

      setTimeout(() => {
        const target = location.state?.from?.pathname;
        if (target) {
          navigate(target);
        } else if (
          verifiedUser.role === 'administrator' ||
          loggedUserIsAdmin(verifiedUser)
        ) {
          navigate('/coordinator');
        } else if (verifiedUser.role === 'volunteer') {
          navigate('/supplies');
        } else {
          navigate('/sos');
        }
      }, 500);
    } catch (err) {
      console.error('OTP verification failed:', err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Invalid or expired verification code. Please check and retry.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !tempToken) return;
    setIsResending(true);
    setErrorMessage(null);
    try {
      const res = await resendOtp(tempToken);
      setSuccessMessage(
        res?.message || 'A fresh verification code has been dispatched to your email.'
      );
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Could not resend verification code. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-slate-100">
      {/* =========================================================================
          LEFT SIDE: CIVIC DISASTER RELIEF SYSTEM OVERVIEW
         ========================================================================= */}
      <aside
        aria-label="Disaster Relief Network Overview"
        className="relative lg:w-1/2 min-h-[440px] lg:min-h-auto flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white overflow-hidden bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800"
      >
        {/* Disaster Relief Photo Background - Prominently Visible */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroDisasterBg})` }}
        />
        {/* Protective Gradient Overlay ensuring image is clearly visible while keeping text crisp */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/65 to-slate-900/40" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />

        {/* Content Top */}
        <div className="relative z-20 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-white/20 text-xs font-semibold">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>Sri Lanka Community Disaster Relief Coordination</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
            ResQ-Lanka Secure Access
          </h1>

          <p className="text-sm text-slate-100 leading-relaxed drop-shadow-sm">
            Unified access portal for citizens in affected districts, certified relief volunteers,
            and authorized evacuation shelter coordinators across Sri Lanka.
          </p>

          {/* Three Operational Guarantees with subtle glassmorphic backdrop */}
          <div className="pt-4 space-y-2.5 border-t border-white/20">
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/50 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded bg-red-600/90 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <ShieldAlert size={16} />
              </div>
              <div className="text-xs">
                <h2 className="font-semibold text-white drop-shadow-xs">Emergency SOS Reporting</h2>
                <p className="text-slate-200/90 mt-0.5 leading-relaxed">
                  Submit critical rescue requests with GPS coordinates or landmarks. Telephone numbers are masked for family privacy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/50 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded bg-blue-600/90 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Building2 size={16} />
              </div>
              <div className="text-xs">
                <h2 className="font-semibold text-white drop-shadow-xs">Safe Evacuation Shelters</h2>
                <p className="text-slate-200/90 mt-0.5 leading-relaxed">
                  Real-time occupancy tracking and high-ground flood elevation safety ratings across government relief centers.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/50 backdrop-blur-xs border border-white/10">
              <div className="w-8 h-8 rounded bg-emerald-600/90 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Users size={16} />
              </div>
              <div className="text-xs">
                <h2 className="font-semibold text-white drop-shadow-xs">Humanitarian Supplies &amp; Volunteers</h2>
                <p className="text-slate-200/90 mt-0.5 leading-relaxed">
                  Live inventory shortfall logging and supervised, non-hazardous community relief task assignments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Civic Hotline Strip */}
        <div className="relative z-20 mt-8 pt-4 border-t border-white/20 flex items-center gap-4 text-xs text-slate-300 drop-shadow-sm">
          <span>National Emergency:</span>
          <span className="text-white font-semibold">117 (DMC)</span>
          <span className="text-slate-400">•</span>
          <span className="text-white font-semibold">1990 (Ambulance)</span>
          <span className="text-slate-400">•</span>
          <span className="text-white font-semibold">119 (Police)</span>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT SIDE: AUTHENTICATION FORM CARD
         ========================================================================= */}
      <main className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-xl p-6 sm:p-8 shadow-xs border border-slate-300 flex flex-col justify-between">
          <div>
            {/* Logo */}
            <div className="flex justify-center mb-5">
              <ResQLogo />
            </div>

            {/* Mode Switcher Tabs */}
            {!otpStep ? (
              <div className="flex bg-slate-100 p-1 rounded-lg mb-5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    navigate('/login');
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                    mode === 'login'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    navigate('/register');
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
                    mode === 'register'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-1.5 mb-4 py-1 px-3 bg-slate-100 border border-slate-300 text-slate-800 rounded w-fit mx-auto text-xs font-semibold">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Two-Factor Authentication</span>
              </div>
            )}

            {/* Header Titles */}
            <div className="text-center mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {otpStep
                  ? 'Security Verification'
                  : mode === 'login'
                  ? 'Sign in to ResQ-Lanka'
                  : 'Register Responder Account'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {otpStep
                  ? 'Enter the 6-digit verification code sent to your email'
                  : mode === 'login'
                  ? 'Enter your credentials to access your relief dashboard'
                  : 'Register as an affected citizen or community relief volunteer'}
              </p>
            </div>

            {/* Emergency Intent Alert */}
            {isEmergencyRedirect && !otpStep && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg text-xs flex items-start gap-2.5"
              >
                <ShieldAlert size={16} className="text-red-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-950">Emergency Verification Required</span>
                  <span>To submit an Emergency SOS request, authenticate your profile. A two-factor security code will be dispatched to your email.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-4 p-3 bg-red-50 border border-red-300 text-red-900 rounded-lg text-xs flex items-center gap-2"
              >
                <AlertCircle size={15} className="text-red-700 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Toast */}
            {successMessage && (
              <div
                role="status"
                className="mb-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-lg text-xs flex items-center gap-2"
              >
                <CheckCircle2 size={15} className="text-emerald-700 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* OTP Verification Form */}
            {otpStep ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-center space-y-1">
                  <KeyRound size={20} className="mx-auto text-slate-700" />
                  <h3 className="font-bold text-slate-900 text-xs">Two-Factor Authentication PIN</h3>
                  <p className="text-xs text-slate-600">
                    A 6-digit security code was dispatched to:
                  </p>
                  <p className="text-xs font-semibold text-slate-900 font-mono">{email}</p>
                </div>

                <div>
                  <label htmlFor="otp-input" className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                    Enter 6-Digit PIN
                  </label>
                  <input
                    id="otp-input"
                    type="text"
                    maxLength={6}
                    pattern="[0-9]*"
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full text-center py-2.5 bg-slate-50 border border-slate-300 focus:border-slate-900 focus:bg-white rounded-lg text-2xl font-mono font-bold tracking-widest text-slate-900 focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-slate-500 text-center mt-1">
                    For local testing, check your backend server console for the generated code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {isLoading ? 'Verifying Code...' : 'Verify Security Code'}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtpCode('');
                      setErrorMessage(null);
                    }}
                    className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Change Credentials</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isResending}
                    onClick={handleResendOtp}
                    className="text-slate-800 hover:text-black font-semibold disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
                    <span>
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : isResending
                        ? 'Sending...'
                        : 'Resend Code'}
                    </span>
                  </button>
                </div>
              </form>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {mode === 'register' && (
                    <>
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={15} className="absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Kasun Perera"
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Account Role Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Account Role
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRegisterRole('citizen')}
                            className={`p-2 rounded-lg border text-center transition-colors flex items-center justify-center gap-2 text-xs font-semibold ${
                              registerRole === 'citizen'
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <User size={14} />
                            <span>Citizen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterRole('volunteer')}
                            className={`p-2 rounded-lg border text-center transition-colors flex items-center justify-center gap-2 text-xs font-semibold ${
                              registerRole === 'volunteer'
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <Users size={14} />
                            <span>Volunteer</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === 'register'
                            ? 'Minimum 6 characters'
                            : 'Enter password'
                        }
                        className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Phone (Optional)
                        </label>
                        <div className="relative">
                          <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="077 123 4567"
                            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          District
                        </label>
                        <div className="relative">
                          <MapPin size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Ampara"
                            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center cursor-pointer"
                  >
                    {isLoading
                      ? mode === 'login'
                        ? 'Signing in...'
                        : 'Creating account...'
                      : mode === 'login'
                      ? 'Sign In'
                      : 'Complete Registration'}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Bottom link toggle */}
          {!otpStep && (
            <div className="mt-5 pt-3 border-t border-slate-200 text-center text-xs text-slate-600">
              {mode === 'login' ? (
                <span>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      navigate('/register');
                    }}
                    className="font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      navigate('/login');
                    }}
                    className="font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
