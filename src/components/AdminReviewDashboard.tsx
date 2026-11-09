import React, { useState } from 'react';
import { Submission, User, UDM_COLLEGES, Research } from '../types';
import {
  isDean,
  isProgramChair,
  isUrelia,
  isUreliaDirector,
  isUreliaAdmin,
  isUreliaPersonnel,
  canApproveOrRejectSubmissions
} from '../utils/userUtils';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  User as UserIcon,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Download,
  X,
  Send,
  Award,
  Globe,
  Calendar,
  Building2,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import jsPDF from 'jspdf';

interface AdminReviewDashboardProps {
  currentUser: User | null;
  submissions: Submission[];
  accessRequests?: any[];
  onReviewSubmission: (submissionID: string, status: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
  onEndorseSubmission?: (submissionID: string, comments: string) => Promise<void>;
  onRequestRevision?: (submissionID: string, reason: string) => Promise<void>;
  onReviewAccessRequest?: (requestID: string, status: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
  onOpenResearch?: (research: Research, initialTab?: 'abstract' | 'full_paper') => void;
}

export const AdminReviewDashboard: React.FC<AdminReviewDashboardProps> = ({
  currentUser,
  submissions,
  onReviewSubmission,
  onEndorseSubmission,
  onRequestRevision,
  onOpenResearch
}) => {
  const isDeanUser = isDean(currentUser);
  const isChairUser = isProgramChair(currentUser);
  const isUreliaUser = isUrelia(currentUser);
  const isPersonnelUser = isUreliaPersonnel(currentUser);
  const canApproveReject = canApproveOrRejectSubmissions(currentUser);

  // Helper to convert Submission into Research format for full reader modal
  const convertSubmissionToResearch = (sub: Submission): Research => {
    return {
      researchID: sub.researchID || sub.submissionID,
      title: sub.title,
      abstract: sub.abstract,
      authors: sub.authors && sub.authors.length > 0 ? sub.authors : [sub.submitterName || 'UDM Researcher'],
      keywords: sub.keywords && sub.keywords.length > 0 ? sub.keywords : ['Academic Capstone', 'UDM Research'],
      department: sub.department,
      course: sub.course,
      year: sub.year || 2026,
      status: sub.status || 'pending',
      publicationType: sub.publicationType || 'unpublished',
      documentNumber: sub.documentNumber,
      version: sub.version || 'v1.0',
      viewsCount: 0,
      downloadsCount: 0,
      submittedBy: sub.submittedBy,
      dateAdded: sub.dateSubmitted,
      fullPdfUrl: sub.pdfFileName ? `/uploads/${sub.pdfFileName}` : undefined,
      authorCategory: sub.authorCategory,
      publicationProof: sub.publicationProof
    };
  };

  // Submissions filtered by role authority scope:
  // - Dean: strictly their designated college
  // - Program Chair: their designated college / submissions
  // - URELIA: university-wide (all colleges)
  const scopedSubmissions = submissions.filter(s => {
    if (isDeanUser) {
      return s.department === currentUser?.college;
    }
    if (isChairUser) {
      return s.department === currentUser?.college || s.submittedBy === currentUser?.userID;
    }
    return true; // URELIA sees all
  });

  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'endorsed'>('pending');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [overrideTitleMismatch, setOverrideTitleMismatch] = useState(false);

  // Filter based on active tab
  const filteredSubmissions = scopedSubmissions.filter(s => {
    if (activeTab === 'pending') {
      if (isDeanUser) {
        // Dean sees unpublished papers waiting for dean review
        return s.status === 'pending' && (!s.workflowStatus || s.workflowStatus === 'pending_dean');
      }
      if (isUreliaUser) {
        // URELIA sees items endorsed by dean or direct published submissions
        return s.status === 'pending' && (s.workflowStatus === 'endorsed_to_urelia' || s.workflowStatus === 'pending_urelia' || !s.workflowStatus);
      }
      return s.status === 'pending';
    }
    if (activeTab === 'endorsed') {
      return s.workflowStatus === 'endorsed_to_urelia' && s.status === 'pending';
    }
    if (activeTab === 'approved') {
      return s.status === 'approved';
    }
    if (activeTab === 'rejected') {
      return s.status === 'rejected' || s.workflowStatus === 'revision_requested';
    }
    return true;
  });

  const pendingCount = scopedSubmissions.filter(s => {
    if (isDeanUser) return s.status === 'pending' && (!s.workflowStatus || s.workflowStatus === 'pending_dean');
    if (isUreliaUser) return s.status === 'pending' && (s.workflowStatus === 'endorsed_to_urelia' || s.workflowStatus === 'pending_urelia' || !s.workflowStatus);
    return s.status === 'pending';
  }).length;

  const escapeHtml = (text: string) => {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  // Full Paper Viewer Simulation in New Tab
  const handleViewFullDocumentInNewTab = (sub: Submission) => {
    const collegeInfo = UDM_COLLEGES.find(c => c.id === sub.department);
    const collegeName = collegeInfo?.name || `College of ${sub.department}`;
    const authorsStr = sub.authors && sub.authors.length > 0 ? sub.authors.join(', ') : sub.submitterName;
    const year = sub.year || 2026;
    const fileName = sub.pdfFileName || `${sub.submissionID}_Manuscript.pdf`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(sub.submissionID)} - Institutional Manuscript Evaluation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 40px; margin: 0; line-height: 1.6; }
    .container { max-width: 840px; margin: 0 auto; background: white; padding: 60px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #1a4731; padding-bottom: 24px; margin-bottom: 32px; }
    .title { font-size: 22px; font-weight: 800; color: #1a4731; margin-bottom: 8px; }
    .meta { font-size: 13px; color: #64748b; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 11px; background: #e0f2fe; color: #0369a1; text-transform: uppercase; margin-bottom: 12px; }
    .h3 { font-size: 15px; font-weight: 700; color: #1a4731; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
    p { font-size: 13px; color: #334155; line-height: 1.7; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${escapeHtml(sub.documentNumber || sub.submissionID)} • ${escapeHtml(sub.version || 'v1.0')}</div>
      <div class="title">${escapeHtml(sub.title)}</div>
      <div class="meta">${escapeHtml(authorsStr)} &bull; ${escapeHtml(collegeName)} &bull; ${year}</div>
      <div class="meta" style="margin-top: 4px; font-style: italic;">Classification: ${sub.publicationType === 'unpublished' ? 'Unpublished (Thesis / Capstone)' : 'Published External Study'}</div>
    </div>
    <div class="h3">ABSTRACT</div>
    <p>${escapeHtml(sub.abstract)}</p>
    <div class="h3">KEYWORDS</div>
    <p>${escapeHtml(sub.keywords ? sub.keywords.join(', ') : 'Academic Research, UDM')}</p>
    <div class="h3">INSTITUTIONAL METADATA & SUBMISSION PROOF</div>
    <p><strong>Submitter:</strong> ${escapeHtml(sub.submitterName)} (${escapeHtml(sub.submitterEmail)})</p>
    <p><strong>File Name:</strong> ${escapeHtml(fileName)}</p>
    ${sub.publicationProof?.externalUrl ? `<p><strong>Publication Evidence URL:</strong> <a href="${escapeHtml(sub.publicationProof.externalUrl)}" target="_blank">${escapeHtml(sub.publicationProof.externalUrl)}</a></p>` : ''}
    ${sub.publicationProof?.publisherName ? `<p><strong>Publisher / Conference:</strong> ${escapeHtml(sub.publicationProof.publisherName)}</p>` : ''}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Download Evaluation PDF
  const handleDownloadPdf = (sub: Submission) => {
    setIsDownloadingPdf(true);
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFillColor(26, 71, 49);
      doc.rect(0, 0, 210, 22, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA • URELIA OFFICE', 105, 12, { align: 'center' });
      doc.setFontSize(9);
      doc.text('Official Institutional Research Manuscript Evaluation Copy', 105, 18, { align: 'center' });

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text(doc.splitTextToSize(sub.title, 170), 20, 36);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Document: ${sub.documentNumber || sub.submissionID} • Version: ${sub.version || 'v1.0'}`, 20, 52);
      doc.text(`Submitter: ${sub.submitterName} (${sub.department}) • Date: ${sub.dateSubmitted}`, 20, 58);

      doc.setFontSize(10);
      doc.setTextColor(26, 71, 49);
      doc.setFont('helvetica', 'bold');
      doc.text('ABSTRACT', 20, 70);

      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      const abstractLines = doc.splitTextToSize(sub.abstract, 170);
      doc.text(abstractLines, 20, 76);

      doc.save(`${sub.documentNumber || sub.submissionID}_Evaluation.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Dean Endorsement Action
  const handleDeanEndorse = async () => {
    if (!selectedSubmission || !onEndorseSubmission) return;
    setIsProcessing(true);
    try {
      await onEndorseSubmission(selectedSubmission.submissionID, reviewNote);
      setSelectedSubmission(null);
      setReviewNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Revision Request Action
  const handleRequestRevisionAction = async () => {
    if (!selectedSubmission || !onRequestRevision) return;
    if (!reviewNote.trim()) {
      alert('Please specify the revision reason or comments for the submitter.');
      return;
    }
    setIsProcessing(true);
    try {
      await onRequestRevision(
        selectedSubmission.submissionID,
        reviewNote
      );
      setSelectedSubmission(null);
      setReviewNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  // URELIA Final Approval
  const handleFinalApproval = async () => {
    if (!selectedSubmission) return;

    // Title Integrity Restriction: Restrict approval if title does not match metadata
    const isMismatch = selectedSubmission.titleIntegrity?.flaggedMismatch;
    if (isMismatch && !overrideTitleMismatch) {
      alert('Approval Restricted: The encoded title does not match the actual title in the full paper file. You must reject this submission or verify title reconciliation before approving.');
      return;
    }

    setIsProcessing(true);
    try {
      await onReviewSubmission(selectedSubmission.submissionID, 'approved', reviewNote);
      setSelectedSubmission(null);
      setReviewNote('');
      setOverrideTitleMismatch(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Rejection Action
  const handleReject = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      await onReviewSubmission(selectedSubmission.submissionID, 'rejected', reviewNote || 'Rejected due to title discrepancy or non-compliance.');
      setSelectedSubmission(null);
      setReviewNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Scope Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-[#1a4731] text-white">
                <ShieldCheck className="w-5 h-5 text-[#c9a84c]" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-[#1a4731]">
                  {isDeanUser
                    ? `College Dean Evaluation Portal (${currentUser?.college})`
                    : isChairUser
                    ? `Program Chair Submissions & Routing Portal`
                    : `URELIA Research Archival & Final Approval Center`}
                </h2>
                <p className="text-xs text-slate-500">
                  {isDeanUser
                    ? 'Review college thesis submissions, provide academic feedback, and endorse to URELIA Office.'
                    : isChairUser
                    ? 'Track department paper submissions, Dean evaluations, and URELIA publishing status.'
                    : 'University-wide manuscript verification, title integrity audits, and final archival authorization.'}
                </p>
              </div>
            </div>
          </div>

          {/* Pending Queue Count Pill */}
          <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shrink-0 space-x-2 text-[#1a4731]">
            <CheckSquare className="w-4 h-4 text-[#c9a84c]" />
            <span>Action Queue:</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold ml-1">
              {pendingCount} Awaiting Action
            </span>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold gap-1 w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Pending ({pendingCount})</span>
          </button>

          {(isDeanUser || isChairUser) && (
            <button
              onClick={() => setActiveTab('endorsed')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
                activeTab === 'endorsed'
                  ? 'bg-[#1a4731] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
              <span>Endorsed to URELIA</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'approved'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Approved & Archived</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'rejected'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Revisions / Rejected</span>
          </button>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-500 text-xs">
          No research submissions currently found under this queue.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSubmissions.map((sub) => {
            const isMismatch = sub.titleIntegrity?.flaggedMismatch;

            return (
              <div
                key={sub.submissionID}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-5"
              >
                <div className="space-y-2.5 max-w-3xl">
                  {/* Badges Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                      {sub.documentNumber || sub.submissionID} • {sub.version || 'v1.0'}
                    </span>

                    <span className="px-2 py-0.5 rounded font-bold bg-[#1a4731] text-white uppercase text-[10px]">
                      {sub.department}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        sub.publicationType === 'unpublished'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {sub.publicationType === 'unpublished' ? 'Unpublished (Thesis)' : 'Published External'}
                    </span>

                    {/* Routing State Pill */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.workflowStatus === 'endorsed_to_urelia'
                          ? 'bg-indigo-100 text-indigo-800'
                          : sub.workflowStatus === 'revision_requested'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {sub.status === 'approved'
                        ? '✓ Archived'
                        : sub.workflowStatus === 'endorsed_to_urelia'
                        ? 'Endorsed to URELIA'
                        : sub.workflowStatus === 'revision_requested'
                        ? 'Revision Needed'
                        : 'Awaiting Review'}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {sub.title}
                  </h3>

                  {/* Abstract Preview */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {sub.abstract}
                  </p>

                  {/* Submitter & Author Meta */}
                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center space-x-1">
                      <UserIcon className="w-3.5 h-3.5 text-[#1a4731]" />
                      <span>Submitter: <strong>{sub.submitterName}</strong> ({sub.submitterEmail})</span>
                    </span>
                    <span>Authors: {sub.authors ? sub.authors.join(', ') : 'N/A'}</span>
                    <span>Submitted: {sub.dateSubmitted}</span>
                  </div>

                  {/* Title Integrity Indicator Badge */}
                  {sub.titleIntegrity && (
                    <div
                      className={`p-2 rounded-lg text-[11px] font-medium flex items-center space-x-1.5 border ${
                        isMismatch
                          ? 'bg-rose-50 text-rose-900 border-rose-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                      }`}
                    >
                      {isMismatch ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                      <span>
                        Title Integrity: <strong>{sub.titleIntegrity.matchScore}% Match</strong> &bull; {sub.titleIntegrity.notes}
                      </span>
                    </div>
                  )}

                  {/* Dean Comments (if endorsed) */}
                  {sub.deanComments && (
                    <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Dean's Endorsement ({sub.deanEndorsedBy}):</strong> {sub.deanComments}
                      </div>
                    </div>
                  )}

                  {/* Dean Rejection / Revision Directives (Prominently visible to Program Chair) */}
                  {sub.reviewNote && (sub.status === 'rejected' || sub.workflowStatus === 'revision_requested') && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-950 space-y-1">
                      <div className="font-bold flex items-center space-x-1.5 text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>
                          {sub.deanEndorsedBy ? `Dean's Evaluation Feedback (${sub.deanEndorsedBy})` : 'Dean / Reviewer Feedback & Rejection Reason'}:
                        </span>
                      </div>
                      <p className="text-slate-800 bg-white/90 p-2.5 rounded-lg border border-rose-200 leading-relaxed font-medium">
                        "{sub.reviewNote}"
                      </p>
                      {isChairUser && (
                        <p className="text-[10px] text-rose-700 font-semibold pt-0.5">
                          • Action for Program Chair: Review the Dean's feedback, update the manuscript, and re-submit as v1.1.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Publication Proof Preview (if published) */}
                  {sub.publicationProof?.externalUrl && (
                    <div className="p-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-700 shrink-0" />
                      <span>
                        Published at: <strong>{sub.publicationProof.publisherName || 'External Journal'}</strong> &bull;{' '}
                        <a
                          href={sub.publicationProof.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="underline font-bold text-purple-900 hover:text-purple-700"
                        >
                          View External Link
                        </a>
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Triggers */}
                <div className="shrink-0 flex flex-wrap md:flex-col items-end justify-center gap-2">
                  {onOpenResearch && (
                    <button
                      type="button"
                      onClick={() => onOpenResearch(convertSubmissionToResearch(sub), 'full_paper')}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                      title="Open full embedded manuscript PDF reader"
                    >
                      <BookOpen className="w-4 h-4 text-[#c9a84c]" />
                      <span>Read Full PDF</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setReviewNote('');
                      setOverrideTitleMismatch(false);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-[#1a4731] border border-[#1a4731]/40 shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4 text-[#c9a84c]" />
                    <span>
                      {isDeanUser ? 'Evaluate & Endorse' : isChairUser ? 'View Details' : 'Review & Approve'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation Modal Dialog */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl my-6 shadow-2xl p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="border-b border-dashed border-slate-200 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#c9a84c]" />
                <h3 className="text-base font-bold text-[#1a4731]">
                  Evaluation: <span className="font-mono text-slate-800">{selectedSubmission.documentNumber || selectedSubmission.submissionID}</span> ({selectedSubmission.version || 'v1.0'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Info */}
            <div className="space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p>
                <strong className="text-slate-900">Encoded Title:</strong> {selectedSubmission.title}
              </p>
              <p>
                <strong className="text-slate-900">Authors:</strong> {selectedSubmission.authors ? selectedSubmission.authors.join(', ') : 'N/A'}
              </p>
              <p>
                <strong className="text-slate-900">College / Course:</strong> {selectedSubmission.department} &bull; {selectedSubmission.course}
              </p>
              <p>
                <strong className="text-slate-900">Submitter:</strong> {selectedSubmission.submitterName} ({selectedSubmission.submitterEmail})
              </p>
              <p>
                <strong className="text-slate-900">Manuscript File:</strong>{' '}
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  {selectedSubmission.pdfFileName || 'manuscript.pdf'}
                </span>
              </p>
            </div>

            {/* Document Readers / Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {onOpenResearch && (
                <button
                  type="button"
                  onClick={() => {
                    const resObj = convertSubmissionToResearch(selectedSubmission);
                    setSelectedSubmission(null);
                    onOpenResearch(resObj, 'full_paper');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span>Open Full PDF Reader</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleViewFullDocumentInNewTab(selectedSubmission)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-[#1a4731] border border-[#1a4731]/40 shadow-2xs flex items-center space-x-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#1a4731]" />
                <span>Read in New Tab</span>
                <ExternalLink className="w-3 h-3 text-[#1a4731]" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedSubmission)}
                disabled={isDownloadingPdf}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 text-[#1a4731] border border-[#c9a84c]/40 shadow-2xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download Evaluation Copy'}</span>
              </button>
            </div>

            {/* Title Integrity Check Audit Section */}
            {selectedSubmission.titleIntegrity && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  selectedSubmission.titleIntegrity.flaggedMismatch
                    ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                    : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                }`}
              >
                <div className="flex items-center space-x-2 font-bold">
                  {selectedSubmission.titleIntegrity.flaggedMismatch ? (
                    <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  )}
                  <span>
                    Title Integrity Check: {selectedSubmission.titleIntegrity.matchScore}% Match
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {selectedSubmission.titleIntegrity.notes}
                </p>

                {/* Mismatch Alert for Reviewer */}
                {selectedSubmission.titleIntegrity.flaggedMismatch && (
                  <div className="pt-1.5 border-t border-rose-200 mt-1">
                    <p className="font-bold text-rose-900 text-[11px]">
                      Policy Restriction: URELIA guidelines require rejecting submissions where paper titles do not match metadata.
                    </p>
                    {isUreliaUser && (
                      <label className="mt-1.5 flex items-center space-x-2 text-[11px] text-slate-800 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={overrideTitleMismatch}
                          onChange={e => setOverrideTitleMismatch(e.target.checked)}
                          className="rounded text-[#1a4731] focus:ring-[#1a4731]"
                        />
                        <span>I have manually verified and reconciled the title in the full manuscript document.</span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Publication Proof (if published paper) */}
            {selectedSubmission.publicationType === 'published' && selectedSubmission.publicationProof && (
              <div className="p-3 bg-purple-50/80 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-1">
                <div className="font-bold flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>Publication Proof & Evidence:</span>
                </div>
                <p>
                  <strong>Publisher / Conference:</strong> {selectedSubmission.publicationProof.publisherName || 'N/A'}
                </p>
                {selectedSubmission.publicationProof.presentationDate && (
                  <p>
                    <strong>Presentation / Publication Date:</strong> {selectedSubmission.publicationProof.presentationDate}
                  </p>
                )}
                {selectedSubmission.publicationProof.externalUrl && (
                  <p className="break-all">
                    <strong>URL:</strong>{' '}
                    <a
                      href={selectedSubmission.publicationProof.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-purple-900"
                    >
                      {selectedSubmission.publicationProof.externalUrl}
                    </a>
                  </p>
                )}
              </div>
            )}

            {/* Dean's Feedback on Rejection / Revision */}
            {selectedSubmission.reviewNote && (
              <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl space-y-1.5">
                <div className="flex items-center space-x-2 text-rose-800 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {selectedSubmission.deanEndorsedBy
                      ? `Dean's Official Evaluation Feedback (${selectedSubmission.deanEndorsedBy})`
                      : 'Reviewer Feedback & Rejection Directives'}:
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-medium bg-white p-3 rounded-lg border border-rose-200 leading-relaxed">
                  "{selectedSubmission.reviewNote}"
                </p>
                {isChairUser && (
                  <p className="text-[10px] text-rose-700 font-semibold">
                    • Program Chair Action: Close this window and click "Submit Research" in the top bar to re-submit the updated manuscript as v1.1.
                  </p>
                )}
              </div>
            )}

            {/* Abstract */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Abstract:
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-32 overflow-y-auto text-xs text-slate-700 leading-relaxed">
                {selectedSubmission.abstract}
              </div>
            </div>

            {/* Review Notes / Endorsement Comments */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                {isDeanUser
                  ? "Dean's Evaluation Feedback & Endorsement Comments"
                  : "Reviewer Feedback / Revision Notes"}
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder={
                  isDeanUser
                    ? "Enter feedback or endorsement notes for URELIA Office..."
                    : "Enter review notes, feedback, or rejection reasons..."
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-[#1a4731]"
              />
            </div>

            {/* Action Buttons based on Role */}
            <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>

              {/* Dean Actions: Forward / Endorse to URELIA or Request Revision */}
              {isDeanUser && selectedSubmission.status === 'pending' && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleRequestRevisionAction}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Return for Revision</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleDeanEndorse}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#c9a84c]" />
                    <span>Forward / Endorse to URELIA</span>
                  </button>
                </>
              )}

              {/* URELIA Final Approval Actions (Restricted to Director & Admin; Staff cannot approve/reject) */}
              {isUreliaUser && canApproveReject && selectedSubmission.status === 'pending' && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleRequestRevisionAction}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleReject}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center space-x-1 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Submission</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      isProcessing ||
                      (selectedSubmission.titleIntegrity?.flaggedMismatch && !overrideTitleMismatch)
                    }
                    onClick={handleFinalApproval}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
                    title={
                      selectedSubmission.titleIntegrity?.flaggedMismatch && !overrideTitleMismatch
                        ? 'Approval restricted: Title discrepancy must be verified/resolved.'
                        : ''
                    }
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                    <span>
                      {selectedSubmission.publicationType === 'unpublished'
                        ? 'Final Approve as Unpublished Archive'
                        : 'Final Approve & Publish to Catalog'}
                    </span>
                  </button>
                </>
              )}

              {/* URELIA Personnel notice */}
              {isPersonnelUser && selectedSubmission.status === 'pending' && (
                <div className="text-[11px] text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 font-medium">
                  • <strong>URELIA Staff Notice:</strong> Research Personnel submit papers directly to the Director. Final approval and rejection authority is exclusively reserved for the URELIA Director.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
