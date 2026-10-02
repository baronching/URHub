import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Cookie, 
  BookOpen, 
  FileText, 
  Check, 
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

interface PrivacyConsentModalProps {
  isOpen: boolean;
  onAccept: (preferences: PrivacyPreferences) => void;
  onDecline?: () => void;
  isReviewMode?: boolean; // When opened from footer/settings to view or edit preferences
  onCloseReview?: () => void;
}

export interface PrivacyPreferences {
  essentialAccepted: boolean; // Always true
  analyticsAccepted: boolean;
  aiRecommendationsAccepted: boolean;
  consentTimestamp: string;
  version: string;
}

const CURRENT_POLICY_VERSION = '2026.1-DPA10173';

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
  isReviewMode = false,
  onCloseReview
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dpa10173' | 'cookies' | 'terms'>('overview');
  const [analyticsAccepted, setAnalyticsAccepted] = useState(true);
  const [aiRecommendationsAccepted, setAiRecommendationsAccepted] = useState(true);
  const [dpaAffirmed, setDpaAffirmed] = useState(true);
  const [declinedNotice, setDeclinedNotice] = useState(false);

  // Load existing preferences if available
  useEffect(() => {
    try {
      const stored = localStorage.getItem('udm_privacy_preferences');
      if (stored) {
        const parsed: PrivacyPreferences = JSON.parse(stored);
        setAnalyticsAccepted(parsed.analyticsAccepted ?? true);
        setAiRecommendationsAccepted(parsed.aiRecommendationsAccepted ?? true);
      }
    } catch {
      // Ignore parse errors
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAcceptAll = () => {
    const preferences: PrivacyPreferences = {
      essentialAccepted: true,
      analyticsAccepted: true,
      aiRecommendationsAccepted: true,
      consentTimestamp: new Date().toISOString(),
      version: CURRENT_POLICY_VERSION
    };
    localStorage.setItem('udm_privacy_consent_accepted', 'true');
    localStorage.setItem('udm_privacy_preferences', JSON.stringify(preferences));
    onAccept(preferences);
    if (onCloseReview) onCloseReview();
  };

  const handleSaveCustom = () => {
    const preferences: PrivacyPreferences = {
      essentialAccepted: true,
      analyticsAccepted,
      aiRecommendationsAccepted,
      consentTimestamp: new Date().toISOString(),
      version: CURRENT_POLICY_VERSION
    };
    localStorage.setItem('udm_privacy_consent_accepted', 'true');
    localStorage.setItem('udm_privacy_preferences', JSON.stringify(preferences));
    onAccept(preferences);
    if (onCloseReview) onCloseReview();
  };

  const handleDeclineClick = () => {
    if (isReviewMode) {
      if (onCloseReview) onCloseReview();
      return;
    }
    setDeclinedNotice(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-emerald-900/20 w-full max-w-3xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[90vh] my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        {/* Header: Auto-adjusts for Mobile, Tablet, and Desktop */}
        <div className="bg-gradient-to-r from-[#113122] via-[#1a4731] to-[#14532d] px-3.5 py-3 sm:px-6 sm:py-5 text-white flex items-start justify-between relative border-b-4 border-[#c9a84c] shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-[#c9a84c]/40 flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7 text-[#c9a84c]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-[#c9a84c]/20 text-[#fae9a4] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase border border-[#c9a84c]/30 shrink-0">
                  Compliance
                </span>
                <span className="text-emerald-200/90 text-[10px] sm:text-xs font-mono">
                  RA 10173 • RA 8293
                </span>
              </div>
              <h2 id="privacy-modal-title" className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white mt-0.5 leading-snug truncate sm:whitespace-normal">
                Data Privacy & Academic Ethics Notice
              </h2>
              <p className="text-emerald-100/90 text-[10px] sm:text-xs truncate">
                Universidad de Manila • URELIA Office
              </p>
            </div>
          </div>

          {isReviewMode && onCloseReview && (
            <button
              onClick={onCloseReview}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-1 sm:p-1.5 transition shrink-0 ml-2"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
        </div>

        {/* Informational Sub-Banner: Responsive typography & spacing */}
        <div className="bg-emerald-50/90 border-b border-emerald-200 px-3.5 py-2 sm:px-6 sm:py-2.5 text-[11px] sm:text-xs text-emerald-950 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a4731] shrink-0" />
            <span className="leading-tight sm:leading-normal">
              By accessing the portal, you agree to academic processing under the <strong>Data Privacy Act of 2012</strong>.
            </span>
          </div>
          <span className="hidden md:inline-block font-mono text-[10px] text-[#1a4731] bg-white px-2 py-0.5 rounded border border-emerald-300 font-semibold shrink-0">
            v{CURRENT_POLICY_VERSION}
          </span>
        </div>

        {/* Navigation Tabs: Thumb-friendly with short mobile labels and full tablet/desktop labels */}
        <div className="flex border-b border-slate-200 bg-slate-50/75 px-2.5 sm:px-6 pt-1 sm:pt-2 text-[11px] sm:text-xs font-medium overflow-x-auto gap-1 sm:gap-2 shrink-0 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-2.5 sm:px-3 border-b-2 font-semibold transition whitespace-nowrap select-none ${
              activeTab === 'overview'
                ? 'border-[#1a4731] text-[#1a4731] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#1a4731]'
            }`}
          >
            <span className="sm:hidden">Overview</span>
            <span className="hidden sm:inline">Overview & Quick Consent</span>
          </button>
          <button
            onClick={() => setActiveTab('dpa10173')}
            className={`pb-2 px-2.5 sm:px-3 border-b-2 font-semibold transition whitespace-nowrap select-none ${
              activeTab === 'dpa10173'
                ? 'border-[#1a4731] text-[#1a4731] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#1a4731]'
            }`}
          >
            <span className="sm:hidden">RA 10173</span>
            <span className="hidden sm:inline">Data Privacy Act (RA 10173)</span>
          </button>
          <button
            onClick={() => setActiveTab('cookies')}
            className={`pb-2 px-2.5 sm:px-3 border-b-2 font-semibold transition whitespace-nowrap select-none ${
              activeTab === 'cookies'
                ? 'border-[#1a4731] text-[#1a4731] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#1a4731]'
            }`}
          >
            <span className="sm:hidden">Cookies</span>
            <span className="hidden sm:inline">Cookies & Storage</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2 px-2.5 sm:px-3 border-b-2 font-semibold transition whitespace-nowrap select-none ${
              activeTab === 'terms'
                ? 'border-[#1a4731] text-[#1a4731] font-bold'
                : 'border-transparent text-slate-500 hover:text-[#1a4731]'
            }`}
          >
            <span className="sm:hidden">IP Code</span>
            <span className="hidden sm:inline">IP Code & Ethics</span>
          </button>
        </div>

        {/* Tab Body: Smooth scrolling with touch padding */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 text-xs sm:text-sm text-slate-700 space-y-3 sm:space-y-4">
          {declinedNotice ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 text-red-900 space-y-2.5 sm:space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-red-800">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                Consent Required to Access UDM Research Archive
              </div>
              <p className="text-xs leading-relaxed">
                In compliance with <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> and institutional policies of the Universidad de Manila, access to proprietary student capstones, faculty manuscripts, and the AI-assisted catalog requires explicit agreement to our data processing and academic copyright protection terms.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setDeclinedNotice(false)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#1a4731] text-white rounded-lg text-xs font-semibold hover:bg-[#113122] transition text-center"
                >
                  Return to Consent Options
                </button>
                {onDecline && (
                  <button
                    onClick={onDecline}
                    className="w-full sm:w-auto px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-50 transition text-center"
                  >
                    Exit Portal
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 sm:p-4 text-xs text-emerald-950 leading-relaxed">
                    <p className="font-bold text-xs sm:text-sm mb-1 text-[#1a4731]">
                      Welcome to the Universidad de Manila Research Repository (UDM-ResearchHub)
                    </p>
                    <p className="text-[11px] sm:text-xs">
                      This institutional portal is operated by the <strong>URELIA Office</strong> to safeguard intellectual assets and assist researchers across our seven colleges (CBM, CAS, CPPG, CCS, CHS, CED, CCJ).
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-[11px] sm:text-xs font-bold text-[#1a4731] uppercase tracking-wider">
                      Summary of What We Collect & Process:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 hover:border-emerald-300 transition">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5 sm:mb-1">
                          <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>User Authentication</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Your official UDM email (<code className="text-[#1a4731] font-semibold font-mono">@udm.edu.ph</code>), college affiliation, and role.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 hover:border-emerald-300 transition">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5 sm:mb-1">
                          <BookOpen className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Research Inquiries & Logs</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Search queries, reading logs, and TF-IDF interaction data used to provide smart academic recommendations.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 hover:border-emerald-300 transition">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5 sm:mb-1">
                          <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span>Manuscript Submissions</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Submitted capstones, thesis abstracts, author attributions, and advisor endorsements.
                        </p>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 sm:p-3 hover:border-emerald-300 transition">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900 mb-0.5 sm:mb-1">
                          <Cookie className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
                          <span>Essential Storage & Sessions</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          Session tokens and security cookies necessary to keep you securely signed in to Supabase.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Consent Granular Checkboxes - Touch-friendly padding */}
                  <div className="border border-emerald-100 rounded-xl p-3 sm:p-4 bg-emerald-50/40 space-y-2 sm:space-y-3 text-xs">
                    <h4 className="font-bold text-[#1a4731] text-[11px] sm:text-xs">
                      Your Privacy & Consent Preferences
                    </h4>

                    <div className="flex items-start gap-2.5 bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        id="essential-check"
                        checked={true}
                        disabled
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a4731] cursor-not-allowed opacity-75 shrink-0"
                      />
                      <label htmlFor="essential-check" className="cursor-not-allowed">
                        <span className="font-semibold text-slate-900 block text-xs">
                          Essential Cookies & Authentication Tokens (Strictly Mandatory)
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Required for security, session authentication, and database integrity.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5 bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition">
                      <input
                        type="checkbox"
                        id="analytics-check"
                        checked={analyticsAccepted}
                        onChange={(e) => setAnalyticsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a4731] cursor-pointer shrink-0"
                      />
                      <label htmlFor="analytics-check" className="cursor-pointer">
                        <span className="font-semibold text-slate-900 block text-xs">
                          Research Metrics & Institutional Analytics (Recommended)
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Anonymized count of paper views and SDG research distribution.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5 bg-white p-2.5 sm:p-3 rounded-lg border border-slate-200 hover:border-emerald-300 transition">
                      <input
                        type="checkbox"
                        id="ai-check"
                        checked={aiRecommendationsAccepted}
                        onChange={(e) => setAiRecommendationsAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a4731] cursor-pointer shrink-0"
                      />
                      <label htmlFor="ai-check" className="cursor-pointer">
                        <span className="font-semibold text-slate-900 block text-xs">
                          Personalized AI Machine Learning Recommendations
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Enables TF-IDF vectorization and Gemini AI assistance tailored to your college.
                        </span>
                      </label>
                    </div>

                    <div className="flex items-start gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="dpa-affirm"
                        checked={dpaAffirmed}
                        onChange={(e) => setDpaAffirmed(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a4731] cursor-pointer shrink-0"
                      />
                      <label htmlFor="dpa-affirm" className="text-[10px] sm:text-[11px] text-slate-700 cursor-pointer font-medium leading-snug">
                        I confirm that I have read and agree to the <strong>Data Privacy Act (RA 10173)</strong> statement and the <strong>UDM Academic Intellectual Property Policies</strong>.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DATA PRIVACY ACT OF 2012 (RA 10173) */}
              {activeTab === 'dpa10173' && (
                <div className="space-y-3 sm:space-y-4 text-xs leading-relaxed text-slate-600">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-emerald-950">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1a4731] mb-1 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#1a4731] shrink-0" />
                      Republic Act No. 10173 — Data Privacy Act of 2012
                    </h3>
                    <p className="text-[11px]">
                      The Universidad de Manila (UDM) commits to upholding the privacy rights of all researchers, faculty members, students, and guests under the National Privacy Commission (NPC) regulations.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">1. Processing Purpose</h4>
                    <p>
                      Your personal and academic data is processed solely for educational, archival, evaluation, and research linkage purposes by the <strong>URELIA Office</strong>. We do not sell, rent, or trade personal data to third parties.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">2. Rights of the Data Subject</h4>
                    <p className="mb-2">Under Section 16 of RA 10173, as a data subject you retain the following rights:</p>
                    <ul className="list-disc pl-5 space-y-1 text-[11px]">
                      <li><strong>Right to be Informed:</strong> To know whether your data is being processed, why, and how long it will be retained.</li>
                      <li><strong>Right to Access:</strong> To request a copy of your personal data, submissions, and access request records.</li>
                      <li><strong>Right to Rectification:</strong> To correct inaccurate or outdated academic entries.</li>
                      <li><strong>Right to Erasure or Blocking:</strong> To withdraw consent or request deletion of unverified draft records.</li>
                      <li><strong>Right to Damages:</strong> To be indemnified for damages incurred due to unlawful or negligent data handling.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase mb-1">3. Data Protection Officer (DPO) Contact</h4>
                    <p className="text-[11px]">
                      For inquiries, data access requests, or privacy concerns, you may contact:
                    </p>
                    <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg mt-1 font-mono text-[11px] text-slate-800">
                      <strong>Office of the Data Protection Officer / URELIA</strong><br />
                      Universidad de Manila, Mehan Gardens, Manila, Philippines<br />
                      Email: <span className="text-[#1a4731] font-bold">urelia.dpo@udm.edu.ph</span> • Web: udm.edu.ph
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: COOKIES & LOCAL STORAGE */}
              {activeTab === 'cookies' && (
                <div className="space-y-3 sm:space-y-4 text-xs leading-relaxed text-slate-600">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-emerald-950">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1a4731] mb-1 flex items-center gap-1.5">
                      <Cookie className="w-4 h-4 text-[#c9a84c] shrink-0" />
                      Cookies & Browser Storage Policy
                    </h3>
                    <p className="text-[11px]">
                      We utilize cookies and modern HTML5 Local Storage strictly for essential site functionality, authentication, and research usability.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="border border-slate-200 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-xs">1. Authentication & Security (Strictly Necessary)</span>
                        <span className="text-[#1a4731] bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">Always Active</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Stores Supabase JWT session tokens and user identity state so you do not have to re-enter credentials on every interaction.
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-xs">2. Research Preferences & Filters (Functional)</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">Active</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Remembers your selected college filters (e.g. CCS, CBA, CHS), search keywords, and reading history for your current device.
                      </p>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2.5 sm:p-3">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="text-xs">3. Machine Learning Cache (Performance)</span>
                        <span className="text-[#c9a84c] bg-amber-50 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">Active</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Caches TF-IDF token frequencies and model embeddings to ensure lightning-fast similarity scoring without unnecessary network round trips.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: INTELLECTUAL PROPERTY & ETHICS */}
              {activeTab === 'terms' && (
                <div className="space-y-3 sm:space-y-4 text-xs leading-relaxed text-slate-600">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 text-emerald-950">
                    <h3 className="font-bold text-xs sm:text-sm text-[#1a4731] mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-[#1a4731] shrink-0" />
                      Academic Intellectual Property & Fair Use (RA 8293)
                    </h3>
                    <p className="text-[11px]">
                      All capstones, dissertations, faculty research, and manuscripts archived in UDM-ResearchHub are the protected intellectual property of Universidad de Manila and their student/faculty authors.
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <p><strong>1. Abstract-Only Public Access:</strong> Research abstracts, titles, and metadata are made available for scholarly discovery and citation. Full manuscripts require an approved Access Request filed through URELIA.</p>
                    <p><strong>2. Fair Use Provision:</strong> Users may reference, quote, and cite materials strictly for educational and scientific research, provided that proper bibliographic citation is given.</p>
                    <p><strong>3. Prohibition on Commercial Scrapes:</strong> Automated harvesting, bulk redistribution, or commercial sale of UDM research manuscripts without written authorization from the University President and the URELIA Director is strictly prohibited.</p>
                    <p><strong>4. Anti-Plagiarism Guarantee:</strong> Every user agrees to practice academic honesty. Plagiarism or misattribution will result in university administrative disciplinary proceedings.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Actions Footer: Fully adaptive for Cellphone thumbs and Tablet/Desktop layouts */}
        <div className="bg-slate-50 border-t border-slate-200 px-3.5 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="w-4 h-4 text-[#1a4731] shrink-0" />
            <span>Encrypted with 256-bit SSL & TLS</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isReviewMode && (
                <button
                  type="button"
                  onClick={handleDeclineClick}
                  className="flex-1 sm:flex-initial px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition text-center"
                >
                  Decline
                </button>
              )}

              <button
                type="button"
                onClick={handleSaveCustom}
                disabled={!dpaAffirmed}
                className={`flex-1 sm:flex-initial px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 transition text-center ${
                  dpaAffirmed 
                    ? 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-[#1a4731] hover:border-emerald-300' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Save Choices
              </button>
            </div>

            <button
              type="button"
              onClick={handleAcceptAll}
              disabled={!dpaAffirmed}
              className={`w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-2 text-xs font-bold rounded-xl text-white shadow-md flex items-center justify-center gap-1.5 transition text-center ${
                dpaAffirmed 
                  ? 'bg-gradient-to-r from-[#1a4731] to-[#113122] hover:from-[#113122] hover:to-[#0c2419] hover:shadow-lg border border-[#c9a84c]/30' 
                  : 'bg-slate-400 cursor-not-allowed shadow-none'
              }`}
            >
              <Check className="w-4 h-4 text-[#c9a84c]" />
              <span>Accept & Enter Archive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
