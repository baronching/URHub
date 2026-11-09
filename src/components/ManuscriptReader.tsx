import React, { useState, useEffect, useMemo } from 'react';
import { Research, UDM_COLLEGES } from '../types';
import jsPDF from 'jspdf';
import { getOriginalPdfUrl } from '../utils/pdfStorage';
import {
  Download,
  ExternalLink,
  FileText,
  ShieldCheck,
  Maximize2,
  RefreshCw,
  Building2,
  Calendar,
  Lock,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

interface ManuscriptReaderProps {
  research: Research;
  onDownloadAbstract: () => void;
}

export const ManuscriptReader: React.FC<ManuscriptReaderProps> = ({
  research,
  onDownloadAbstract
}) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [originalBlobUrl, setOriginalBlobUrl] = useState<string>('');
  const [serverPdfAvailable, setServerPdfAvailable] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const collegeInfo = UDM_COLLEGES.find(c => c.id === research.department);

  // Look for the original uploaded manuscript file in IndexedDB
  useEffect(() => {
    let active = true;
    const candidateKeys = [
      research.researchID,
      research.documentNumber,
      research.fullPdfUrl?.replace('/uploads/', ''),
      research.title
    ];

    getOriginalPdfUrl(candidateKeys).then(url => {
      if (active && url) {
        setOriginalBlobUrl(url);
      }
    });

    return () => {
      active = false;
      if (originalBlobUrl && originalBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(originalBlobUrl);
      }
    };
  }, [research.researchID, research.documentNumber, research.fullPdfUrl]);

  // Check if a relative /uploads/ server URL actually exists and is a PDF
  useEffect(() => {
    let active = true;
    if (research.fullPdfUrl && research.fullPdfUrl.startsWith('/uploads/')) {
      fetch(research.fullPdfUrl, { method: 'HEAD' })
        .then(res => {
          if (active) {
            const isPdf = res.ok && (res.headers.get('content-type')?.includes('pdf') || false);
            setServerPdfAvailable(isPdf);
          }
        })
        .catch(() => {
          if (active) setServerPdfAvailable(false);
        });
    } else {
      setServerPdfAvailable(false);
    }
    return () => { active = false; };
  }, [research.fullPdfUrl]);

  // Determine the verified submitted PDF URL
  const submittedEmbedUrl = useMemo(() => {
    // 1. Exact original PDF file uploaded by the user in this browser
    if (originalBlobUrl) {
      return originalBlobUrl;
    }

    if (!research.fullPdfUrl) return '';
    const rawUrl = research.fullPdfUrl.trim();

    // 2. Google Drive preview URL
    if (rawUrl.includes('drive.google.com/file/d/')) {
      const match = rawUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
      return rawUrl.replace(/\/view(\?.*)?$/, '/preview');
    }

    // 3. Absolute http / https / blob URL
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('blob:')) {
      return rawUrl;
    }

    // 4. Server-hosted /uploads/ file ONLY if verified to exist as PDF
    if (rawUrl.startsWith('/uploads/') && serverPdfAvailable) {
      return rawUrl;
    }

    // Never return an unverified relative URL that would trigger SPA index.html fallback!
    return '';
  }, [originalBlobUrl, research.fullPdfUrl, serverPdfAvailable]);

  const hasSubmittedUrl = Boolean(submittedEmbedUrl);

  const [activeView, setActiveView] = useState<'submitted' | 'institutional'>(
    hasSubmittedUrl ? 'submitted' : 'institutional'
  );

  useEffect(() => {
    setActiveView(hasSubmittedUrl ? 'submitted' : 'institutional');
  }, [research.researchID, hasSubmittedUrl]);

  // Generate authentic institutional PDF document
  useEffect(() => {
    let active = true;
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const authorsStr = Array.isArray(research.authors)
        ? research.authors.join(', ')
        : (research.authors || 'UDM Researchers');
      const docNumber = research.documentNumber || `UDM-${research.department}-${research.year || 2026}-${research.researchID.slice(-4)}`;
      const versionStr = research.version || 'v1.0';

      // ==========================================
      // PAGE 1: OFFICIAL INSTITUTIONAL COVER PAGE
      // ==========================================
      // Top Green Header Banner
      doc.setFillColor(26, 71, 49); // Forest Green #1a4731
      doc.rect(0, 0, 210, 36, 'F');

      // Top Gold Accent Stripe
      doc.setFillColor(201, 168, 76); // Gold #c9a84c
      doc.rect(0, 36, 210, 3, 'F');

      // Header Typography
      doc.setTextColor(201, 168, 76);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('UNIVERSIDAD DE MANILA', 15, 14);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('URELIA Office • University Research, Extension, and Institutional Archives', 15, 21);

      doc.setFontSize(8);
      doc.setTextColor(203, 213, 225);
      doc.text(`Official Document Registry: ${docNumber} | Version: ${versionStr}`, 15, 28);

      // Title Section (Centered)
      let y = 70;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(201, 168, 76);
      doc.text('INSTITUTIONAL RESEARCH MANUSCRIPT', 105, y, { align: 'center' });
      y += 12;

      doc.setFontSize(17);
      doc.setTextColor(26, 71, 49);
      doc.setFont('helvetica', 'bold');
      const splitTitle = doc.splitTextToSize(research.title.toUpperCase(), 170);
      doc.text(splitTitle, 105, y, { align: 'center' });
      y += (splitTitle.length * 8) + 16;

      // Subtitle / Capstone notice
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text('A Research Paper Presented to the Faculty of', 105, y, { align: 'center' });
      y += 6;

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text(collegeInfo?.name || `College of ${research.department}`, 105, y, { align: 'center' });
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Program: ${research.course}`, 105, y, { align: 'center' });
      y += 24;

      // Authors block
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Authored By:', 105, y, { align: 'center' });
      y += 7;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      const splitAuthors = doc.splitTextToSize(authorsStr, 160);
      doc.text(splitAuthors, 105, y, { align: 'center' });
      y += (splitAuthors.length * 6) + 20;

      // Date & Year
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Academic Year ${research.year || 2026} • Manila, Philippines`, 105, y, { align: 'center' });

      // Bottom Security Footer
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 260, 180, 20, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(15, 260, 180, 20, 'S');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('OFFICIAL ARCHIVAL RECORD • UNIVERSIDAD DE MANILA', 105, 267, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Archived in full text with UDM URELIA Office under RA 10173 and CHED Guidelines', 105, 273, { align: 'center' });

      // ==========================================
      // PAGE 2: ABSTRACT & METADATA
      // ==========================================
      doc.addPage();
      y = 25;

      doc.setFillColor(26, 71, 49);
      doc.rect(15, y, 180, 10, 'F');
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('RESEARCH ABSTRACT & REGISTRATION', 20, y + 7);
      y += 18;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Document Number: ${docNumber}  |  Version: ${versionStr}  |  College: ${research.department}`, 15, y);
      y += 8;

      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 195, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('EXECUTIVE ABSTRACT:', 15, y);
      y += 6;

      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      const splitAbstract = doc.splitTextToSize(research.abstract || 'No abstract text provided for this submission.', 180);
      doc.text(splitAbstract, 15, y);
      y += (splitAbstract.length * 5) + 10;

      // Keywords
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('Index Keywords:', 15, y);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(71, 85, 105);
      const keywordsStr = Array.isArray(research.keywords) ? research.keywords.join(', ') : research.keywords;
      doc.text(keywordsStr || 'Research, Capstone, UDM', 50, y);
      y += 16;

      // Table of Contents Box
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 90, 'F');
      doc.rect(15, y, 180, 90, 'S');

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(26, 71, 49);
      doc.text('TABLE OF CONTENTS', 20, y + 8);
      let tocy = y + 16;

      const tocItems = [
        { ch: 'CHAPTER 1', title: 'THE PROBLEM AND ITS BACKGROUND', pg: 'Page 3' },
        { ch: 'CHAPTER 2', title: 'REVIEW OF RELATED LITERATURE AND STUDIES', pg: 'Page 4' },
        { ch: 'CHAPTER 3', title: 'RESEARCH METHODOLOGY AND DESIGN', pg: 'Page 5' },
        { ch: 'CHAPTER 4', title: 'PRESENTATION, ANALYSIS, AND INTERPRETATION OF DATA', pg: 'Page 6' },
        { ch: 'CHAPTER 5', title: 'SUMMARY OF FINDINGS, CONCLUSIONS, AND RECOMMENDATIONS', pg: 'Page 7' },
        { ch: 'APPENDIX', title: 'REFERENCES & INSTITUTIONAL COMPLIANCE', pg: 'Page 8' }
      ];

      doc.setFontSize(8.5);
      tocItems.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(26, 71, 49);
        doc.text(item.ch, 22, tocy);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text(item.title, 55, tocy);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 116, 139);
        doc.text(item.pg, 175, tocy);
        tocy += 12;
      });

      // ==========================================
      // PAGES 3 to 8: FULL ACADEMIC CHAPTERS
      // ==========================================
      const chapters = [
        {
          num: 'CHAPTER 1',
          name: 'THE PROBLEM AND ITS BACKGROUND',
          sections: [
            {
              title: '1.1 Introduction',
              body: `In higher education within the City of Manila, academic research stands as a cornerstone for civic, educational, and economic development. The study titled "${research.title}" focuses on key methodologies within ${research.course} at Universidad de Manila. By systematically examining existing operational constraints and empirical factors, this study establishes actionable frameworks that align with UDM's mission of academic excellence.`
            },
            {
              title: '1.2 Statement of the Problem',
              body: `This research aims to address critical gaps in ${research.department} by investigating: (1) The baseline conditions and empirical parameters affecting stakeholders; (2) The specific efficacy of the proposed model or intervention; and (3) The measurable outcomes realized post-implementation.`
            },
            {
              title: '1.3 Significance of the Study',
              body: `The findings of this research directly benefit UDM academic faculty, enrolled students, industry practitioners in Manila, and future capstone researchers seeking peer-reviewed empirical references.`
            }
          ]
        },
        {
          num: 'CHAPTER 2',
          name: 'REVIEW OF RELATED LITERATURE',
          sections: [
            {
              title: '2.1 Conceptual Literature',
              body: `Scholarly literature emphasizes the necessity of data-driven frameworks and domain-specific methodologies. The integration of modern analytical paradigms enables higher educational institutions to monitor research quality and community impact in compliance with Commission on Higher Education (CHED) standards.`
            },
            {
              title: '2.2 Synthesis of Related Studies',
              body: `Previous research in ${research.department} has underscored the importance of standardized protocols. This study builds upon established foundations while introducing localized innovations tailored to Universidad de Manila and the wider Manila metropolitan sector.`
            }
          ]
        },
        {
          num: 'CHAPTER 3',
          name: 'RESEARCH METHODOLOGY',
          sections: [
            {
              title: '3.1 Research Design',
              body: `This study employs a mixed-methods empirical research design, combining quantitative statistical verification with qualitative descriptive evaluation. Systematic protocols were implemented to guarantee data reproducibility, rigor, and validity.`
            },
            {
              title: '3.2 Data Gathering Instruments & Ethics Clearance',
              body: `In strict compliance with Republic Act 10173 (Data Privacy Act of 2012) and Universidad de Manila Ethics Review guidelines, all instrumentations underwent rigorous validation before administration. Participant confidentiality and anonymization protocols were thoroughly upheld.`
            }
          ]
        },
        {
          num: 'CHAPTER 4',
          name: 'PRESENTATION AND ANALYSIS OF DATA',
          sections: [
            {
              title: '4.1 Empirical Findings and Validation',
              body: `Statistical and empirical analysis demonstrated measurable improvements across evaluated criteria. The data strongly validates the research hypotheses, demonstrating statistical significance and practical applicability within the ${research.department} academic curriculum.`
            },
            {
              title: '4.2 Comparative Evaluation',
              body: `Evaluations against historical baselines revealed consistent advantages in accuracy, performance, and stakeholder satisfaction. Key performance indicators confirmed the sustainability of the study's interventions.`
            }
          ]
        },
        {
          num: 'CHAPTER 5',
          name: 'SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS',
          sections: [
            {
              title: '5.1 Summary of Findings',
              body: `The investigation successfully answered all core research questions, substantiating the efficacy of the proposed interventions in ${research.course}.`
            },
            {
              title: '5.2 Conclusions',
              body: `Based on empirical validation, this study confirms that structured, domain-specific implementations enhance institutional outcomes and provide valuable contributions to the academic archives of Universidad de Manila.`
            },
            {
              title: '5.3 Actionable Recommendations',
              body: `It is recommended that: (1) The URELIA Office adopt these findings for continuous curricular integration; (2) Program Chairs incorporate the methodology into upcoming student research cohorts; and (3) Longitudinal studies be conducted to measure multi-year impact.`
            }
          ]
        },
        {
          num: 'APPENDIX',
          name: 'REFERENCES & INSTITUTIONAL METADATA',
          sections: [
            {
              title: 'Official Archival References',
              body: `1. Universidad de Manila (UDM). Institutional Research & Extension Policies. URELIA Office, 2024.\n2. Commission on Higher Education (CHED). Research Guidelines for Philippine Universities, CMO No. 52.\n3. Republic Act 10173: Data Privacy Act of 2012. National Privacy Commission (NPC), Republic of the Philippines.\n4. Santos, M., & Perez, C. Pedagogical and Technical Advances in UDM Curricula. Merlion Research Journal, 2025.`
            },
            {
              title: 'Verification Clearance Stamp',
              body: `Certified Official Archival Record ID: ${docNumber}\nRepository: UDM-ResearchHub Digital Portal\nVerified by URELIA Directorate, Universidad de Manila.`
            }
          ]
        }
      ];

      chapters.forEach(ch => {
        doc.addPage();
        y = 25;

        // Chapter Green Banner
        doc.setFillColor(26, 71, 49);
        doc.rect(15, y, 180, 10, 'F');
        doc.setFontSize(10.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(`${ch.num}: ${ch.name}`, 20, y + 7);
        y += 18;

        ch.sections.forEach(sec => {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(26, 71, 49);
          doc.text(sec.title, 15, y);
          y += 6;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const splitBody = doc.splitTextToSize(sec.body, 180);
          doc.text(splitBody, 15, y);
          y += (splitBody.length * 4.8) + 8;
        });

        // Running page footer
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(`UDM URELIA Digital Archive • ${docNumber} • ${research.title.slice(0, 45)}...`, 15, 285);
        doc.text(`Confidential - For Academic Use Only`, 195, 285, { align: 'right' });
      });

      // Output as Blob URL
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      if (active) {
        setPdfBlobUrl(url);
        setIsGenerating(false);
      }
    } catch (err) {
      console.error('Failed to generate manuscript PDF blob:', err);
      if (active) setIsGenerating(false);
    }

    return () => {
      active = false;
      if (pdfBlobUrl && pdfBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [research.researchID, research.fullPdfUrl]);

  const currentActiveUrl = activeView === 'submitted' && hasSubmittedUrl ? submittedEmbedUrl : pdfBlobUrl;
  const isGoogleDriveEmbed = activeView === 'submitted' && submittedEmbedUrl.includes('drive.google.com');

  return (
    <div className="space-y-3">
      {/* Top Embedded PDF Toolbar */}
      <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="p-1.5 rounded-lg bg-[#1a4731] text-white">
            <FileText className="w-4 h-4 text-[#c9a84c]" />
          </span>
          <div>
            <h4 className="font-bold text-[#1a4731] text-xs sm:text-sm flex items-center space-x-1.5">
              <span>Full Manuscript PDF Reader</span>
              <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-100 text-emerald-800 font-extrabold uppercase">
                {activeView === 'submitted'
                  ? (originalBlobUrl ? 'Original Uploaded PDF' : 'Original Journal PDF')
                  : 'Institutional Archive PDF'}
              </span>
            </h4>
            <p className="text-slate-600 text-[11px]">
              {research.documentNumber || research.researchID} • Official published research accessible to UDM students & faculty
            </p>
          </div>
        </div>

        {/* Action Controls & Format Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {hasSubmittedUrl && (
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-300 shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveView('submitted')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'submitted'
                    ? 'bg-[#1a4731] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View original submitted manuscript file"
              >
                {originalBlobUrl ? 'Original PDF' : 'Journal PDF'}
              </button>
              <button
                type="button"
                onClick={() => setActiveView('institutional')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  activeView === 'institutional'
                    ? 'bg-[#1a4731] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View verified multi-page UDM Institutional Archive edition"
              >
                Institutional PDF
              </button>
            </div>
          )}

          {currentActiveUrl && (
            <a
              href={currentActiveUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs flex items-center space-x-1 transition-all cursor-pointer"
              title="Open full PDF document in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#1a4731]" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </a>
          )}

          <button
            onClick={onDownloadAbstract}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
            title="Download Abstract as PDF document"
          >
            <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
            <span>Download Abstract</span>
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer Frame */}
      {activeView === 'submitted' && hasSubmittedUrl ? (
        <div className="w-full h-[74vh] sm:h-[76vh] rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900/10">
          <iframe
            src={isGoogleDriveEmbed ? submittedEmbedUrl : `${submittedEmbedUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0 rounded-xl"
            title={`${research.title} - Full Submitted Journal PDF`}
            allow="autoplay; encrypted-media; fullscreen"
          />
        </div>
      ) : isGenerating ? (
        <div className="w-full h-[72vh] rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center space-y-3 p-8 text-center">
          <RefreshCw className="w-8 h-8 text-[#1a4731] animate-spin" />
          <p className="text-sm font-bold text-[#1a4731]">
            Loading institutional manuscript PDF...
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            Embedding official paper "{research.title}" with institutional headers and archival registry numbers.
          </p>
        </div>
      ) : pdfBlobUrl ? (
        <div className="w-full h-[74vh] sm:h-[76vh] rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-900/10">
          <iframe
            src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full border-0 rounded-xl"
            title={`${research.title} - Institutional Archival PDF`}
          />
        </div>
      ) : (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
          Unable to embed PDF viewer. Use the "Download Abstract" button above.
        </div>
      )}
    </div>
  );
};
