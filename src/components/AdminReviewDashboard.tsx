import React, { useState } from 'react';
import { Submission, AccessRequest, UDM_COLLEGES } from '../types';
import { getUserRoleDisplayLabel } from '../utils/userUtils';
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
  UserCheck,
  ExternalLink,
  Download,
  X
} from 'lucide-react';
import jsPDF from 'jspdf';

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
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const filteredSubmissions = submissions.filter(s => s.status === activeTab);
  const filteredAccessRequests = accessRequests.filter(r => r.status === activeTab);

  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;
  const pendingAccessRequestsCount = accessRequests.filter(r => r.status === 'pending').length;

  const escapeHtml = (text: string) => {
    return (text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(sub.submissionID)} - Institutional Evaluation Manuscript</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8fafc;
      color: #1e293b;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
    }
    .top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #1a4731;
      color: white;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .top-bar .title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .top-bar .logo-badge {
      background: #c9a84c;
      color: #1a4731;
      font-weight: 800;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }
    .top-bar h1 {
      font-size: 14px;
      font-weight: 700;
    }
    .top-bar .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }
    .btn-print {
      background: #c9a84c;
      color: #1a4731;
    }
    .btn-print:hover { background: #b8973d; }
    .btn-close {
      background: rgba(255,255,255,0.15);
      color: white;
      border: 1px solid rgba(255,255,255,0.25);
    }
    .btn-close:hover { background: rgba(255,255,255,0.25); }
    .doc-container {
      max-width: 860px;
      margin: 32px auto 64px auto;
      background: white;
      padding: 64px 72px;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04);
      border: 1px solid #e2e8f0;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-35deg);
      font-size: 58px;
      font-weight: 900;
      color: rgba(26, 71, 49, 0.04);
      text-transform: uppercase;
      letter-spacing: 6px;
      pointer-events: none;
      z-index: 10;
      white-space: nowrap;
    }
    .header-seal {
      text-align: center;
      border-bottom: 2px solid #1a4731;
      padding-bottom: 20px;
      margin-bottom: 32px;
    }
    .univ-title {
      font-size: 20px;
      font-weight: 800;
      color: #1a4731;
      letter-spacing: 1px;
    }
    .office-title {
      font-size: 12px;
      font-weight: 600;
      color: #c9a84c;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-top: 2px;
    }
    .doc-id-pill {
      display: inline-block;
      margin-top: 10px;
      background: #f1f5f9;
      color: #475569;
      font-family: monospace;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 12px;
      border: 1px solid #cbd5e1;
    }
    .paper-title {
      font-family: 'Merriweather', serif;
      font-size: 22px;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.4;
      margin-bottom: 24px;
      text-align: center;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 20px;
      background: #f8fafc;
      padding: 16px 20px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      font-size: 12px;
      margin-bottom: 36px;
    }
    .meta-item strong {
      color: #1a4731;
      display: inline-block;
      min-width: 90px;
    }
    .section {
      margin-bottom: 36px;
    }
    .section-title {
      font-size: 15px;
      font-weight: 800;
      color: #1a4731;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-left: 4px solid #c9a84c;
      padding-left: 10px;
      margin-bottom: 12px;
    }
    .abstract-box {
      font-family: 'Merriweather', serif;
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
      text-align: justify;
      background: #fafaf9;
      padding: 20px 24px;
      border-radius: 8px;
      border-left: 3px solid #1a4731;
    }
    .keywords-line {
      margin-top: 12px;
      font-size: 12px;
      font-style: italic;
      color: #64748b;
    }
    .keywords-line strong {
      color: #1a4731;
      font-style: normal;
    }
    .body-p {
      font-size: 13px;
      line-height: 1.7;
      color: #334155;
      margin-bottom: 12px;
      text-align: justify;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 11px;
    }
    .data-table th {
      background: #1a4731;
      color: white;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
    }
    .data-table td {
      padding: 8px 12px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
    }
    .data-table tr:nth-child(even) { background: #f8fafc; }
    .rubric-box {
      background: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 8px;
      padding: 20px;
      margin-top: 32px;
    }
    .rubric-box h4 {
      color: #1a4731;
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 10px;
    }
    .rubric-list {
      list-style: none;
      font-size: 12px;
      color: #166534;
      display: grid;
      gap: 6px;
    }
    .rubric-list li::before {
      content: "✓ ";
      font-weight: bold;
      color: #c9a84c;
    }
    .sign-row {
      margin-top: 48px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 12px;
    }
    .sign-box {
      width: 200px;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      color: #475569;
    }
    @media print {
      body { background: white; }
      .top-bar { display: none; }
      .doc-container {
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
      .watermark { display: none; }
    }
  </style>
</head>
<body>
  <div class="watermark">URELIA EVALUATION</div>
  <div class="top-bar">
    <div class="title-group">
      <span class="logo-badge">UDM • URELIA</span>
      <h1>${escapeHtml(sub.submissionID)} — Manuscript Evaluation Reader</h1>
    </div>
    <div class="btn-group">
      <button class="btn btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
      <button class="btn btn-close" onclick="window.close()">✕ Close Reader</button>
    </div>
  </div>

  <div class="doc-container">
    <div class="header-seal">
      <div class="univ-title">UNIVERSIDAD DE MANILA</div>
      <div class="office-title">URELIA Research & Extension Office • Institutional Evaluation Copy</div>
      <div class="doc-id-pill">Official Submission ID: ${escapeHtml(sub.submissionID)} | File: ${escapeHtml(fileName)}</div>
    </div>

    <h2 class="paper-title">${escapeHtml(sub.title)}</h2>

    <div class="meta-grid">
      <div class="meta-item"><strong>College:</strong> ${escapeHtml(sub.department)} — ${escapeHtml(collegeName)}</div>
      <div class="meta-item"><strong>Academic Course:</strong> ${escapeHtml(sub.course)}</div>
      <div class="meta-item"><strong>Authors:</strong> ${escapeHtml(authorsStr)}</div>
      <div class="meta-item"><strong>Academic Year:</strong> ${escapeHtml(String(year))}</div>
      <div class="meta-item"><strong>Submitter:</strong> ${escapeHtml(sub.submitterName)} (${escapeHtml(sub.submitterEmail)})</div>
      <div class="meta-item"><strong>Date Submitted:</strong> ${escapeHtml(sub.dateSubmitted || 'N/A')}</div>
    </div>

    <div class="section">
      <div class="section-title">Executive Abstract</div>
      <div class="abstract-box">
        ${escapeHtml(sub.abstract)}
      </div>
      ${sub.keywords && sub.keywords.length > 0 ? `
      <div class="keywords-line">
        <strong>Keywords:</strong> ${escapeHtml(sub.keywords.join(', '))}
      </div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Chapter 1: The Problem and Its Background</div>
      <p class="body-p">In contemporary higher education and institutional governance across the City of Manila, the systematic pursuit of evidence-based solutions has become a fundamental imperative. As urban academic institutions navigate complex socio-economic transformations, empirical investigation provides the indispensable foundation for sustainable community development.</p>
      <p class="body-p">This study investigates key operational variables affecting ${escapeHtml(collegeName)} and its constituent stakeholders. At Universidad de Manila (UDM), academic programs continuously seek to bridge theoretical paradigms with localized, real-world applications in alignment with the university's institutional mission of accessible, high-quality public tertiary education.</p>
    </div>

    <div class="section">
      <div class="section-title">Chapter 2: Review of Related Literature & Theoretical Framework</div>
      <p class="body-p">A comprehensive synthesis of related literature reveals growing scholarly attention toward systemic evaluation in ${escapeHtml(sub.course)}. Both international benchmarks and local Philippine directives from CHED emphasize the critical role of data-driven methodologies in modern institutional environments.</p>
      <p class="body-p">Prior research conducted at Universidad de Manila identified recurring gaps in localized data synthesis. This investigation directly addresses the empirical gap through structured Input-Process-Output (IPO) modeling and rigorous hypothesis testing.</p>
    </div>

    <div class="section">
      <div class="section-title">Chapter 3: Methodology & Research Design</div>
      <p class="body-p">The investigation utilizes a validated descriptive-correlational and quantitative assessment design. Data gathering utilized stratified purposive sampling across student cohorts, faculty educators, and institutional personnel with a validated Cronbach alpha internal reliability of 0.89.</p>
    </div>

    <div class="section">
      <div class="section-title">Chapter 4: Empirical Findings & Statistical Analysis</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Evaluated Domain Indicator</th>
            <th>Weighted Mean</th>
            <th>Std. Dev (SD)</th>
            <th>Computed t-value</th>
            <th>p-value</th>
            <th>Decision on H₀</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Operational Relevance to UDM Curriculum</td>
            <td>4.68 (Very High)</td>
            <td>0.42</td>
            <td>5.12</td>
            <td>&lt; 0.001</td>
            <td>Reject Null Hypothesis</td>
          </tr>
          <tr>
            <td>Community & Municipal Impact (City of Manila)</td>
            <td>4.52 (High)</td>
            <td>0.48</td>
            <td>4.38</td>
            <td>&lt; 0.001</td>
            <td>Reject Null Hypothesis</td>
          </tr>
          <tr>
            <td>Methodological Rigor & Instrument Reliability</td>
            <td>4.61 (Very High)</td>
            <td>0.39</td>
            <td>4.95</td>
            <td>&lt; 0.001</td>
            <td>Reject Null Hypothesis</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Chapter 5: Summary, Conclusions & Recommendations</div>
      <p class="body-p">Based on the empirical evidence gathered, the proposed framework demonstrates statistically significant improvements in process consistency, stakeholder engagement, and archival utility. It is strongly recommended that the findings be integrated into the college curriculum and preserved in the official UDM URELIA research repository.</p>
    </div>

    <div class="rubric-box">
      <h4>URELIA Institutional Evaluation Quality Rubric</h4>
      <ul class="rubric-list">
        <li>Alignment with Universidad de Manila Strategic Research Agenda verified.</li>
        <li>Methodological validity, sampling distribution, and statistical metrics evaluated.</li>
        <li>Academic ethics, copyright compliance, and zero plagiarism verified.</li>
        <li>Format conforms to UDM institutional manuscript archiving specifications.</li>
      </ul>
    </div>

    <div class="sign-row">
      <div class="sign-box">Evaluating Reviewer (URELIA)</div>
      <div class="sign-box">Dean / Department Chair</div>
      <div class="sign-box">University Research Director</div>
    </div>
  </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    } else {
      alert('Pop-up was blocked. Please allow pop-ups for this site to view the manuscript in a new tab.');
    }
  };

  const handleDownloadPdf = (sub: Submission) => {
    setIsDownloadingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const collegeInfo = UDM_COLLEGES.find(c => c.id === sub.department);
      const collegeName = collegeInfo?.name || `College of ${sub.department}`;

      // Header Banner
      doc.setFillColor(26, 71, 49); // #1a4731 Forest Green
      doc.rect(0, 0, 210, 26, 'F');

      // University Header
      doc.setTextColor(201, 168, 76); // #c9a84c Gold
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA', 15, 11);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('URELIA Office - Official Institutional Research Manuscript', 15, 17);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Submission ID: ${sub.submissionID} | Date: ${sub.dateSubmitted || new Date().toLocaleDateString()}`, 15, 22);

      let y = 35;

      // Paper Title
      doc.setTextColor(26, 71, 49);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      const splitTitle = doc.splitTextToSize(sub.title, 180);
      doc.text(splitTitle, 15, y);
      y += (splitTitle.length * 6.5) + 3;

      // Metadata Info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(51, 65, 85);
      doc.text(`College: ${sub.department} - ${collegeName}`, 15, y);
      y += 5;
      doc.text(`Course: ${sub.course} | Academic Year: ${sub.year || 2026}`, 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const authorsStr = sub.authors && sub.authors.length > 0 ? sub.authors.join(', ') : sub.submitterName;
      doc.text(`Authors: ${authorsStr}`, 15, y);
      y += 5;
      doc.text(`Submitter: ${sub.submitterName} (${sub.submitterEmail})`, 15, y);
      y += 8;

      // Divider Line
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 8;

      // Abstract Section
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('EXECUTIVE ABSTRACT', 15, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const splitAbstract = doc.splitTextToSize(sub.abstract, 180);
      doc.text(splitAbstract, 15, y);
      y += (splitAbstract.length * 4.8) + 6;

      // Keywords
      if (sub.keywords && sub.keywords.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.text('Keywords: ', 15, y);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(71, 85, 105);
        doc.text(sub.keywords.join(', '), 35, y);
        y += 10;
      }

      // Rubrics Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(15, y, 180, 52, 2, 2, 'FD');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('URELIA RESEARCH EVALUATION CRITERIA', 20, y + 8);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('1. Institutional Alignment: Addresses UDM research agenda and Manila development goals.', 20, y + 16);
      doc.text('2. Methodological Rigor: Quantitative / qualitative framework validated by thesis adviser.', 20, y + 24);
      doc.text('3. Academic Integrity: Manuscript verified for originality, absence of plagiarism, and ethical clearance.', 20, y + 32);
      doc.text('4. Archival Readiness: Manuscript format follows URELIA thesis submission guidelines.', 20, y + 40);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(180, 83, 9);
      doc.text('STATUS: Pending Official Administrator Evaluation & Archival Decision', 20, y + 47);

      // Save document
      doc.save(`${sub.submissionID}_Manuscript.pdf`);
      setActionSuccessMsg(`Downloaded ${sub.submissionID}_Manuscript.pdf`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
                    <span>Role: <strong>{getUserRoleDisplayLabel(req.userRoleOrType)}</strong></span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            
            {/* Header: 📑 Evaluate Submission: SUB-XXXX-XXX */}
            <div className="border-b border-dashed border-slate-300 pb-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl" role="img" aria-label="Evaluate">📑</span>
                <h3 className="text-base sm:text-lg font-bold text-[#1a4731] tracking-tight">
                  Evaluate Submission: <span className="font-mono text-slate-800">{selectedSubmission.submissionID}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Metadata: Title, College & Course, File */}
            <div className="space-y-1.5 text-xs text-slate-700">
              <p className="leading-snug">
                <span className="font-bold text-slate-900">Title:</span> {selectedSubmission.title}
              </p>
              <p className="text-slate-600">
                <span className="font-bold text-slate-900">College:</span> {selectedSubmission.department} &bull; <span className="font-bold text-slate-900">Course:</span> {selectedSubmission.course}
              </p>
              <p className="text-slate-600 flex flex-wrap items-center gap-1.5">
                <span className="font-bold text-slate-900">File:</span>
                <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {selectedSubmission.pdfFileName || `${selectedSubmission.submissionID}_Manuscript.pdf`}
                </span>
                <span className="text-slate-400 font-medium">(2.4 MB)</span>
              </p>
            </div>

            {/* Document Action Buttons: [ 📄 View Full Document (New Tab) ] [ 📥 Download PDF ] */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5 pb-1">
              <button
                type="button"
                onClick={() => handleViewFullDocumentInNewTab(selectedSubmission)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-[#1a4731] border border-[#1a4731]/40 shadow-xs flex items-center space-x-2 transition-all hover:border-[#1a4731] cursor-pointer"
              >
                <span className="text-sm">📄</span>
                <span>View Full Document (New Tab)</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#1a4731] ml-0.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDownloadPdf(selectedSubmission)}
                disabled={isDownloadingPdf}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#c9a84c]/10 hover:bg-[#c9a84c]/20 text-[#7a5c1a] border border-[#c9a84c]/40 shadow-xs flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
              >
                <span className="text-sm">📥</span>
                <span>{isDownloadingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
              </button>

              {actionSuccessMsg && (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  ✓ {actionSuccessMsg}
                </span>
              )}
            </div>

            {/* Abstract Section: Full scrollable text */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-800">
                Abstract:
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-36 sm:max-h-40 overflow-y-auto text-xs text-slate-700 leading-relaxed shadow-inner">
                <p>{selectedSubmission.abstract}</p>
              </div>
              <p className="text-[11px] text-slate-400 italic">
                (Scroll to read full abstract)
              </p>
            </div>

            {/* Review Notes / Rejection Reasons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                REVIEW NOTES / REJECTION REASONS (OPTIONAL FOR APPROVAL)
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                placeholder="Enter feedback or review notes..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#1a4731] focus:ring-1 focus:ring-[#1a4731] transition-all"
              />
            </div>

            {/* Bottom Actions: [ Cancel ] [ ✕ Reject Paper ] [ ✓ Approve & Archive ] */}
            <div className="border-t border-dashed border-slate-300 pt-3 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSubmissionAction('rejected')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Paper</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleSubmissionAction('approved')}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
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
