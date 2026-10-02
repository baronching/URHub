import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { getUserRoleDisplayLabel, formatUserDisplayName } from '../utils/userUtils';
import { 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  BookOpen, 
  Sparkles, 
  FilePlus, 
  BarChart3, 
  Settings, 
  CheckSquare,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSubmission: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenSubmission
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAdminOrSuperAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isDropdownTabActive = activeTab === 'analytics' || activeTab === 'super_admin';

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };
    if (adminDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [adminDropdownOpen]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  };

  const handleSubmissionClick = () => {
    onOpenSubmission();
    setMobileMenuOpen(false);
    setAdminDropdownOpen(false);
  };

  return (
    <header className="bg-[#1a4731] text-white border-b-4 border-[#c9a84c] sticky top-0 z-40 shadow-lg w-full">
      {/* Top institutional heraldic bar */}
      <div className="bg-[#113122] border-b border-white/10 w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1 text-xs text-slate-200 flex justify-between items-center">
          <div className="flex items-center space-x-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse shrink-0"></span>
            <span className="font-bold text-[#c9a84c] tracking-wider uppercase truncate">Universidad de Manila</span>
            <span className="text-white/30 hidden sm:inline">|</span>
            <span className="text-white font-medium hidden sm:inline">URELIA Office • Research & Extension</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-white/70 text-xs shrink-0">
            <span>Official Institutional Research Archives</span>
          </div>
        </div>
      </div>

      {/* Main Header navigation container */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
        <div className="flex items-center justify-between gap-2 lg:gap-3 xl:gap-4 w-full">
          
          {/* Brand logo */}
          <div 
            className="flex items-center space-x-2 sm:space-x-2.5 shrink-0 cursor-pointer select-none"
            onClick={() => handleTabClick('archive')}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white rounded-full p-0.5 flex items-center justify-center shadow-md border border-[#c9a84c] shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#1a4731] rounded-full flex items-center justify-center font-bold text-[11px] sm:text-xs text-[#c9a84c]">
                UDM
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm sm:text-base font-bold leading-tight text-white tracking-tight truncate">
                  UDM-ResearchHub
                </h1>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#c9a84c] text-[#1a4731] shrink-0">
                  AI ML
                </span>
              </div>
              <p className="text-[10px] text-white/80 hidden 2xl:block truncate">
                Machine Learning Research Repository • UDM
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink min-w-0">
            <button
              onClick={() => handleTabClick('archive')}
              className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors select-none cursor-pointer ${
                activeTab === 'archive'
                  ? 'bg-[#c9a84c] text-[#1a4731] font-bold shadow-sm'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>Research Archives</span>
            </button>

            <button
              onClick={() => handleTabClick('recommendations')}
              className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors select-none cursor-pointer ${
                activeTab === 'recommendations'
                  ? 'bg-[#c9a84c] text-[#1a4731] font-bold shadow-sm'
                  : 'text-white/90 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>AI Recommendations</span>
            </button>

            {/* Student/Faculty Submit button */}
            <button
              onClick={handleSubmissionClick}
              className="px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-bold bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a4731] shadow-sm flex items-center space-x-1.5 whitespace-nowrap transition-colors select-none cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5 shrink-0" />
              <span>Submit Research</span>
            </button>

            {/* Admin Review Tab */}
            {isAdminOrSuperAdmin && (
              <button
                onClick={() => handleTabClick('admin_review')}
                className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors select-none cursor-pointer ${
                  activeTab === 'admin_review'
                    ? 'bg-[#c9a84c] text-[#1a4731] font-bold shadow-sm'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Review Queue</span>
              </button>
            )}

            {/* Admin Tools Dropdown (Analytics & Reports, System Admin) */}
            {isAdminOrSuperAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`px-2.5 py-1.5 xl:px-3 xl:py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-colors select-none cursor-pointer ${
                    isDropdownTabActive
                      ? 'bg-[#c9a84c] text-[#1a4731] font-bold shadow-sm'
                      : adminDropdownOpen
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-expanded={adminDropdownOpen}
                  aria-haspopup="true"
                >
                  <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                  <span>Management</span>
                  <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-1.5 w-52 bg-[#113122] border border-[#c9a84c]/40 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => handleTabClick('analytics')}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center space-x-2.5 transition-colors cursor-pointer ${
                        activeTab === 'analytics'
                          ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold leading-tight">Analytics & Reports</span>
                        <span className="text-[10px] opacity-75">Metrics, downloads & trends</span>
                      </div>
                    </button>

                    {currentUser?.role === 'super_admin' && (
                      <button
                        onClick={() => handleTabClick('super_admin')}
                        className={`w-full text-left px-3.5 py-2 text-xs flex items-center space-x-2.5 transition-colors cursor-pointer ${
                          activeTab === 'super_admin'
                            ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                            : 'text-white/90 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Settings className="w-4 h-4 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-semibold leading-tight">System Admin</span>
                          <span className="text-[10px] opacity-75">User roles & permissions</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* User Account Controls & Mobile Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Desktop User profile info */}
            <div className="hidden sm:flex items-center space-x-3 shrink-0">
              {currentUser ? (
                <div className="flex items-center space-x-2.5 bg-white/10 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/20 shrink-0">
                  <div className="flex flex-col text-right">
                    <span 
                      className="text-xs font-bold text-white whitespace-nowrap max-w-[160px] md:max-w-[200px] xl:max-w-[240px] truncate" 
                      title={formatUserDisplayName(currentUser.name)}
                    >
                      {formatUserDisplayName(currentUser.name)}
                    </span>
                    <span className="text-[10px] text-[#c9a84c] font-mono capitalize flex items-center justify-end space-x-1">
                      <ShieldCheck className="w-3 h-3 text-[#c9a84c] shrink-0" />
                      <span className="whitespace-nowrap">
                        {getUserRoleDisplayLabel(currentUser)}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Log out"
                    className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-rose-600/60 transition-colors cursor-pointer shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a4731] shadow-md flex items-center space-x-1.5 transition-colors whitespace-nowrap select-none cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Log In</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none cursor-pointer shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile / Tablet Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-3 pb-2 border-t border-white/15 mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => handleTabClick('archive')}
                className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                  activeTab === 'archive'
                    ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Research Archives</span>
              </button>

              <button
                onClick={() => handleTabClick('recommendations')}
                className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                  activeTab === 'recommendations'
                    ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>AI Recommendations</span>
              </button>

              <button
                onClick={handleSubmissionClick}
                className="w-full px-4 py-2.5 rounded-lg text-xs font-bold bg-[#c9a84c] text-[#1a4731] flex items-center space-x-2 cursor-pointer"
              >
                <FilePlus className="w-4 h-4" />
                <span>Submit Research Paper</span>
              </button>

              {isAdminOrSuperAdmin && (
                <button
                  onClick={() => handleTabClick('admin_review')}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'admin_review'
                      ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Review Queue</span>
                </button>
              )}

              {isAdminOrSuperAdmin && (
                <button
                  onClick={() => handleTabClick('analytics')}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics & Reports</span>
                </button>
              )}

              {currentUser?.role === 'super_admin' && (
                <button
                  onClick={() => handleTabClick('super_admin')}
                  className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer ${
                    activeTab === 'super_admin'
                      ? 'bg-[#c9a84c] text-[#1a4731] font-bold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>System Admin</span>
                </button>
              )}
            </div>

            {/* Mobile User Profile / Login row */}
            <div className="pt-2 sm:hidden border-t border-white/10">
              {currentUser ? (
                <div className="flex items-center justify-between bg-white/10 px-4 py-2.5 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">
                      {formatUserDisplayName(currentUser.name)}
                    </span>
                    <span className="text-[10px] text-[#c9a84c] font-mono capitalize">
                      {getUserRoleDisplayLabel(currentUser)}
                    </span>
                  </div>
                  <button
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-lg bg-rose-600/80 text-white text-xs font-bold flex items-center space-x-1 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-lg text-xs font-bold bg-[#c9a84c] text-[#1a4731] flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Log In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

