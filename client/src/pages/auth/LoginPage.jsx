import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
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
  const [email, setEmail] = useState('citizen@resqlanka.lk');
  const [password, setPassword] = useState('password123');
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

  // Quick fill demo credentials for evaluation
  const handleQuickFill = (roleKey) => {
    setErrorMessage(null);
    if (roleKey === 'administrator' || roleKey === 'coordinator') {
      setEmail('admin@resqlanka.lk');
      setPassword('Admin@ResQ2026!');
    } else if (roleKey === 'volunteer') {
      setEmail('volunteer@resqlanka.lk');
      setPassword('password123');
    } else {
      setEmail('citizen@resqlanka.lk');
      setPassword('password123');
    }
  };

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
        setSuccessMessage(`Welcome back, ${loggedInUser.name}!`);

        setTimeout(() => {
          const redirect =
            location.state?.from?.pathname ||
            (loggedInUser.role === 'administrator' || loggedUserIsAdmin(loggedInUser)
              ? '/coordinator'
              : loggedInUser.role === 'volunteer'
              ? '/supplies'
              : '/sos');
          navigate(redirect);
        }, 600);
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
          `Account created successfully! Welcome, ${registeredUser.name}.`
        );

        setTimeout(() => {
          if (registeredUser.role === 'volunteer') {
            navigate('/supplies');
          } else {
            const redirect = location.state?.from?.pathname || '/sos';
            navigate(redirect);
          }
        }, 600);
      }
    } catch (err) {
      console.error('Auth operation failed:', err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Please check your credentials and try again.'
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
      setSuccessMessage(`Verified! Welcome back, ${verifiedUser.name}.`);

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
      }, 600);
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

  const loggedUserIsAdmin = (u) =>
    u.role === 'administrator' || u.role === 'coordinator';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-[#f8fafc]">
      {/* =========================================================================
          LEFT SIDE: DISASTER PLATFORM SHOWCASE (Hero Card)
         ========================================================================= */}
      <div className="relative lg:w-1/2 min-h-[480px] lg:min-h-auto flex flex-col justify-between p-8 sm:p-12 lg:p-16 text-white overflow-hidden bg-slate-950">
        {/* Disaster Photo Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroDisasterBg})` }}
        />
        {/* Dark Cinematic Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-900/85" />
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />

        {/* Content Top */}
        <div className="relative z-20 space-y-4 max-w-xl">
          {/* Tracking Subtitle Pill */}
          <div className="inline-block">
            <span className="text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-slate-300 drop-shadow">
              Community Disaster Response Platform
            </span>
          </div>

          {/* Main Title: ResQ-Lanka */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none drop-shadow-md">
            <span className="text-white">ResQ</span>
            <span className="text-[#ef4444]">-Lanka</span>
          </h1>

          {/* Catchphrase */}
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow">
            Stronger Communities. Safer Lives.
          </h2>

          {/* Subtitle Description */}
          <p className="text-xs sm:text-sm text-slate-200/90 font-normal leading-relaxed pt-1 drop-shadow">
            A unified platform for emergency reporting, safe shelters, relief donations and volunteer coordination
            during floods, earthquakes and other natural disasters in Sri Lanka.
          </p>

          {/* 4 Action Badges */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#ef4444] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/30">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Report Emergencies</h4>
                <p className="text-[11.5px] text-slate-300">
                  Submit an SOS request if you or someone needs urgent rescue or assistance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Find Safe Shelters</h4>
                <p className="text-[11.5px] text-slate-300">
                  View nearby verified shelters with real-time capacity and occupancy tracking.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30">
                <Users size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Support with Donations</h4>
                <p className="text-[11.5px] text-slate-300">
                  See urgent shelter supply requests and pledge aid to affected families.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quotation */}
        <div className="relative z-20 mt-8 pt-4 border-l-2 border-[#ef4444] pl-3.5">
          <p className="text-xs text-slate-300 italic font-medium">
            "Together we can build a safer, stronger Sri Lanka for a more resilient tomorrow."
          </p>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: AUTH FORM CARD
         ========================================================================= */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Center Logo */}
            <div className="flex justify-center mb-5">
              <ResQLogo />
            </div>

            {/* Mode Switcher Tabs */}
            {!otpStep ? (
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    navigate('/login');
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
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
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Create Account
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-4 py-1.5 px-3 bg-red-50 border border-red-200 text-red-700 rounded-full w-fit mx-auto text-xs font-bold">
                <ShieldCheck size={14} className="text-red-600" />
                <span>Two-Factor Authentication (2FA)</span>
              </div>
            )}

            {/* Header Titles */}
            <div className="text-center mb-5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {otpStep
                  ? 'Security Verification'
                  : mode === 'login'
                  ? 'Welcome Back!'
                  : 'Join ResQ-Lanka'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {otpStep
                  ? 'Enter the 6-digit code sent to your email to authenticate'
                  : mode === 'login'
                  ? 'Sign in to access your dashboard and relief tools'
                  : 'Register as a citizen or community relief volunteer'}
              </p>
            </div>

            {/* Emergency Intent Alert */}
            {isEmergencyRedirect && !otpStep && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
                <ShieldAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-red-900">Emergency Report Verification</span>
                  <span>To submit an SOS rescue request, please authenticate your account. A 2FA verification code will be sent to your email.</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Toast */}
            {successMessage && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* OTP Verification Form */}
            {otpStep ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
                    <KeyRound size={22} className="stroke-[2.5]" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Security Verification Code</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Please enter the 6-digit code sent to:
                  </p>
                  <p className="text-xs font-bold text-red-600 mt-0.5 font-mono">{email}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                    6-Digit Verification PIN
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      pattern="[0-9]*"
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full text-center py-3 bg-slate-50 border-2 border-slate-200 focus:border-red-500 focus:bg-white rounded-xl text-2xl font-mono font-bold tracking-[0.5em] text-slate-900 focus:outline-none transition shadow-inner"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    For local testing, check your server terminal console for the generated code.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isLoading ? 'Verifying Code...' : 'Verify & Continue'}</span>
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep(false);
                      setOtpCode('');
                      setErrorMessage(null);
                    }}
                    className="text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Change Credentials</span>
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isResending}
                    onClick={handleResendOtp}
                    className="text-red-600 hover:text-red-700 font-bold disabled:text-slate-400 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Kasun Perera"
                            className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                          />
                        </div>
                      </div>

                      {/* Register Role Selection (Citizen or Volunteer ONLY) */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Account Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRegisterRole('citizen')}
                            className={`p-2 rounded-xl border text-center transition flex items-center justify-center gap-2 text-xs font-bold ${
                              registerRole === 'citizen'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <User size={14} />
                            <span>Citizen</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterRole('volunteer')}
                            className={`p-2 rounded-xl border text-center transition flex items-center justify-center gap-2 text-xs font-bold ${
                              registerRole === 'volunteer'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={
                          mode === 'register'
                            ? 'Minimum 6 characters'
                            : 'Enter your password'
                        }
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Phone (Optional)
                        </label>
                        <div className="relative">
                          <Phone size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="077 123 4567"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          District
                        </label>
                        <div className="relative">
                          <MapPin size={14} className="absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="Ampara"
                            className="w-full pl-8 pr-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-3 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
                  >
                    <span>
                      {isLoading
                        ? mode === 'login'
                          ? 'Signing in...'
                          : 'Creating account...'
                        : mode === 'login'
                        ? 'Login to Platform'
                        : 'Complete Registration'}
                    </span>
                    <ArrowRight size={16} className="stroke-[2.5]" />
                  </button>
                </form>

                {/* Separator */}
                <div className="relative my-5 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Dev Credentials
                  </span>
                </div>

                {/* 3 Quick-fill Buttons matching evaluation requirements */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('citizen')}
                    className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-center transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center">
                      <User size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      Citizen
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Report Help
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('volunteer')}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-center transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center">
                      <Users size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      Volunteer
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Support Tasks
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickFill('administrator')}
                    className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-center transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
                      <Building2 size={13} className="stroke-[2.5]" />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 leading-tight">
                      Administrator
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">
                      Full Authority
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Bottom link toggle */}
          {!otpStep && (
            <div className="mt-6 text-center text-xs text-slate-600">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      navigate('/register');
                    }}
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Register Now
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
                    className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
