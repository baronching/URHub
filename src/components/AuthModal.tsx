import React, { useState, useEffect } from 'react';
import { User, UDMCollege, UDM_COLLEGES } from '../types';
import {
  registerUserWithSupabase,
  loginUserWithSupabase
} from '../services/supabaseService';
import {
  X,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  Lock,
  Mail,
  GraduationCap,
  Briefcase,
  IdCard,
  BookOpen
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);

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

  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // 1. Client-side Domain Validation
        if (!email.trim().toLowerCase().endsWith('@udm.edu.ph')) {
          throw new Error('Registration requires an official UDM email address ending in @udm.edu.ph');
        }

        // 2. Client-side Password Match Check
        if (password !== confirmPassword) {
          throw new Error('Password and Confirm Password do not match.');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }

        if (!fullName.trim()) {
          throw new Error('Full Name is required.');
        }

        if (!idNumber.trim()) {
          throw new Error('Student/Faculty ID Number is required.');
        }

        // Execute Supabase Auth + User profile creation
        const registeredUser = await registerUserWithSupabase({
          fullName,
          email,
          password,
          confirmPassword,
          role: userType,
          college,
          idNumber,
          courseProgram,
          yearLevel: userType === 'Student' ? yearLevel : undefined
        });

        try {
          localStorage.setItem('udm_active_user', JSON.stringify(registeredUser));
        } catch {}
        onLoginSuccess(registeredUser);
        onClose();
      } else {
        // Flexible login via Full Email, Username, or ID Number (bypasses unconfirmed email error)
        const authenticatedUser = await loginUserWithSupabase(email, password);
        try {
          localStorage.setItem('udm_active_user', JSON.stringify(authenticatedUser));
        } catch {}
        onLoginSuccess(authenticatedUser);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials or click an account below.');
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
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                !isRegister
                  ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all text-center cursor-pointer ${
                isRegister
                  ? 'bg-white text-[#1a4731] shadow-xs border border-slate-200 font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register UDM Account
            </button>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start space-x-2.5 font-medium animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}


          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
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

            {/* Email Address / Username / ID Number */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-[#1a4731]" />
                <span>
                  {isRegister
                    ? 'UDM Institutional Email * (@udm.edu.ph)'
                    : 'UDM Email, Username, or ID Number *'}
                </span>
              </label>
              <input
                type={isRegister ? 'email' : 'text'}
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={isRegister ? 'yourname@udm.edu.ph' : 'e.g. blching@udm.edu.ph, blching, or 23-22-005'}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none font-mono"
              />
              {!isRegister && (
                <p className="text-[10px] text-slate-500 mt-1">
                  Supports your full @udm.edu.ph email, username, or Student/Faculty ID number.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5 text-[#1a4731]" />
                <span>Password *</span>
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] focus:outline-none"
              />
            </div>

            {/* Confirm Password (Shown during Registration) */}
            {isRegister && (
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

            {isRegister && (
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
                      <option value="Faculty_Admin">Faculty & Administration</option>
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

                {/* Course/Program (Optional) & Year Level (Conditional for Students) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center space-x-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#1a4731]" />
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

                  {/* Year Level - Shown ONLY when Role = "Student" */}
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
              className="w-full py-3 rounded-xl text-xs font-extrabold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2 border border-[#c9a84c]/30 active:scale-[0.99]"
            >
              <span>
                {isLoading
                  ? 'Authenticating with UDM Firebase Server...'
                  : isRegister
                  ? 'Create UDM Institutional Account'
                  : 'Sign In to UDM-ResearchHub'}
              </span>
            </button>
          </form>

          {/* Toggle Footer */}
          <div className="pt-3 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-slate-600 hover:text-[#1a4731] transition-colors font-semibold"
            >
              {isRegister
                ? 'Already registered? Click here to Sign In'
                : "Don't have an account? Register with your @udm.edu.ph email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
