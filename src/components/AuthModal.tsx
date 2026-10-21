import React, { useState, useEffect } from 'react';
import { User, UDMCollege, UDM_COLLEGES } from '../types';
import {
  registerUserWithSupabase,
  loginUserWithSupabase,
  verifySignupOTP,
  resendSignupOTP,
  requestPasswordReset,
  verifyPasswordResetOTP,
  updateUserPassword
} from '../services/supabaseService';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Lock,
  Mail,
  GraduationCap,
  Briefcase,
  IdCard,
  BookOpen,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  Send
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthViewMode = 'signin' | 'register' | 'verify_otp' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [viewMode, setViewMode] = useState<AuthViewMode>('signin');

  // Lock background scroll
  useEffect(() => {
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'Student' | 'Faculty_Admin'>('Student');
  const [college, setCollege] = useState<UDMCollege>('CCS');
  const [idNumber, setIdNumber] = useState('');
  const [courseProgram, setCourseProgram] = useState('');
  const [yearLevel, setYearLevel] = useState<string>('1st Year');

  // Verification & Forgot Password State
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Forgot password sub-state
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Sign In / Register submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (viewMode === 'register') {
        const cleanEmail = email.trim().toLowerCase();

        // 1. Domain Validation
        if (!cleanEmail.endsWith('@udm.edu.ph')) {
          throw new Error('Registration requires an official UDM email address ending in @udm.edu.ph');
        }

        // 2. Passwords Match
        if (password !== confirmPassword) {
          throw new Error('Password and Confirm Password do not match.');
        }

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters long.');
        }

        if (!fullName.trim()) {
          throw new Error('Full Name is required.');
        }

        if (!idNumber.trim()) {
          throw new Error('Student/Faculty ID Number is required.');
        }

        // Execute Supabase Auth + profile metadata registration
        const result = await registerUserWithSupabase({
          fullName,
          email: cleanEmail,
          password,
          confirmPassword,
          role: userType === 'Faculty_Admin' ? 'Faculty/Admin' : 'Student',
          college,
          idNumber,
          courseProgram,
          yearLevel: userType === 'Student' ? yearLevel : undefined
        });

        if (result.needsVerification) {
          setPendingEmail(cleanEmail);
          setViewMode('verify_otp');
          setResendCooldown(60);
          setSuccessMsg(`A 6-digit verification code has been sent to ${cleanEmail}. Please enter it below to activate your account.`);
        } else {
          onLoginSuccess(result.user);
          onClose();
        }
      } else if (viewMode === 'signin') {
        // Sign In
        const authenticatedUser = await loginUserWithSupabase(email, password);
        onLoginSuccess(authenticatedUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Signup OTP Verification
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Resend Signup OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await resendSignupOTP(pendingEmail);
      setResendCooldown(60);
      setSuccessMsg(`A fresh 6-digit verification code was sent to ${pendingEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password Request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      const cleanEmail = resetEmail.trim().toLowerCase();
      if (!cleanEmail.endsWith('@udm.edu.ph')) {
        throw new Error('Please enter a valid @udm.edu.ph institutional email address.');
      }

      await requestPasswordReset(cleanEmail);
      setResetSent(true);
      setSuccessMsg(`Password recovery instructions and OTP have been sent to ${cleanEmail}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initiate password reset. Please verify your email.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset Confirmation with OTP & New Password
  const handleResetPasswordConfirm = async (e: React.FormEvent) => {
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

      // Verify OTP first
      await verifyPasswordResetOTP(resetEmail, resetOtp);
      // Update password
      await updateUserPassword(newPassword);

      setSuccessMsg('Your password has been successfully reset! You can now sign in.');
      setTimeout(() => {
        setViewMode('signin');
        setEmail(resetEmail);
        setPassword('');
        setResetSent(false);
        setResetOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password. Please check your reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-6 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-[#1a4731] text-white px-6 py-5 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#c9a84c]/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center space-x-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#c9a84c]/40 text-[#c9a84c] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                UDM ResearchHub Authentication
              </h2>
              <p className="text-xs text-emerald-100/80 font-medium">
                Universidad de Manila Single Sign-On Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors relative z-10 cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

          {/* Mode Switcher Tabs (Only shown for Sign In & Register) */}
          {(viewMode === 'signin' || viewMode === 'register') && (
            <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                  viewMode === 'signin'
                    ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode('register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                  viewMode === 'register'
                    ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register UDM Account
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-start space-x-2.5 font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 1 & 2: SIGN IN & REGISTRATION FORMS */}
          {/* ========================================================= */}
          {(viewMode === 'signin' || viewMode === 'register') && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {viewMode === 'register' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
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
                </>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                  <span>
                    {viewMode === 'register' ? 'UDM Institutional Email * (@udm.edu.ph)' : 'UDM Email, Username, or Student/Faculty ID *'}
                  </span>
                </label>
                <input
                  type={viewMode === 'register' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={viewMode === 'register' ? 'yourname@udm.edu.ph' : 'e.g. blching@udm.edu.ph, blching, or 23-22-005'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none font-mono"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                    <span>Password *</span>
                  </label>
                  {viewMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode('forgot_password');
                        setResetEmail(email.includes('@udm.edu.ph') ? email : '');
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-[#1a4731] hover:underline font-semibold cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none"
                />
              </div>

              {/* Confirm Password (Registration only) */}
              {viewMode === 'register' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                    <span>Confirm Password *</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none"
                  />
                </div>
              )}

              {/* Registration Specific Fields */}
              {viewMode === 'register' && (
                <>
                  {/* Role & College Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <GraduationCap className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Role *</span>
                      </label>
                      <select
                        value={userType}
                        onChange={e => setUserType(e.target.value as 'Student' | 'Faculty_Admin')}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer font-medium"
                      >
                        <option value="Student">Student</option>
                        <option value="Faculty_Admin">Faculty/Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <Briefcase className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>UDM Unit *</span>
                      </label>
                      <select
                        value={college}
                        onChange={e => setCollege(e.target.value as UDMCollege)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer font-medium"
                      >
                        {UDM_COLLEGES.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.id} - {c.name.replace('College of ', '')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Student/Faculty ID Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <IdCard className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>Student / Faculty ID Number *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={idNumber}
                      onChange={e => setIdNumber(e.target.value)}
                      placeholder={userType === 'Student' ? '2023-10452' : 'FAC-2021-08'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none font-mono"
                    />
                  </div>

                  {/* Course/Program & Year Level */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Course / Program *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={courseProgram}
                        onChange={e => setCourseProgram(e.target.value)}
                        placeholder="BS Information Technology"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none"
                      />
                    </div>

                    {/* Year Level (Only for Students) */}
                    {userType === 'Student' && (
                      <div className="animate-in fade-in duration-200">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#1a4731]" />
                          <span>Year Level *</span>
                        </label>
                        <select
                          value={yearLevel}
                          onChange={e => setYearLevel(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer font-medium"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                          <option value="5th Year">5th Year</option>
                        </select>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2 border border-[#c9a84c]/30 cursor-pointer active:scale-[0.99]"
              >
                <span>
                  {isLoading
                    ? 'Authenticating with UDM Single Sign-On...'
                    : viewMode === 'register'
                    ? 'Register UDM Account'
                    : 'Sign In to UDM-ResearchHub'}
                </span>
              </button>
            </form>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: 6-DIGIT EMAIL OTP VERIFICATION */}
          {/* ========================================================= */}
          {viewMode === 'verify_otp' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-center space-y-1.5 pb-2">
                <div className="w-12 h-12 rounded-full bg-[#1a4731]/10 border border-[#1a4731]/30 text-[#1a4731] flex items-center justify-center mx-auto shadow-inner">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Verify Your Institutional Email
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-bold text-[#1a4731] font-mono break-all">{pendingEmail}</span>.
                  Enter the code below to confirm your account.
                </p>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                    Enter 6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full max-w-[240px] mx-auto block bg-slate-50 border-2 border-slate-300 focus:border-[#1a4731] rounded-xl py-3 text-center text-2xl font-mono tracking-[0.5em] font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a4731]/15 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer border border-[#c9a84c]/30 active:scale-[0.99]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#c9a84c]" />
                  <span>{isLoading ? 'Verifying Code...' : 'Verify & Activate Account'}</span>
                </button>
              </form>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-slate-600 hover:text-[#1a4731] font-semibold flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>
                    {resendCooldown > 0
                      ? `Resend code in ${resendCooldown}s`
                      : 'Resend Verification Code'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setViewMode('register');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Change registration email
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: FORGOT PASSWORD RECOVERY */}
          {/* ========================================================= */}
          {viewMode === 'forgot_password' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center space-x-2 pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setResetSent(false);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recover UDM Account Password
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Verify your identity via your registered @udm.edu.ph institutional inbox
                  </p>
                </div>
              </div>

              {!resetSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>UDM Institutional Email (@udm.edu.ph)</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="yourname@udm.edu.ph"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
                    <span>{isLoading ? 'Sending Recovery Instructions...' : 'Send Recovery Code / Link'}</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordConfirm} className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      6-Digit Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
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
                      type="password"
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
                      type="password"
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
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#c9a84c]" />
                    <span>{isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signin');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

          {/* Toggle Footer (For Sign In & Register) */}
          {(viewMode === 'signin' || viewMode === 'register') && (
            <div className="pt-3 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => {
                  setViewMode(viewMode === 'register' ? 'signin' : 'register');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-slate-600 hover:text-[#1a4731] transition-colors font-semibold cursor-pointer"
              >
                {viewMode === 'register'
                  ? 'Already registered? Click here to Sign In'
                  : "Don't have an account? Register with your @udm.edu.ph email"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
