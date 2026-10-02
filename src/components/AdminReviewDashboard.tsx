import React, { useState } from 'react';
import { Submission, AccessRequest, UDM_COLLEGES } from '../types';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  User as UserIcon,
  Building2,
  Calendar,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

interface AdminReviewDashboardProps {
  submissions: Submission[];
  accessRequests: AccessRequest[];
  onReviewSubmission: (submissionID: string, status: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
  onReviewAccessRequest: (requestID: string, status: 'approved' | 'rejected', reviewNote: string) => Promise<void>;
}

export const AdminReviewDashboard: React.FC<AdminReviewDashboardProps> = ({
  submissions,
  accessRequests,
  onReviewSubmission,
  onReviewAccessRequest
}) => {
  const [mainSection, setMainSection] = useState<'submissions' | 'access_requests'>('access_requests');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  
  // Selection for Submissions evaluation modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Selection for Access Request evaluation modal
  const [selectedAccessRequest, setSelectedAccessRequest] = useState<AccessRequest | null>(null);

  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredSubmissions = submissions.filter(s => s.status === activeTab);
  const filteredAccessRequests = accessRequests.filter(r => r.status === activeTab);

  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;
  const pendingAccessRequestsCount = accessRequests.filter(r => r.status === 'pending').length;

  const handleSubmissionAction = async (status: 'approved' | 'rejected') => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      await onReviewSubmission(selectedSubmission.submissionID, status, reviewNote);
      setSelectedSubmission(null);
      setReviewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccessRequestAction = async (status: 'approved' | 'rejected') => {
    if (!selectedAccessRequest) return;
    setIsProcessing(true);
    try {
      await onReviewAccessRequest(selectedAccessRequest.requestID, status, reviewNote);
      setSelectedAccessRequest(null);
      setReviewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Main Section Switcher */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20">
                <ShieldCheck className="w-5 h-5 text-[#1a4731]" />
              </span>
              <h2 className="text-xl font-bold text-[#1a4731]">
                URELIA Research Admin Management Center
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Evaluate paper submissions and process institutional full-document access requests for UDM archives.
            </p>
          </div>

          {/* Main Section Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold shrink-0">
            <button
              onClick={() => {
                setMainSection('access_requests');
                setActiveTab('pending');
              }}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                mainSection === 'access_requests'
                  ? 'bg-[#1a4731] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-4 h-4 text-[#c9a84c]" />
              <span>Access Requests</span>
              {pendingAccessRequestsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
                  {pendingAccessRequestsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMainSection('submissions');
                setActiveTab('pending');
              }}
              className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
                mainSection === 'submissions'
                  ? 'bg-[#1a4731] text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-[#c9a84c]" />
              <span>Paper Submissions</span>
              {pendingSubmissionsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-900 font-extrabold">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Status Sub-Tab triggers */}
        <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200 text-xs font-bold w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'pending'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>
              Pending (
              {mainSection === 'access_requests'
                ? accessRequests.filter(r => r.status === 'pending').length
                : submissions.filter(s => s.status === 'pending').length}
              )
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'approved'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>
              Approved (
              {mainSection === 'access_requests'
                ? accessRequests.filter(r => r.status === 'approved').length
                : submissions.filter(s => s.status === 'approved').length}
              )
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-1.5 rounded-md transition-all flex items-center space-x-1.5 ${
              activeTab === 'rejected'
                ? 'bg-[#1a4731] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>
              Rejected (
              {mainSection === 'access_requests'
                ? accessRequests.filter(r => r.status === 'rejected').length
                : submissions.filter(s => s.status === 'rejected').length}
              )
            </span>
          </button>
        </div>
      </div>

      {/* SECTION 1: ACCESS REQUESTS QUEUE */}
      {mainSection === 'access_requests' && (
        filteredAccessRequests.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
            No full-document access requests found in the {activeTab} queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAccessRequests.map((req) => (
              <div
                key={req.requestID}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#1a4731]/30 transition-all"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded font-bold bg-[#1a4731] text-white font-mono">
                      {req.requestID}
                    </span>
                    {req.college && (
                      <span className="px-2 py-0.5 rounded font-bold bg-[#c9a84c]/20 text-[#1a4731]">
                        {req.college}
                      </span>
                    )}
                    <span className="text-slate-500 font-medium">Requested: {req.dateRequested}</span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                      Target Research Manuscript
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {req.researchTitle}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">Paper ID: {req.researchID}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="flex items-center space-x-1.5 font-bold text-[#1a4731]">
                      <UserIcon className="w-4 h-4 text-[#1a4731]" />
                      <span>{req.userName}</span>
                    </span>
                    <span>•</span>
                    <span>Email: <strong>{req.userEmail}</strong></span>
                    <span>•</span>
                    <span>Role/Type: <strong>{req.userRoleOrType || 'Student / Faculty'}</strong></span>
                  </div>

                  {req.reviewNote && (
                    <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                      <MessageSquare className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong>Review Note:</strong> {req.reviewNote} ({req.reviewedBy || 'Admin'})
                      </div>
                    </div>
                  )}
                </div>

                {/* Review Action triggers */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  {req.status === 'pending' ? (
                    <button
                      onClick={() => {
                        setSelectedAccessRequest(req);
                        setReviewNote('');
                      }}
                      className="w-full px-5 py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <KeyRound className="w-4 h-4 text-[#c9a84c]" />
                      <span>Evaluate Access</span>
                    </button>
                  ) : (
                    <div className="text-right space-y-1">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase inline-block ${
                          req.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {req.status === 'approved' ? 'Access Granted' : 'Access Denied'}
                      </span>
                      {req.dateReviewed && (
                        <p className="text-[10px] text-slate-400">Reviewed {req.dateReviewed}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* SECTION 2: SUBMISSIONS QUEUE */}
      {mainSection === 'submissions' && (
        filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
            No research submissions found in the {activeTab} queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSubmissions.map((sub) => {
              const collegeInfo = UDM_COLLEGES.find(c => c.id === sub.department);

              return (
                <div
                  key={sub.submissionID}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex items-center space-x-2 text-xs">
                      <span className="px-2 py-0.5 rounded font-bold bg-[#1a4731] text-white uppercase">
                        {sub.department}
                      </span>
                      <span className="text-slate-600 font-medium">
                        {collegeInfo?.name} • {sub.course}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#1a4731] font-bold">Submitted: {sub.dateSubmitted}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {sub.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {sub.abstract}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#1a4731]" />
                        <span>Submitter: <strong>{sub.submitterName}</strong> ({sub.submitterEmail})</span>
                      </span>
                      <span>Authors: {sub.authors.join(', ')}</span>
                    </div>

                    {sub.reviewNote && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-[#1a4731] shrink-0 mt-0.5" />
                        <div>
                          <strong>Review Note:</strong> {sub.reviewNote}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Action triggers */}
                  <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                    {sub.status === 'pending' ? (
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setReviewNote('');
                        }}
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-1.5"
                      >
                        <CheckSquare className="w-4 h-4 text-[#c9a84c]" />
                        <span>Evaluate Paper</span>
                      </button>
                    ) : (
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase ${
                          sub.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sub.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Access Request Review Dialog Modal */}
      {selectedAccessRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1a4731] flex items-center space-x-2">
              <KeyRound className="w-5 h-5 text-[#1a4731]" />
              <span>Evaluate Full Access Request: {selectedAccessRequest.requestID}</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>Requester: {selectedAccessRequest.userName}</span>
                <span className="text-[#1a4731]">{selectedAccessRequest.college || 'UDM'}</span>
              </div>
              <p className="text-slate-600">Email: {selectedAccessRequest.userEmail} ({selectedAccessRequest.userRoleOrType || 'Student'})</p>
              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-700 block mb-0.5">Target Research Paper:</span>
                <p className="font-bold text-slate-900">{selectedAccessRequest.researchTitle}</p>
                <p className="text-[11px] text-slate-500 font-mono">Paper ID: {selectedAccessRequest.researchID}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Review Notes / Instructions for Requester (Optional)
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Enter feedback or access conditions for the user..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#1a4731]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setSelectedAccessRequest(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleAccessRequestAction('rejected')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Access</span>
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleAccessRequestAction('approved')}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                <span>Approve Access</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Submission Review Dialog Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#1a4731] flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-[#1a4731]" />
              <span>Evaluate Submission: {selectedSubmission.submissionID}</span>
            </h3>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-900 text-sm">{selectedSubmission.title}</p>
              <p className="text-slate-500">College: {selectedSubmission.department} • Course: {selectedSubmission.course}</p>
              <p className="text-slate-600 line-clamp-3 bg-white p-2.5 rounded-lg border border-slate-200">{selectedSubmission.abstract}</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Review Notes / Rejection Reasons (Optional for Approval)
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Enter feedback or review notes for the submitter..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#1a4731]"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleSubmissionAction('rejected')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center space-x-1"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Paper</span>
              </button>

              <button
                disabled={isProcessing}
                onClick={() => handleSubmissionAction('approved')}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center space-x-1"
              >
                <CheckCircle2 className="w-4 h-4 text-[#c9a84c]" />
                <span>Approve & Archive</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
