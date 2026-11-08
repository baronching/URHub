import React, { useState, useEffect } from 'react';
import { User, UserRole, UDMCollege, UDM_COLLEGES, Research } from '../types';
import udmBuildingBg from '../assets/images/udm_hero_building_1785654888561.jpg';
import {
  loginUserWithSupabase,
  registerUserWithSupabase,
  verifySignupOTP,
  resendSignupOTP,
  requestPasswordReset,
  verifyPasswordResetOTP,
  updateUserPassword
} from '../services/supabaseService';
import {
  getUserRoleDisplayLabel,
  getRoleBadgeClass
} from '../utils/userUtils';
import {
  ShieldCheck,
  BookOpen,
  Building2,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  GraduationCap,
  Briefcase,
  IdCard,
  KeyRound,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  AlertTriangle,
  FileText,
  TrendingUp,
  Search,
  ExternalLink,
  ChevronRight,
  Zap,
  Award,
  Info,
  Code2,
  Server,
  Users,
  X
} from 'lucide-react';

interface LandingLoginPageProps {
  onLoginSuccess: (user: User) => void;
  totalPapers?: number;
  featuredResearches?: Research[];
  onOpenPrivacyModal?: () => void;
}

type AuthMode = 'signin' | 'register' | 'forgot_password' | 'verify_otp';

export const LandingLoginPage: React.FC<LandingLoginPageProps> = ({
  onLoginSuccess,
  totalPapers = 520,
  featuredResearches = [],
  onOpenPrivacyModal
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Sign In State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register State
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [college, setCollege] = useState<UDMCollege>('CCS');
  const [idNumber, setIdNumber] = useState('');
  const [courseProgram, setCourseProgram] = useState('');
  const [yearLevel, setYearLevel] = useState<string>('1st Year');

  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Password Reset / OTP State
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Signup OTP Verification State
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showAboutUsModal, setShowAboutUsModal] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Standard Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (!signInIdentifier.trim()) {
        throw new Error('Please enter your UDM email address, username, or ID number.');
      }
      if (!signInPassword) {
        throw new Error('Please enter your password.');
      }

      const authenticatedUser = await loginUserWithSupabase(signInIdentifier.trim(), signInPassword);
      onLoginSuccess(authenticatedUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = regEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(cleanEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      if (regPassword !== regConfirmPassword) {
        throw new Error('Password and Confirm Password do not match.');
      }

      if (regPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      if (!fullName.trim()) {
        throw new Error('Full Name is required.');
      }

      if (!idNumber.trim()) {
        throw new Error('Student/Faculty ID Number is required.');
      }

      const result = await registerUserWithSupabase({
        fullName: fullName.trim(),
        email: cleanEmail,
        password: regPassword,
        confirmPassword: regConfirmPassword,
        role: userRole,
        college,
        idNumber: idNumber.trim(),
        courseProgram: courseProgram.trim(),
        yearLevel: userRole === 'student' ? yearLevel : undefined
      });

      if (result.needsVerification) {
        setPendingEmail(cleanEmail);
        setAuthMode('verify_otp');
        setResendCooldown(60);
        setSuccessMsg(`A 6-digit verification code has been sent to ${cleanEmail}. Please enter it below to activate your account.`);
      } else {
        onLoginSuccess(result.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Verification for Registration
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanToken = otpCode.trim();
      if (!/^\d{6}$/.test(cleanToken)) {
        throw new Error('Please enter a valid 6-digit numeric verification code.');
      }

      const verifiedUser = await verifySignupOTP(pendingEmail, cleanToken);
      onLoginSuccess(verifiedUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await resendSignupOTP(pendingEmail);
      setResendCooldown(60);
      setSuccessMsg(`A fresh 6-digit code has been dispatched to ${pendingEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = resetEmail.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        throw new Error('Please enter a valid email address.');
      }

      await requestPasswordReset(cleanEmail);
      setResetSent(true);
      setSuccessMsg(`Password reset instructions and OTP code sent to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initiate password reset. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Confirmation
  const handleResetConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (newPassword !== confirmNewPassword) {
        throw new Error('New passwords do not match.');
      }
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long.');
      }

      await verifyPasswordResetOTP(resetEmail, resetOtp);
      await updateUserPassword(newPassword);

      setSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setTimeout(() => {
        setAuthMode('signin');
        setSignInIdentifier(resetEmail);
        setSignInPassword('');
        setResetSent(false);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please check your reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-[#c9a84c] selection:text-[#1a4731] relative overflow-x-hidden">
      
      {/* Background Ambience: Subtle UDM Campus Watermark + Soft Emerald/Gold Light Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={udmBuildingBg}
          alt="Universidad de Manila Campus Background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-10 filter blur-[1px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-emerald-50/40 to-amber-50/25" />
        
        {/* Soft decorative glow circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#1a4731]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-[#c9a84c]/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Main Split-Screen Container (Facebook-style 2-column layout with rich insights) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* ========================================================= */}
          {/* LEFT COLUMN: BRANDING, VALUE PROPOSITION & LIVE INSIGHTS  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
            
            {/* Branding Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 bg-white/90 border border-slate-200/90 shadow-xs px-3.5 py-1.5 rounded-full backdrop-blur-md">
                <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-[#c9a84c] flex items-center justify-center shrink-0">
                  <img
                    src="/udm-logo.png"
                    alt="UDM Seal"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.parentElement?.querySelector('.logo-fallback') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="logo-fallback hidden w-full h-full bg-[#1a4731] items-center justify-center font-bold text-[10px] text-[#c9a84c]">
                    UDM
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#1a4731] uppercase tracking-wider">
                  URELIA Research Gateway
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
                <button
                  type="button"
                  onClick={() => setShowAboutUsModal(true)}
                  className="text-[11px] font-bold text-[#1a4731] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Info className="w-3.5 h-3.5 text-[#1a4731]" />
                  <span>About Us</span>
                </button>
              </div>

              {/* Big, Crisp Facebook-style Hero Headline */}
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-[#1a4731] tracking-tight leading-[1.15]">
                Advancing Knowledge, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4731] via-[#236345] to-[#c9a84c]">
                  Preserving Merlion Scholarship.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl font-normal">
                Universidad de Manila’s centralized digital research archive connecting students, faculty mentors, and academic leadership across all 7 Colleges and Administrative Units.
              </p>
            </div>

            {/* Live Repository Insights Cards (The requested Insights Section) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-[#1a4731]" />
                  <span>Live Repository Insights</span>
                </div>
                <span className="text-[11px] text-[#1a4731] font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Real-time Corpus Metrics
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Metric 1: Researches */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:border-[#1a4731]/40 transition-all hover:shadow-md group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Manuscripts</span>
                    <BookOpen className="w-4 h-4 text-[#1a4731] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#1a4731] tracking-tight">
                    {totalPapers}+
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Theses & Capstones
                  </div>
                </div>

                {/* Metric 2: Colleges */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:border-[#1a4731]/40 transition-all hover:shadow-md group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Colleges</span>
                    <Building2 className="w-4 h-4 text-[#c9a84c] group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#1a4731] tracking-tight">
                    7 + Admin
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    All UDM Units
                  </div>
                </div>

                {/* Metric 3: Peer Review */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:border-[#1a4731]/40 transition-all hover:shadow-md group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Verification</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-emerald-700 tracking-tight">
                    100%
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    URELIA Peer Reviewed
                  </div>
                </div>

                {/* Metric 4: AI Engine */}
                <div className="bg-white/95 rounded-2xl p-3.5 border border-slate-200/90 shadow-sm hover:border-[#1a4731]/40 transition-all hover:shadow-md group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Discovery</span>
                    <Sparkles className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-black text-[#1a4731] tracking-tight">
                    TF-IDF
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    Cosine AI Vector ML
                  </div>
                </div>
              </div>
            </div>

            {/* Trending Research Themes / Spotlight */}
            <div className="bg-gradient-to-r from-emerald-900/90 via-[#1a4731] to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-[#c9a84c]/30 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-[#c9a84c]/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#c9a84c]" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#c9a84c]">
                      Institutional Research Focus
                    </span>
                  </div>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white/80 font-mono">
                    CHED & UDM Standards
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
                  “Empowering Manila's future innovators through open abstract discovery while safeguarding intellectual property and manuscript ethics under RA 10173.”
                </p>

                {/* Trending Research Theme Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full border border-white/10 text-white">
                    #MachineLearning
                  </span>
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full border border-white/10 text-white">
                    #PublicHealthcare
                  </span>
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full border border-white/10 text-white">
                    #UrbanGovernance
                  </span>
                  <span className="text-[10px] font-semibold bg-white/15 px-2 py-0.5 rounded-full border border-white/10 text-white">
                    #DisasterResilience
                  </span>
                  <span className="text-[10px] font-semibold bg-[#c9a84c]/30 px-2 py-0.5 rounded-full border border-[#c9a84c]/40 text-[#c9a84c]">
                    #SDG2030Goals
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: THE ELEVATED FACEBOOK-STYLE LOGIN CARD       */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 border border-slate-200/90 p-6 sm:p-8 relative overflow-hidden backdrop-blur-md">
              
              {/* Subtle top brand bar on card */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#1a4731] via-[#c9a84c] to-[#1a4731]" />

              {/* Mode Switcher Tabs (Sign In vs Register) */}
              {(authMode === 'signin' || authMode === 'register') && (
                <div className="flex rounded-xl bg-slate-100 p-1 mb-5 border border-slate-200/80 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 py-2.5 rounded-lg transition-all text-center cursor-pointer ${
                      authMode === 'signin'
                        ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200/60 font-black'
                        : 'text-slate-600 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className={`flex-1 py-2.5 rounded-lg transition-all text-center cursor-pointer ${
                      authMode === 'register'
                        ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200/60 font-black'
                        : 'text-slate-600 hover:text-slate-900 font-semibold'
                    }`}
                  >
                    Create UDM Account
                  </button>
                </div>
              )}

              {/* Error Message Banner */}
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5 font-medium animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {/* Success Message Banner */}
              {successMsg && (
                <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2.5 font-medium animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{successMsg}</div>
                </div>
              )}

              {/* ======================================================= */}
              {/* VIEW 1: SIGN IN FORM                                    */}
              {/* ======================================================= */}
              {authMode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>UDM Institutional Email or User ID *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={signInIdentifier}
                      onChange={e => setSignInIdentifier(e.target.value)}
                      placeholder="e.g. jdelacruz@udm.edu.ph or user@gmail.com"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:border-[#1a4731] focus:ring-2 focus:ring-[#1a4731]/10 focus:bg-white focus:outline-none font-medium transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Password *</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot_password');
                          setResetEmail(signInIdentifier.includes('@') ? signInIdentifier : '');
                          setErrorMsg('');
                          setSuccessMsg('');
                        }}
                        className="text-[11px] text-[#1a4731] hover:underline font-bold cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl p-3 pr-10 text-xs sm:text-sm text-slate-900 focus:border-[#1a4731] focus:ring-2 focus:ring-[#1a4731]/10 focus:bg-white focus:outline-none font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 focus:outline-none cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Keep me signed in row */}
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-300 text-[#1a4731] focus:ring-[#1a4731] cursor-pointer"
                      />
                      <span className="font-medium text-slate-600">Remember on this device</span>
                    </label>
                    <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Encrypted SSL</span>
                    </span>
                  </div>

                  {/* Primary Sign In Button (Facebook-style prominent button) */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl text-sm font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center space-x-2 border border-[#c9a84c]/30 cursor-pointer active:scale-[0.99]"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing In to URHub...</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span>Sign In to Research Repository</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </button>

                  {/* Facebook-style Divider */}
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                  </div>

                  {/* Facebook-style "Create New Account" Button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#c9a84c] hover:bg-[#b5953e] text-[#1a4731] shadow-sm transition-all border border-[#c9a84c] cursor-pointer active:scale-[0.99] flex items-center justify-center space-x-2"
                    >
                      <span>Create New UDM Account</span>
                    </button>
                  </div>

                  {/* Security & Access Policy Notice */}
                  <div className="pt-1 text-center">
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Access is open to authorized <code className="text-slate-600 font-mono">@udm.edu.ph</code> institutional and <code className="text-slate-600 font-mono">@gmail.com</code> accounts. Protected under Republic Act 10173.
                    </p>
                  </div>
                </form>
              )}

              {/* ======================================================= */}
              {/* VIEW 2: REGISTRATION FORM                               */}
              {/* ======================================================= */}
              {authMode === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3.5 animate-in fade-in duration-200">
                  <div className="text-left pb-1">
                    <h3 className="text-base font-extrabold text-[#1a4731]">
                      Register Account
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Sign up with your official @udm.edu.ph email or personal @gmail.com
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <UserCheck className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none"
                    />
                  </div>

                  {/* Institutional or Personal Email */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>Email Address * (@udm.edu.ph or @gmail.com)</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      placeholder="yourname@udm.edu.ph or yourname@gmail.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none font-mono"
                    />
                  </div>

                  {/* Role Selector & College Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Institutional Role *</span>
                      </label>
                      <select
                        value={userRole}
                        onChange={e => setUserRole(e.target.value as UserRole)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none font-medium cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="program_chair">Program Chair</option>
                        <option value="dean">College Dean</option>
                        <option value="urelia_personnel">URELIA Research Staff</option>
                        <option value="urelia_director">URELIA Director</option>
                        <option value="urelia_admin">URELIA Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>College / Unit *</span>
                      </label>
                      <select
                        value={college}
                        onChange={e => setCollege(e.target.value as UDMCollege)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none font-medium cursor-pointer"
                      >
                        {UDM_COLLEGES.map(col => (
                          <option key={col.id} value={col.id}>
                            {col.id} - {col.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* ID Number & Course/Program */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <IdCard className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Student/Faculty ID *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={idNumber}
                        onChange={e => setIdNumber(e.target.value)}
                        placeholder="2023-12345"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Course / Program</span>
                      </label>
                      <input
                        type="text"
                        value={courseProgram}
                        onChange={e => setCourseProgram(e.target.value)}
                        placeholder="BS Information Technology"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Password *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="Min. 8 chars"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-8 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Confirm Password *</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-8 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit Registration Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl text-xs font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2 border border-[#c9a84c]/30 cursor-pointer active:scale-[0.99] mt-2"
                  >
                    <span>{isLoading ? 'Creating Account...' : 'Register & Enter UDM ResearchHub'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs text-slate-600 hover:text-[#1a4731] font-semibold cursor-pointer underline"
                    >
                      Already have an account? Sign in here
                    </button>
                  </div>
                </form>
              )}

              {/* ======================================================= */}
              {/* VIEW 3: OTP VERIFICATION                                */}
              {/* ======================================================= */}
              {authMode === 'verify_otp' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-center space-y-1 pb-1">
                    <div className="w-12 h-12 rounded-full bg-[#1a4731]/10 text-[#1a4731] flex items-center justify-center mx-auto">
                      <Mail className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">
                      Verify Your Institutional Email
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      We sent a 6-digit verification code to{' '}
                      <span className="font-bold text-[#1a4731] font-mono break-all">{pendingEmail}</span>.
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full max-w-[240px] mx-auto block bg-slate-50 border-2 border-slate-300 focus:border-[#1a4731] rounded-xl py-3 text-center text-2xl font-mono tracking-[0.5em] font-extrabold text-slate-900 focus:bg-white focus:outline-none"
                    />

                    {/* Email delivery tip */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left space-y-1 text-amber-950 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Email Delivery Notice:</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-amber-900">
                        Check your <strong>Junk Email / Other</strong> (Outlook) or <strong>Spam / Updates</strong> (Gmail) folder if the verification code is not in your Inbox.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpCode.length !== 6}
                      className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isLoading ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
                    </button>
                  </form>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isLoading}
                      className="text-slate-600 hover:text-[#1a4731] font-semibold cursor-pointer disabled:opacity-50"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Code'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Change Email
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* VIEW 4: FORGOT PASSWORD                                 */}
              {/* ======================================================= */}
              {authMode === 'forgot_password' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="text-left pb-1">
                    <h3 className="text-base font-extrabold text-[#1a4731]">
                      Recover Account Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your registered @udm.edu.ph or @gmail.com address to receive a 6-digit recovery code.
                    </p>
                  </div>

                  {!resetSent ? (
                    <form onSubmit={handleForgotSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                          <span>Email Address (@udm.edu.ph or @gmail.com)</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                          placeholder="yourname@udm.edu.ph or yourname@gmail.com"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
                        <span>{isLoading ? 'Sending Code...' : 'Send Recovery Code'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleResetConfirm} className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          6-Digit Recovery Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={resetOtp}
                          onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center text-lg font-mono tracking-widest text-slate-900 focus:border-[#1a4731] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          New Password (Min. 8 characters)
                        </label>
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type={showResetPassword ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#c9a84c]" />
                        <span>{isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                      </button>
                    </form>
                  )}

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      {/* Institutional Academic Footer */}
      <footer className="relative z-20 bg-white border-t border-slate-200 py-6 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <span className="font-bold text-[#1a4731] block mb-0.5 uppercase tracking-wide">
              © 2026 Universidad de Manila • URELIA Office Archive Management System
            </span>
            <p className="text-slate-500 text-[11px]">
              Manila City Hall Complex, A.J. Villegas St., Mehan Gardens, Ermita, Manila, Philippines
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-slate-500 text-[11px] font-medium">
            <button
              type="button"
              onClick={() => setShowAboutUsModal(true)}
              className="inline-flex items-center gap-1.5 text-[#1a4731] hover:text-[#113122] font-bold cursor-pointer underline hover:no-underline transition"
            >
              <Info className="w-3.5 h-3.5 text-[#1a4731]" />
              <span>About Us</span>
            </button>
            <span>•</span>
            <span>7 Colleges: CBM • CAS • CPPG • CCS • CHS • CED • CCJ</span>
            <span>•</span>
            <button
              onClick={onOpenPrivacyModal}
              className="inline-flex items-center gap-1.5 text-[#1a4731] hover:text-[#113122] font-bold cursor-pointer underline hover:no-underline transition"
              title="Review Republic Act 10173 & Academic Ethics Policies"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#1a4731]" />
              <span>Data Privacy Act (RA 10173)</span>
            </button>
            <span>•</span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
              Abstract Only Protected
            </span>
          </div>
        </div>
      </footer>

      {/* About Us Pop-up Modal (Opens only when clicked) */}
      {showAboutUsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowAboutUsModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col my-6 animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#1a4731] text-white px-6 py-5 flex items-center justify-between shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#c9a84c]/40 text-[#c9a84c] flex items-center justify-center shadow-inner">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    About Us • The Capstone Project
                  </h3>
                  <p className="text-xs text-emerald-100/80 font-medium">
                    Universidad de Manila • URELIA Research Gateway
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAboutUsModal(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors relative z-10 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar text-left">
              <div className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                <p>
                  Welcome to <strong>URHub (UDM ResearchHub)</strong> — an AI-assisted institutional research repository conceptualized, engineered, and developed as an official <strong>Capstone Project</strong> by student developers at <strong>Universidad de Manila</strong>.
                </p>
                <p>
                  We built URHub in close collaboration with the <strong>URELIA Office</strong> (University Research, Extension, and Linkages Institutional Archive) to modernize research archiving, streamline manuscript peer evaluation, protect student intellectual property under <strong>Republic Act 10173</strong>, and showcase Merlion scholarship to the academic community.
                </p>
              </div>

              {/* Capstone Project Authors / Development Team */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#1a4731] uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#c9a84c]" />
                  <span>Created & Developed By:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center space-x-3 hover:border-[#1a4731]/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#1a4731] text-[#c9a84c] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      BC
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">Baron Alijah L. Ching</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">Capstone Researcher & Developer</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center space-x-3 hover:border-[#1a4731]/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#1a4731] text-[#c9a84c] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      AA
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">Alexis Bryan Apuyan</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">Capstone Researcher & Developer</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center space-x-3 hover:border-[#1a4731]/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#1a4731] text-[#c9a84c] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      MT
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">Maria Aylassa Tumlos</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">Capstone Researcher & Developer</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center space-x-3 hover:border-[#1a4731]/40 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-[#1a4731] text-[#c9a84c] font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      JP
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 truncate">JhonLeo Pangilinan</div>
                      <div className="text-[11px] text-slate-500 font-medium truncate">Capstone Researcher & Developer</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Development & Hosting Pillars: VS Code & Hostinger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a4731]">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Code2 className="w-3.5 h-3.5" />
                    </div>
                    <span>Created with Visual Studio Code</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Designed, architected, and coded in <strong>Visual Studio Code</strong> using full-stack TypeScript, React, Vite, Express, and Machine Learning TF-IDF natural language indexing algorithms.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1a4731]">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <Server className="w-3.5 h-3.5" />
                    </div>
                    <span>Powered & Hosted by Hostinger</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Deployed and continuously powered by <strong>Hostinger Cloud Infrastructure</strong>, ensuring high availability, HTTPS encryption, fast manuscript downloads, and 24/7 uptime.
                  </p>
                </div>
              </div>

              {/* Institutional Acknowledgement */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-[#1a4731]">By Baron Alijah L. Ching, Alexis Bryan Apuyan, Maria Aylassa Tumlos, and JhonLeo Pangilinan. </span>
                  Dedicated to the students, faculty researchers, Program Chairs, Deans, and the URELIA Directorate of Universidad de Manila.
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAboutUsModal(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs cursor-pointer transition-all"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
