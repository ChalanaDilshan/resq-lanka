import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Users,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import ResQLogo from '../../components/shared/ResQLogo';
import heroDisasterBg from '../../assets/hero_disaster_bg.jpg';
import { useAuth, ROLE_CONFIGS } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Selected role among Citizen, Volunteer, Coordinator
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('citizen@resqlanka.lk');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(null);

  // Update sample email when role changes
  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    const config = ROLE_CONFIGS[roleKey];
    if (config) {
      setEmail(config.defaultEmail);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const loggedInUser = login(selectedRole, email);
      setIsLoading(false);
      setLoginSuccess(loggedInUser);

      setTimeout(() => {
        // Role-based destination redirect
        if (selectedRole === 'coordinator') {
          navigate('/coordinator');
        } else if (selectedRole === 'volunteer') {
          navigate('/supplies');
        } else {
          // Citizen
          const redirect = location.state?.from || '/';
          navigate(redirect);
        }
      }, 700);
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-[#f8fafc]">
      {/* =========================================================================
          LEFT SIDE: DISASTER PLATFORM SHOWCASE (Matches screenshot)
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

          {/* 4 Action Badges matching screenshot */}
          <div className="pt-4 space-y-3">
            {/* 1: Report Emergencies */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#ef4444] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-red-500/30">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2C11.45 2 11 2.45 11 3V4C7.69 4.56 5 7.42 5 11V15L3 17V18H21V17L19 15V11C19 7.42 16.31 4.56 13 4V3C13 2.45 12.55 2 12 2ZM9 19C9 20.66 10.34 22 12 22C13.66 22 15 20.66 15 19H9Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Report Emergencies</h4>
                <p className="text-[11.5px] text-slate-300">
                  Submit an SOS request if you or someone needs urgent assistance.
                </p>
              </div>
            </div>

            {/* 2: Find Safe Shelters */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Find Safe Shelters</h4>
                <p className="text-[11.5px] text-slate-300">
                  View nearby verified shelters with real-time capacity information.
                </p>
              </div>
            </div>

            {/* 3: Support with Donations */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/30">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M20 6H16V4C16 2.89 15.11 2 14 2H10C8.89 2 8 2.89 8 4V6H4C2.89 6 2 6.89 2 8V19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM10 4H14V6H10V4ZM13 15H11V18H9V15H7V13H9V10H11V13H13V15Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Support with Donations</h4>
                <p className="text-[11.5px] text-slate-300">
                  See urgent supply needs and make a pledge to help affected communities.
                </p>
              </div>
            </div>

            {/* 4: Join as a Volunteer */}
            <div className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/30">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Join as a Volunteer</h4>
                <p className="text-[11.5px] text-slate-300">
                  Browse and claim community tasks to support disaster relief efforts.
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
          RIGHT SIDE: LOGIN FORM CARD (Matches screenshot)
         ========================================================================= */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            {/* Center Logo */}
            <div className="flex justify-center mb-6">
              <ResQLogo />
            </div>

            {/* Welcome Back Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Login to your account to continue
              </p>
            </div>

            {/* Success Toast / Notification */}
            {loginSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
                <span>
                  Welcome, <strong>{loginSuccess.name}</strong>! Logged in as{' '}
                  <span className="capitalize font-bold">{loginSuccess.role}</span>.
                </span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
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
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
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

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to registered email.')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Solid Blue Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#2563eb] hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>{isLoading ? 'Signing in...' : 'Login'}</span>
                <ArrowRight size={17} className="stroke-[2.5]" />
              </button>
            </form>

            {/* Separator: -- or -- */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative px-3 bg-white text-xs text-slate-400">or</span>
            </div>

            {/* Three Role Selector Cards matching screenshot */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Role 1: Citizen */}
              <button
                type="button"
                onClick={() => handleRoleSelect('citizen')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedRole === 'citizen'
                    ? 'border-blue-500 bg-blue-50/70 shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-0.5">
                  <User size={15} className="stroke-[2.5]" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Citizen
                </div>
                <div className="text-[9.5px] text-slate-500 leading-tight">
                  Report & Get Help
                </div>
              </button>

              {/* Role 2: Volunteer */}
              <button
                type="button"
                onClick={() => handleRoleSelect('volunteer')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedRole === 'volunteer'
                    ? 'border-amber-500 bg-amber-50/70 shadow-2xs ring-1 ring-amber-500'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-0.5">
                  <Users size={15} className="stroke-[2.5]" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Volunteer
                </div>
                <div className="text-[9.5px] text-slate-500 leading-tight">
                  Join & Support
                </div>
              </button>

              {/* Role 3: Coordinator */}
              <button
                type="button"
                onClick={() => handleRoleSelect('coordinator')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedRole === 'coordinator'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-2xs ring-1 ring-emerald-500'
                    : 'border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-0.5">
                  <Building2 size={15} className="stroke-[2.5]" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  Coordinator
                </div>
                <div className="text-[9.5px] text-slate-500 leading-tight">
                  Manage & Coordinate
                </div>
              </button>
            </div>
          </div>

          {/* Bottom link: Don't have an account? Register Now -> */}
          <div className="mt-8 text-center text-xs text-slate-600">
            <span>Don't have an account? </span>
            <Link
              to="/register"
              className="font-bold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              <span>Register Now</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
