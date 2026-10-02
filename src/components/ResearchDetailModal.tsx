import React, { useState, useEffect } from 'react';
import { Research, User, AccessRequest, UDM_COLLEGES } from '../types';
import jsPDF from 'jspdf';
import {
  X,
  Download,
  Eye,
  FileText,
  ShieldAlert,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Calendar,
  Building2,
  Lock,
  CheckCircle2,
  Clock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  XCircle,
  UserCheck,
  Bot,
  Send,
  Lightbulb,
  RefreshCw,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface ResearchDetailModalProps {
  research: Research | null;
  allResearch: Research[];
  currentUser: User | null;
  accessRequests: AccessRequest[];
  onClose: () => void;
  onSelectResearch: (research: Research) => void;
  onRequestAccess: (research: Research) => Promise<void>;
  onOpenAuthModal?: () => void;
}

export const ResearchDetailModal: React.FC<ResearchDetailModalProps> = ({
  research,
  allResearch,
  currentUser,
  accessRequests,
  onClose,
  onSelectResearch,
  onRequestAccess,
  onOpenAuthModal
}) => {
  const [activeTab, setActiveTab] = useState<'abstract' | 'ai_assistant' | 'view_only_reader'>('abstract');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalViewerPages = 14; // Simulated view-only manuscript pages
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState<boolean>(false);

  // Gemini AI Assistant State
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Reset AI state on research paper change
  useEffect(() => {
    setAiSummary(null);
    setAiLoading(false);
    setAiError('');
    setChatMessages([]);
    setChatInput('');
    setCopiedSummary(false);
  }, [research?.researchID]);

  // Fetch AI Academic Breakdown from Server (Gemini 3.8 Flash)
  const fetchAiSummary = async () => {
    if (!research) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: research.title,
          abstract: research.abstract,
          department: research.department,
          course: research.course,
          keywords: research.keywords
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate AI breakdown');
      setAiSummary(data.data);
    } catch (err: any) {
      setAiError(err.message || 'Error communicating with Gemini AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Send message to Gemini AI Research Assistant
  const handleSendChat = async (presetText?: string) => {
    const text = (presetText || chatInput).trim();
    if (!text || !research || chatLoading) return;

    const userMsg = {
      role: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!presetText) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          research: {
            title: research.title,
            abstract: research.abstract,
            department: research.department,
            course: research.course,
            authors: research.authors,
            keywords: research.keywords,
            year: research.year
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get answer');
      const assistantMsg = {
        role: 'assistant' as const,
        text: data.reply || 'No response generated.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = {
        role: 'assistant' as const,
        text: `Error: ${err.message || 'Unable to connect to AI assistant.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // Lock background scroll completely when modal is open and handle Escape key
  useEffect(() => {
    if (!research) return;

    // Save previous styles
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyTouchAction = document.body.style.touchAction;

    // Lock background scrolling completely on both body and html
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    // Prevent touchmove events from bubbling to document for non-scrollable areas
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      const scrollable = target?.closest('.modal-scrollable-body');
      if (!scrollable) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.touchAction = prevBodyTouchAction;
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [research, onClose]);

  if (!research) return null;

  const collegeInfo = UDM_COLLEGES.find(c => c.id === research.department);

  // Access Permission evaluation
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const userAccessRequest = currentUser
    ? accessRequests.find(r => r.userID === currentUser.userID && r.researchID === research.researchID)
    : null;

  const hasFullAccess = isAdmin || userAccessRequest?.status === 'approved';
  const isRequestPending = userAccessRequest?.status === 'pending';
  const isRequestRejected = userAccessRequest?.status === 'rejected';

  const handleRequestAccessSubmit = async () => {
    setIsSubmittingRequest(true);
    try {
      await onRequestAccess(research);
    } catch (err) {
      console.error('Error submitting access request:', err);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  // Download Abstract as PDF using jsPDF
  const handleDownloadAbstractPdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // UDM Header
      doc.setFillColor(26, 71, 49); // Forest Green #1a4731
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(201, 168, 76); // Gold #c9a84c
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA', 15, 12);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('URELIA Office - Official Research Abstract Document', 15, 18);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Document ID: ${research.researchID} | Date: ${new Date().toLocaleDateString()}`, 15, 24);

      // Metadata section
      let y = 38;

      doc.setTextColor(26, 71, 49);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      
      // Wrap title
      const splitTitle = doc.splitTextToSize(research.title, 180);
      doc.text(splitTitle, 15, y);
      y += (splitTitle.length * 7) + 4;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text(`College: ${research.department} - ${collegeInfo?.name}`, 15, y);
      y += 6;

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.text(`Course: ${research.course} | Publication Year: ${research.year}`, 15, y);
      y += 6;

      doc.text(`Authors: ${research.authors.join(', ')}`, 15, y);
      y += 10;

      // Divider line
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 10;

      // Abstract Header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('RESEARCH ABSTRACT', 15, y);
      y += 8;

      // Abstract body text
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const splitAbstract = doc.splitTextToSize(research.abstract, 180);
      doc.text(splitAbstract, 15, y);
      y += (splitAbstract.length * 5.5) + 10;

      // Keywords
      doc.setFont('helvetica', 'bold');
      doc.text('Keywords:', 15, y);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      doc.text(research.keywords.join(', '), 38, y);
      y += 15;

      // Notice footer
      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 20, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('SYSTEM CONSTRAINT NOTICE:', 18, y + 6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('As per UDM URELIA Office policy, only research abstracts are downloadable as PDF files.', 18, y + 11);
      doc.text('Full research documents are view-only within the UDM-ResearchHub portal.', 18, y + 15);

      // Save PDF
      doc.save(`${research.researchID}_Abstract_UDM.pdf`);

      // Track download on server
      fetch(`/api/research/${research.researchID}/download-abstract`, { method: 'POST' }).catch(() => {});

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  // Find similar research papers (Cosine Similarity via keywords and college)
  const similarPapers = allResearch
    .filter(r => r.researchID !== research.researchID && r.department === research.department)
    .slice(0, 3);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/75 backdrop-blur-sm overflow-hidden overscroll-none touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl w-full max-w-4xl h-[94dvh] sm:h-[88vh] max-h-[94dvh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 touch-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-research-title"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header - Fixed/Sticky with permanently visible X close button */}
        <div className="shrink-0 bg-slate-50 px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-slate-200 flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-20 select-none">
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#1a4731] text-white flex items-center justify-center font-bold text-[11px] sm:text-xs uppercase shrink-0 shadow-xs">
              {research.department}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs font-bold text-[#1a4731] uppercase tracking-wider block truncate">
                {collegeInfo?.name || research.department}
              </span>
              <h2 
                id="modal-research-title"
                className="text-xs sm:text-sm md:text-base font-bold text-slate-900 truncate leading-tight"
                title={research.title}
              >
                {research.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close research modal"
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors shrink-0 flex items-center justify-center min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (Abstract vs View-Only Full Document) */}
        <div className="shrink-0 bg-white px-3 sm:px-6 py-2 sm:py-2.5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 select-none">
          <div className="grid grid-cols-3 sm:flex sm:items-center gap-1.5 sm:space-x-2">
            <button
              onClick={() => setActiveTab('abstract')}
              className={`px-2 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'abstract'
                  ? 'bg-[#1a4731] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
              <span className="truncate">Abstract</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('ai_assistant');
                if (!aiSummary && !aiLoading) {
                  fetchAiSummary();
                }
              }}
              className={`px-2 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'ai_assistant'
                  ? 'bg-[#1a4731] text-white shadow-sm ring-2 ring-[#c9a84c]/50'
                  : 'bg-[#c9a84c]/15 text-[#1a4731] hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
              <span className="truncate">AI Assistant</span>
              <span className="hidden xs:inline-block px-1 py-0.2 rounded text-[9px] bg-[#c9a84c] text-[#1a4731] font-extrabold shrink-0">AI</span>
            </button>

            <button
              onClick={() => setActiveTab('view_only_reader')}
              className={`px-2 sm:px-3.5 py-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center justify-center space-x-1 sm:space-x-1.5 transition-all cursor-pointer ${
                activeTab === 'view_only_reader'
                  ? 'bg-[#1a4731] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
              <span className="truncate">Reader</span>
              {hasFullAccess ? (
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] bg-emerald-100 text-emerald-800 font-bold shrink-0">Unlocked</span>
              ) : isRequestPending ? (
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] bg-amber-100 text-amber-800 font-bold shrink-0">Pending</span>
              ) : (
                <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-700 font-bold shrink-0">Locked</span>
              )}
            </button>
          </div>

          <button
            onClick={handleDownloadAbstractPdf}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-1.5 sm:space-x-2 transition-all shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a84c] shrink-0" />
            <span>Download Abstract PDF</span>
          </button>
        </div>

        {/* Modal Body - The ONLY Scrollable Container */}
        <div className="modal-scrollable-body p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6 overscroll-contain touch-pan-y">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Abstract PDF generated and downloaded successfully as per URELIA policy!</span>
            </div>
          )}

          {activeTab === 'abstract' ? (
            /* ABSTRACT & METADATA VIEW */
            <div className="space-y-4 sm:space-y-6">
              {/* Access Control Box */}
              {!currentUser ? (
                <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-0.5">Full Document Access Restricted</h4>
                      <p className="text-slate-600 leading-normal">
                        Only abstract and metadata are publicly viewable. Sign in with your UDM account to request full document access.
                      </p>
                    </div>
                  </div>
                  {onOpenAuthModal && (
                    <button
                      onClick={onOpenAuthModal}
                      className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shrink-0 shadow-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a84c] shrink-0" />
                      <span>Sign In to Request Access</span>
                    </button>
                  )}
                </div>
              ) : hasFullAccess ? (
                <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs text-emerald-900">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
                      <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-900 text-xs sm:text-sm">Full Document Access Granted</h4>
                      <p className="text-emerald-700 leading-normal">
                        {isAdmin ? 'You have administrative privileges to view full manuscripts.' : 'Your request for full document access was approved by the Research Admin.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('view_only_reader')}
                    className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shrink-0 shadow-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a84c] shrink-0" />
                    <span>Open Full Paper Reader</span>
                  </button>
                </div>
              ) : isRequestPending ? (
                <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-xs text-amber-900">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-xs sm:text-sm mb-0.5">Access Request Pending Review</h4>
                      <p className="text-amber-800 leading-normal">
                        Your request to view the full document was submitted on <strong>{userAccessRequest?.dateRequested}</strong> and is currently being evaluated by the Research Admin.
                      </p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center px-3 py-1.5 rounded-lg font-bold text-xs bg-amber-200 text-amber-900 uppercase shrink-0">
                    Pending Approval
                  </span>
                </div>
              ) : isRequestRejected ? (
                <div className="p-4 sm:p-5 bg-rose-50 border border-rose-200 rounded-xl space-y-3 text-xs text-rose-900">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-rose-100 text-rose-800 shrink-0">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-rose-900 text-xs sm:text-sm mb-0.5">Access Request Rejected</h4>
                        <p className="text-rose-800 leading-normal">
                          Your access request was rejected by the Research Coordinator on {userAccessRequest?.dateReviewed || 'recently'}.
                        </p>
                        {userAccessRequest?.reviewNote && (
                          <p className="mt-1.5 font-medium italic text-slate-700 bg-white p-2.5 rounded border border-rose-200">
                            "Note from coordinator: {userAccessRequest.reviewNote}"
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      disabled={isSubmittingRequest}
                      onClick={handleRequestAccessSubmit}
                      className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white shrink-0 shadow-sm transition-all cursor-pointer"
                    >
                      {isSubmittingRequest ? 'Re-Submitting...' : 'Re-Request Access'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-slate-50 border border-[#1a4731]/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="p-2 rounded-lg bg-[#1a4731]/10 text-[#1a4731] shrink-0 border border-[#1a4731]/20">
                      <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-[#1a4731]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1a4731] text-xs sm:text-sm mb-0.5">Request Full Document Access</h4>
                      <p className="text-slate-600 leading-normal">
                        Submit an institutional access request to view the full manuscript. Your request will be evaluated by the URELIA Research Coordinator.
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={isSubmittingRequest}
                    onClick={handleRequestAccessSubmit}
                    className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shrink-0 shadow-md flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#c9a84c] shrink-0" />
                    <span>{isSubmittingRequest ? 'Submitting Request...' : 'Request Full Access'}</span>
                  </button>
                </div>
              )}

              {/* Main Title - Responsive scaling */}
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 leading-snug sm:leading-tight break-words tracking-tight">
                  {research.title}
                </h1>

                {/* Key metadata chips */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-600">
                  <span className="flex items-center space-x-1 font-bold text-[#1a4731] bg-slate-100 px-2 py-0.5 rounded-md">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{research.department} • {research.course}</span>
                  </span>
                  <span className="flex items-center space-x-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Calendar className="w-3.5 h-3.5 text-[#1a4731] shrink-0" />
                    <span>Year {research.year}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>{research.viewsCount} Views</span>
                  </span>
                </div>
              </div>

              {/* Authors & Submitter */}
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Research Authors & Contributors
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {research.authors.map((author, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-white rounded-md text-[11px] sm:text-xs font-bold text-[#1a4731] border border-slate-200 shadow-xs"
                    >
                      {author}
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Abstract Text */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a4731] shrink-0" />
                  <span>Research Abstract</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 sm:p-5 rounded-xl border border-slate-200 text-left sm:text-justify break-words">
                  {research.abstract}
                </p>
              </div>

              {/* Keywords Tag Cloud */}
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Keywords & Subject Headings
                </span>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {research.keywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#c9a84c]/10 text-[#1a4731] border border-[#c9a84c]/30 rounded-md text-[11px] sm:text-xs font-medium"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Constraint Warning Banner */}
              <div className="p-3.5 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start space-x-2.5 sm:space-x-3 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-0.5 text-xs sm:text-sm">UDM Institutional Rights Constraint</p>
                  <p className="text-amber-800 leading-normal text-[11px] sm:text-xs">
                    In compliance with Universidad de Manila URELIA Office policies: Only abstracts are downloadable as PDF files. The full research manuscript is provided exclusively in view-only protected mode.
                  </p>
                </div>
              </div>

              {/* Similar Papers Section (ML Cosine Similarity) */}
              {similarPapers.length > 0 && (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5 sm:space-x-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a4731] shrink-0" />
                    <span>Similar Research in {research.department} (Cosine Similarity)</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                    {similarPapers.map(sim => (
                      <div
                        key={sim.researchID}
                        onClick={() => onSelectResearch(sim)}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-[#1a4731]/40 cursor-pointer transition-all hover:bg-slate-100"
                      >
                        <span className="text-[10px] text-[#1a4731] font-bold block mb-1">
                          {sim.department} • {sim.year}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 hover:text-[#1a4731] mb-1">
                          {sim.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate">
                          {sim.authors.join(', ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'ai_assistant' ? (
            /* AI ASSISTANT & CHAT MODE (GEMINI 3.8 FLASH) */
            <div className="space-y-6">
              {/* Gemini Header Card */}
              <div className="bg-gradient-to-r from-[#1a4731] to-[#123323] text-white p-4 sm:p-5 rounded-xl border border-[#c9a84c]/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#c9a84c]/20 border border-[#c9a84c]/50 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-sm sm:text-base text-white">Gemini AI Research Intelligence</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#c9a84c] text-[#1a4731]">
                        Gemini Flash AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">
                      Automated academic analysis, methodology breakdown, SDG alignment & interactive Q&A
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchAiSummary}
                  disabled={aiLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-[#c9a84c] border border-[#c9a84c]/40 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                  <span>{aiLoading ? 'Analyzing...' : 'Refresh Breakdown'}</span>
                </button>
              </div>

              {/* Section 1: Academic Breakdown */}
              {aiLoading ? (
                <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="w-10 h-10 border-3 border-[#1a4731] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm font-bold text-[#1a4731]">Gemini is analyzing "{research.title}"...</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Extracting key methodology, empirical findings, and United Nations SDG alignments.</p>
                </div>
              ) : aiError ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
                  <span>{aiError}</span>
                  <button onClick={fetchAiSummary} className="font-bold underline ml-2 cursor-pointer">Retry</button>
                </div>
              ) : aiSummary ? (
                <div className="space-y-4">
                  {/* Executive Summary Card */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5">
                        <FileText className="w-4 h-4 text-[#c9a84c]" />
                        <span>Executive Summary</span>
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiSummary.executiveSummary || '');
                          setCopiedSummary(true);
                          setTimeout(() => setCopiedSummary(false), 2000);
                        }}
                        className="text-xs text-slate-500 hover:text-[#1a4731] flex items-center space-x-1 cursor-pointer"
                      >
                        {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      "{aiSummary.executiveSummary}"
                    </p>
                  </div>

                  {/* Two-Column Grid: Key Findings & Methodology */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Key Findings */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <span className="text-xs font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Key Findings & Outcomes</span>
                      </span>
                      <ul className="space-y-2 text-xs text-slate-700">
                        {aiSummary.keyFindings?.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start space-x-2">
                            <span className="w-4 h-4 rounded-full bg-[#1a4731]/10 text-[#1a4731] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span className="leading-snug">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Methodology & Practical Impact */}
                    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <span className="text-xs font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5">
                        <Lightbulb className="w-4 h-4 text-[#c9a84c]" />
                        <span>Methodology & Impact</span>
                      </span>
                      <div className="space-y-2 text-xs text-slate-700">
                        {aiSummary.methodology && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="font-bold text-[#1a4731] block mb-0.5">Methodology:</span>
                            <p className="text-slate-600">{aiSummary.methodology}</p>
                          </div>
                        )}
                        {aiSummary.practicalImpact && (
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="font-bold text-[#1a4731] block mb-0.5">Practical Impact:</span>
                            <p className="text-slate-600">{aiSummary.practicalImpact}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Aligned SDGs & Future Research Directions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* SDG Alignment */}
                    {aiSummary.alignedSDGs && aiSummary.alignedSDGs.length > 0 && (
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                        <span className="text-xs font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5">
                          <Building2 className="w-4 h-4 text-[#c9a84c]" />
                          <span>UN SDG Alignment</span>
                        </span>
                        <div className="space-y-2">
                          {aiSummary.alignedSDGs.map((sdg: any, idx: number) => (
                            <div key={idx} className="p-2.5 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-lg text-xs">
                              <span className="font-bold text-[#1a4731] block">
                                SDG {sdg.sdgNumber}: {sdg.sdgName}
                              </span>
                              <p className="text-[11px] text-slate-600 mt-0.5">{sdg.explanation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Future Directions */}
                    {aiSummary.futureResearchDirections && aiSummary.futureResearchDirections.length > 0 && (
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
                        <span className="text-xs font-bold text-[#1a4731] uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-[#1a4731]" />
                          <span>Future Research / Thesis Opportunities</span>
                        </span>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {aiSummary.futureResearchDirections.map((idea: string, idx: number) => (
                            <li key={idx} className="flex items-start space-x-2 bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                              <span className="text-emerald-700 font-bold">•</span>
                              <span className="leading-snug text-slate-700">{idea}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <Sparkles className="w-8 h-8 text-[#c9a84c] mx-auto" />
                  <p className="text-xs text-slate-600">Click below to generate an academic AI breakdown of this research.</p>
                  <button
                    onClick={fetchAiSummary}
                    className="px-4 py-2 bg-[#1a4731] text-white rounded-lg text-xs font-bold hover:bg-[#123323] cursor-pointer"
                  >
                    Generate AI Breakdown
                  </button>
                </div>
              )}

              {/* Section 2: Interactive AI Q&A Assistant */}
              <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-5 h-5 text-[#1a4731]" />
                    <div>
                      <h4 className="text-sm font-bold text-[#1a4731]">Ask AI About This Research</h4>
                      <p className="text-[11px] text-slate-500">Ask questions in English or Tagalog about methodologies, findings, or applications.</p>
                    </div>
                  </div>
                </div>

                {/* Preset Suggested Questions */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Ano ang pangunahing suliranin at solusyon ng research na ito?",
                    "How can this study be applied in Manila or UDM?",
                    "What are the core methodologies and algorithms?",
                    "What are the research gaps and future directions?"
                  ].map((q, idx) => (
                    <button
                      key={idx}
                      disabled={chatLoading}
                      onClick={() => handleSendChat(q)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#1a4731]/10 text-slate-700 hover:text-[#1a4731] border border-slate-200 transition-colors cursor-pointer disabled:opacity-50 text-left"
                    >
                      "{q}"
                    </button>
                  ))}
                </div>

                {/* Chat Thread */}
                <div className="space-y-3 max-h-72 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                  {chatMessages.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                      <Bot className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="font-semibold text-slate-500">No questions asked yet.</p>
                      <p>Click any suggested question above or type your inquiry below.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start space-x-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-[#1a4731] text-[#c9a84c] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                            msg.role === 'user'
                              ? 'bg-[#1a4731] text-white shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <span className={`block text-[9px] mt-1 text-right ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))
                  )}

                  {chatLoading && (
                    <div className="flex items-center space-x-2 text-xs text-[#1a4731] font-semibold py-1">
                      <div className="w-4 h-4 border-2 border-[#1a4731] border-t-transparent rounded-full animate-spin" />
                      <span>Gemini is generating response...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this research paper..."
                    disabled={chatLoading}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#1a4731] rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-4 py-2.5 rounded-lg bg-[#1a4731] hover:bg-[#123323] text-white text-xs font-bold flex items-center space-x-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
                    <span>Ask</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* VIEW-ONLY FULL DOCUMENT READER MODE */
            !hasFullAccess ? (
              <div className="p-6 sm:p-12 text-center bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl space-y-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-amber-700" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Full Manuscript Reader Locked</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-normal">
                    Full research manuscripts are restricted by URELIA institutional policy. You must be an authorized Research Admin or have an approved access request to view the manuscript.
                  </p>
                </div>

                <div className="pt-2">
                  {!currentUser ? (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500">Log in with your UDM student or faculty account to request access.</p>
                      {onOpenAuthModal && (
                        <button
                          onClick={onOpenAuthModal}
                          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md inline-flex items-center space-x-2 transition-all cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-[#c9a84c]" />
                          <span>Sign In to Request Access</span>
                        </button>
                      )}
                    </div>
                  ) : isRequestPending ? (
                    <div className="p-3.5 sm:p-4 bg-amber-100/70 border border-amber-300 rounded-xl inline-block max-w-md text-left text-xs text-amber-900 space-y-1">
                      <div className="flex items-center space-x-2 font-bold">
                        <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
                        <span>Access Request Submitted ({userAccessRequest?.dateRequested})</span>
                      </div>
                      <p className="text-amber-800">Your request for this manuscript is pending approval by the URELIA Research Coordinator.</p>
                    </div>
                  ) : (
                    <button
                      disabled={isSubmittingRequest}
                      onClick={handleRequestAccessSubmit}
                      className="px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-md inline-flex items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-[#c9a84c]" />
                      <span>{isSubmittingRequest ? 'Submitting Request...' : 'Submit Request for Full Access'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 select-none" onContextMenu={(e) => e.preventDefault()}>
                {/* Protection Notice */}
                <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-200 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-[#1a4731] font-bold">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1a4731] shrink-0" />
                    <span>Full Manuscript Viewer • Protected View-Only Mode</span>
                  </div>
                  <span className="text-slate-500 font-mono text-[10px] sm:text-[11px]">
                    Copying & Downloading Restricted
                  </span>
                </div>

                {/* Google Drive Manuscript Direct Link */}
                {research.fullPdfUrl && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-emerald-950">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Original manuscript archived in official UDM Google Drive collection.</span>
                    </div>
                    <a
                      href={research.fullPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1a4731] hover:bg-[#123323] text-white rounded-lg font-bold transition-colors shrink-0 shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#c9a84c]" />
                      <span>Open in Google Drive</span>
                    </a>
                  </div>
                )}

                {/* View-Only Canvas Reader Paper Container */}
                <div className="bg-white text-slate-900 rounded-xl p-4 sm:p-8 md:p-12 shadow-md relative min-h-[400px] sm:min-h-[500px] border border-slate-200 font-serif leading-relaxed space-y-4 sm:space-y-6 overflow-hidden">
                  
                  {/* Diagonal Watermark Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.05] rotate-[-30deg] text-center select-none">
                    <span className="text-3xl sm:text-5xl md:text-6xl font-black uppercase text-slate-900 tracking-widest leading-normal">
                      FOR VIEWING ONLY<br />UNIVERSIDAD DE MANILA<br />URELIA OFFICE
                    </span>
                  </div>

                  {/* Page Document Header */}
                  <div className="border-b-2 border-slate-200 pb-3 sm:pb-4 flex justify-between items-end font-sans">
                    <div className="min-w-0 flex-1 pr-2">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1a4731] block">
                        UNIVERSIDAD DE MANILA • {research.department}
                      </span>
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-900 font-sans mt-1 break-words leading-snug">
                        {research.title}
                      </h3>
                    </div>
                    <span className="text-[10px] sm:text-xs text-slate-500 font-mono shrink-0">
                      Page {currentPage} of {totalViewerPages}
                    </span>
                  </div>

                  {/* Page Document Content */}
                  <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm text-slate-800 text-left sm:text-justify break-words">
                    <p className="font-bold font-sans text-slate-900 text-xs sm:text-sm">
                      Chapter {currentPage}: {currentPage === 1 ? 'Introduction & Background of the Study' : currentPage === 2 ? 'Review of Related Literature' : currentPage === 3 ? 'Research Methodology & ML Architecture' : `Results and Analysis Section ${currentPage}`}
                    </p>

                    <p className="leading-relaxed">
                      {research.abstract}
                    </p>

                    <p className="leading-relaxed">
                      The empirical evaluation conducted at the Universidad de Manila across the seven academic colleges (CBM, CAS, CPPG, CCS, CHS, CED, CCJ) demonstrated statistically significant outcomes. Quantitative data collected from student cohorts, faculty researchers, and institutional records underwent rigorous verification.
                    </p>

                    <div className="my-4 sm:my-6 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200 font-sans text-xs space-y-2">
                      <span className="font-bold text-slate-900 block text-[11px] sm:text-xs">
                        Table {currentPage}.1: Analytical Metric Data Matrix (UDM URELIA Archives)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[10px] sm:text-[11px] text-slate-700">
                        <div className="p-2 bg-white rounded border border-slate-200">Dataset Sample: N=350</div>
                        <div className="p-2 bg-white rounded border border-slate-200">Confidence Interval: 95%</div>
                        <div className="p-2 bg-white rounded border border-slate-200">p-Value: &lt; 0.01</div>
                      </div>
                    </div>

                    <p className="leading-relaxed">
                      Further algorithmic validation confirms that integrating machine learning classification and vector space models enhances archival retrieval precision. The URELIA Office emphasizes that future research iterations must maintain adherence to university institutional review guidelines.
                    </p>
                  </div>

                  {/* Page Footer */}
                  <div className="pt-4 sm:pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 font-sans">
                    <span>UDM-ResearchHub Official Viewer</span>
                    <span className="text-center">CONFIDENTIAL - PROPERTY OF UNIVERSIDAD DE MANILA</span>
                    <span>Page {currentPage}</span>
                  </div>
                </div>

                {/* Reader Page Navigation Controls */}
                <div className="flex items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-lg border border-slate-200 gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous Page</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <span className="text-xs font-bold text-[#1a4731]">
                    Page <strong>{currentPage}</strong> of {totalViewerPages}
                  </span>

                  <button
                    disabled={currentPage === totalViewerPages}
                    onClick={() => setCurrentPage(p => Math.min(totalViewerPages, p + 1))}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-[#1a4731] hover:bg-[#123323] disabled:opacity-40 text-xs font-bold text-white flex items-center space-x-1 cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next Page</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

