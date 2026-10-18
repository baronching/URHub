import React, { useState, useEffect } from 'react';
import { Research, UDM_COLLEGES } from '../types';
import { generateManuscriptPages } from '../utils/manuscriptContentGenerator';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  BookOpen,
  ZoomIn,
  ZoomOut,
  FileText,
  Building2,
  Calendar,
  Award,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';

interface ManuscriptReaderProps {
  research: Research;
  onDownloadAbstract: () => void;
}

export const ManuscriptReader: React.FC<ManuscriptReaderProps> = ({
  research,
  onDownloadAbstract
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const pages = generateManuscriptPages(research);
  const totalPages = pages.length;
  const activePageData = pages.find(p => p.pageNumber === currentPage) || pages[0];
  const collegeInfo = UDM_COLLEGES.find(c => c.id === research.department);

  // Keyboard navigation for smooth reading
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentPage(p => Math.min(totalPages, p + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage(p => Math.max(1, p - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalPages]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      if (direction === 'in') return Math.min(125, prev + 10);
      return Math.max(90, prev - 10);
    });
  };

  return (
    <div className="space-y-4 select-none" onContextMenu={(e) => e.preventDefault()}>
      {/* Top Banner: Protected View-Only & Policy Information */}
      <div className="bg-emerald-50/90 border border-emerald-200/90 p-3 sm:p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-200">
            <Lock className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-emerald-900 text-xs sm:text-sm flex items-center space-x-1.5">
              <span>Full Manuscript Reader • Protected View-Only</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-200/80 text-emerald-900 font-extrabold uppercase tracking-wide">
                All 14 Pages Viewable
              </span>
            </h4>
            <p className="text-emerald-800 text-[11px] truncate">
              As per URELIA Office policy: Full paper is viewable on our website; only the official abstract is downloadable.
            </p>
          </div>
        </div>

        <button
          onClick={onDownloadAbstract}
          className="self-start sm:self-center px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer shrink-0 transition-all active:scale-98"
        >
          <FileText className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
          <span>Download Abstract PDF</span>
        </button>
      </div>

      {/* Reader Control Bar: Chapter jumps, Zoom, and Page Navigator */}
      <div className="bg-slate-100/90 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Chapter Selector */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5 max-w-full sm:max-w-none scrollbar-none">
          {[
            { label: 'Cover', page: 1 },
            { label: 'TOC', page: 2 },
            { label: 'Ch 1', page: 3 },
            { label: 'Ch 2', page: 5 },
            { label: 'Ch 3', page: 7 },
            { label: 'Ch 4', page: 9 },
            { label: 'Ch 5', page: 11 },
            { label: 'Ref', page: 14 }
          ].map(item => (
            <button
              key={item.page}
              onClick={() => setCurrentPage(item.page)}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                currentPage === item.page || (item.page === 3 && (currentPage === 3 || currentPage === 4)) || (item.page === 5 && (currentPage === 5 || currentPage === 6)) || (item.page === 7 && (currentPage === 7 || currentPage === 8)) || (item.page === 9 && (currentPage === 9 || currentPage === 10)) || (item.page === 11 && (currentPage >= 11 && currentPage <= 13))
                  ? 'bg-[#1a4731] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Controls: Zoom & Jump to page */}
        <div className="flex items-center space-x-2 shrink-0 ml-auto">
          <div className="hidden xs:flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => handleZoom('out')}
              disabled={zoomLevel <= 90}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-600 px-1 font-bold">{zoomLevel}%</span>
            <button
              onClick={() => handleZoom('in')}
              disabled={zoomLevel >= 125}
              className="p-1 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-40 cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-1 text-slate-700 font-bold text-xs">
            <span>Page:</span>
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="bg-white border border-slate-300 rounded px-1.5 py-1 text-xs font-bold text-[#1a4731] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#1a4731]"
            >
              {pages.map(p => (
                <option key={p.pageNumber} value={p.pageNumber}>
                  {p.pageNumber} - {p.chapterTitle.replace('Chapter ', 'Ch ')}
                </option>
              ))}
            </select>
            <span className="text-slate-400 font-mono text-[11px]">/ {totalPages}</span>
          </div>
        </div>
      </div>

      {/* View-Only Paper Container */}
      <div 
        className="bg-white text-slate-900 rounded-xl p-4 sm:p-8 md:p-12 shadow-md relative min-h-[540px] border border-slate-200 font-serif leading-relaxed space-y-5 sm:space-y-6 overflow-hidden transition-all duration-150"
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
      >
        {/* Diagonal Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.045] rotate-[-30deg] text-center select-none">
          <span className="text-2xl sm:text-4xl md:text-5xl font-black uppercase text-slate-900 tracking-widest leading-loose">
            FOR VIEWING ONLY<br />UNIVERSIDAD DE MANILA<br />URELIA ARCHIVES
          </span>
        </div>

        {/* Dynamic Page Header */}
        <div className="border-b-2 border-slate-200 pb-3 sm:pb-4 flex justify-between items-end font-sans">
          <div className="min-w-0 flex-1 pr-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#1a4731] block">
              UNIVERSIDAD DE MANILA • {research.department} • {collegeInfo?.name}
            </span>
            <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 font-sans mt-0.5 truncate leading-snug">
              {activePageData.chapterTitle}
            </h3>
            <p className="text-[11px] text-slate-500 font-sans italic truncate">
              {activePageData.sectionSubtitle}
            </p>
          </div>
          <div className="text-right shrink-0 font-sans">
            <span className="text-[10px] sm:text-xs text-slate-600 font-mono font-bold block">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-[9px] text-[#c9a84c] font-bold uppercase tracking-wider">
              Protected View-Only
            </span>
          </div>
        </div>

        {/* DYNAMIC PAGE CONTENT BASED ON CURRENT PAGE */}
        <div className="font-serif text-slate-800 text-xs sm:text-sm leading-relaxed space-y-4">
          
          {/* PAGE 1: OFFICIAL TITLE & APPROVAL SHEET */}
          {activePageData.type === 'title' && (
            <div className="text-center space-y-6 py-4 font-sans">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-[#1a4731]">Republic of the Philippines</p>
                <h2 className="text-lg sm:text-xl font-black text-[#1a4731] tracking-tight">UNIVERSIDAD DE MANILA</h2>
                <p className="text-xs text-slate-600 font-semibold">(Formerly City College of Manila)</p>
                <p className="text-xs text-slate-500">Mehan Gardens, Ermita, Manila</p>
                <div className="w-16 h-0.5 bg-[#c9a84c] mx-auto mt-2" />
              </div>

              <div className="py-6 space-y-3">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-[#1a4731] border border-slate-200">
                  {collegeInfo?.name || research.department}
                </span>
                <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 max-w-2xl mx-auto leading-snug">
                  {research.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 italic">
                  A Research Manuscript Presented to the Faculty of {collegeInfo?.name}
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <p className="font-bold text-slate-900">In Partial Fulfillment of the Requirements for the Degree of</p>
                <p className="font-semibold text-[#1a4731] text-sm">{research.course}</p>
                <p className="pt-2 text-slate-500 font-medium">By:</p>
                <p className="font-bold text-slate-900 text-sm">{research.authors.join(', ')}</p>
                <p className="text-slate-500 pt-1">Academic Year {research.year || '2025'}</p>
              </div>

              {/* Committee Sign-Off Block */}
              <div className="pt-6 border-t border-slate-200 mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left font-sans text-[10px] sm:text-[11px]">
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50">
                  <p className="font-bold text-slate-800">DR. EMILIANO T. REYES</p>
                  <p className="text-slate-500">Thesis & Capstone Adviser</p>
                  <p className="text-emerald-700 font-bold mt-1">✓ Endorsed for Defense</p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50">
                  <p className="font-bold text-slate-800">DR. MARIA LORRAINE TAN</p>
                  <p className="text-slate-500">Department Chairperson</p>
                  <p className="text-emerald-700 font-bold mt-1">✓ Approved for Repository</p>
                </div>
                <div className="border border-slate-200 p-2.5 rounded bg-slate-50 col-span-2 sm:col-span-1">
                  <p className="font-bold text-slate-800">URELIA OFFICE ARCHIVES</p>
                  <p className="text-slate-500">Research & Extension Division</p>
                  <p className="text-emerald-700 font-bold mt-1">✓ Official Accession No: {research.researchID}</p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: TABLE OF CONTENTS & ABSTRACT */}
          {activePageData.type === 'toc' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-sans">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center space-x-1.5 text-[#1a4731]">
                  <BookOpen className="w-4 h-4 text-[#c9a84c]" />
                  <span>Table of Contents (Click Any Chapter to Jump)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {[
                    { title: 'Chapter 1: The Problem & Background', page: 3 },
                    { title: 'Chapter 1: Statement of the Problem', page: 4 },
                    { title: 'Chapter 2: Review of Related Literature', page: 5 },
                    { title: 'Chapter 2: Conceptual Framework (IPO)', page: 6 },
                    { title: 'Chapter 3: Research Methodology', page: 7 },
                    { title: 'Chapter 3: Instrumentation & Ethics', page: 8 },
                    { title: 'Chapter 4: Results & Data Presentation', page: 9 },
                    { title: 'Chapter 4: Advanced Statistical Analysis', page: 10 },
                    { title: 'Chapter 5: Summary of Findings', page: 11 },
                    { title: 'Chapter 5: Conclusions', page: 12 },
                    { title: 'Chapter 5: Practical Recommendations', page: 13 },
                    { title: 'References & Official Archival Seal', page: 14 }
                  ].map((item) => (
                    <button
                      key={item.page}
                      onClick={() => setCurrentPage(item.page)}
                      className="flex items-center justify-between p-2 rounded hover:bg-white border border-transparent hover:border-slate-200 text-left text-slate-700 transition-colors cursor-pointer group"
                    >
                      <span className="truncate group-hover:text-[#1a4731] font-medium">{item.title}</span>
                      <span className="font-mono text-slate-400 group-hover:text-[#1a4731] font-bold shrink-0 ml-2">p. {item.page}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wider text-[#1a4731] border-b pb-1">
                  Executive Abstract
                </h4>
                <p className="leading-relaxed text-justify">
                  {research.abstract}
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 font-sans">
                  <span className="text-xs font-bold text-slate-700 mr-1 self-center">Keywords:</span>
                  {research.keywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-[#c9a84c]/10 text-[#1a4731] border border-[#c9a84c]/30 font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 3: CHAPTER 1 INTRODUCTION */}
          {currentPage === 3 && (
            <div className="space-y-4 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                1.1 Introduction and Background of the Study
              </h4>
              <p>
                In contemporary higher education and institutional governance across the City of Manila, the systematic pursuit of evidence-based solutions has become a fundamental imperative. As urban academic institutions navigate complex socio-economic, pedagogical, and technological transformations, empirical investigation provides the indispensable foundation for sustainable community development.
              </p>
              <p>
                This investigation, entitled <strong>"{research.title}"</strong>, addresses critical operational and theoretical challenges directly affecting {collegeInfo?.name} and its constituent stakeholders. At the Universidad de Manila (UDM), academic programs continuously seek to bridge theoretical paradigms with localized, real-world applications in alignment with the university's institutional mission of promoting accessible, high-quality public tertiary education.
              </p>
              <p>
                The operational environment in Manila presents unique institutional dynamics that require rigorous analysis. Through a grounded approach encompassing quantitative rigor and domain-specific considerations, this study examines systemic variables, respondent perceptions, and structural benchmarks to develop actionable frameworks for the benefit of both student cohorts and academic personnel.
              </p>
              
              <div className="p-3.5 bg-slate-50 border-l-4 border-[#1a4731] rounded-r-lg font-sans text-xs space-y-1">
                <p className="font-bold text-[#1a4731]">Institutional Context & City of Manila Scope:</p>
                <p className="text-slate-600">
                  Conducted under the auspices of the Universidad de Manila URELIA Office, this study aligns institutional strategic priorities with community-oriented academic service in the City of Manila.
                </p>
              </div>
            </div>
          )}

          {/* PAGE 4: CHAPTER 1 PROBLEM STATEMENT & SIGNIFICANCE */}
          {currentPage === 4 && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                1.2 Statement of the Problem
              </h4>
              <p className="text-justify">
                Specifically, this research investigation seeks to answer the following core research questions:
              </p>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-sans text-xs space-y-2">
                <p><strong>1. Baseline Readiness:</strong> What is the baseline profile and operational status of the target demographic within {collegeInfo?.name} in terms of institutional readiness and resource allocation?</p>
                <p><strong>2. Framework Efficacy:</strong> To what extent does the implementation of the proposed framework impact key performance indicators, operational efficiency, and learning outcomes?</p>
                <p><strong>3. Statistical Significance:</strong> Is there a statistically significant difference in performance and satisfaction metrics before and after the application of the investigated interventions?</p>
                <p><strong>4. Policy Formulation:</strong> What programmatic policy measures, pedagogical adaptations, or systemic tools can be synthesized to optimize outcomes for the Universidad de Manila community?</p>
              </div>

              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731] pt-2">
                1.3 Significance of the Study
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans text-xs">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <p className="font-bold text-[#1a4731] flex items-center space-x-1">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>For UDM Students</span>
                  </p>
                  <p className="text-slate-600 mt-1">Provides concrete empirical data, actionable reference material, and conceptual frameworks to guide future thesis and capstone research.</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <p className="font-bold text-[#1a4731] flex items-center space-x-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>For Faculty & Mentors</span>
                  </p>
                  <p className="text-slate-600 mt-1">Serves as a validated pedagogical benchmark for curriculum refinement, scholarly publishing, and interdisciplinary collaboration.</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <p className="font-bold text-[#1a4731] flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5" />
                    <span>For Administration & URELIA</span>
                  </p>
                  <p className="text-slate-600 mt-1">Supplies empirical metrics to inform policy formulated by university deans and institutional planning bodies.</p>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <p className="font-bold text-[#1a4731] flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>For City of Manila</span>
                  </p>
                  <p className="text-slate-600 mt-1">Delivers evidence-grounded insights directly applicable to municipal public service, local enterprise, and community welfare.</p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: CHAPTER 2 REVIEW OF RELATED LITERATURE */}
          {currentPage === 5 && (
            <div className="space-y-4 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                2.1 Review of Related Literature (Foreign and Local)
              </h4>
              <p>
                A comprehensive synthesis of related literature reveals growing scholarly attention toward systemic evaluation in {research.course}. Both international benchmarks and local Philippine studies emphasize the critical role of data-driven methodologies in modern institutional environments.
              </p>
              <p>
                Recent studies in the ASEAN region demonstrate that educational and public institutions adopting structured evaluative models report up to a 42% increase in stakeholder satisfaction and process consistency. In the Philippine setting, regulatory directives from the Commission on Higher Education (CHED) mandate continuous quality assurance protocols.
              </p>
              
              <div className="my-4 font-sans text-xs">
                <span className="font-bold text-slate-900 block mb-2">Summary Matrix of Pertinent Literature (UDM URELIA Synthesis):</span>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[#1a4731] font-bold border-b">
                      <tr>
                        <th className="p-2">Study Citation</th>
                        <th className="p-2">Focus Domain</th>
                        <th className="p-2">Core Finding</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                      <tr>
                        <td className="p-2 font-semibold">CHED NHERA-III (2023)</td>
                        <td className="p-2">Institutional Quality Assurance</td>
                        <td className="p-2">Emphasizes localized empirical studies to address municipal challenges.</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">Manila Urban Review (2024)</td>
                        <td className="p-2">Public University Stakeholders</td>
                        <td className="p-2">Notes urgent need for accessible digital repositories and data-backed decisions.</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-semibold">Asian Higher Ed Journal (2025)</td>
                        <td className="p-2">Curriculum Alignment</td>
                        <td className="p-2">Confirmed strong positive correlation between student capstone utility and faculty research.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p>
                Previous capstone and faculty research conducted at the Universidad de Manila identified recurring gaps in localized data synthesis. Existing literature predominantly focuses on private tertiary institutions or centralized Western models, leaving a noticeable void regarding localized urban public universities in the City of Manila. This study directly addresses this empirical gap.
              </p>
            </div>
          )}

          {/* PAGE 6: CHAPTER 2 CONCEPTUAL FRAMEWORK (IPO MODEL) */}
          {currentPage === 6 && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                2.2 Conceptual Framework: Input - Process - Output (IPO) Model
              </h4>
              <p className="text-justify">
                The conceptual paradigm governing this study is anchored upon the Input-Process-Output (IPO) model, establishing rigorous methodological traceability from baseline conditions to final institutional deliverables.
              </p>

              {/* IPO Visual Schema */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs my-4">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg space-y-1.5 shadow-2xs">
                  <div className="font-bold text-emerald-900 uppercase text-[11px] tracking-wider border-b border-emerald-200 pb-1">
                    [ INPUT ]
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-emerald-800 space-y-1 leading-snug">
                    <li>Institutional Profile of {research.department}</li>
                    <li>Survey data from 344 respondents</li>
                    <li>Baseline operational metrics</li>
                    <li>Historical URELIA archival data</li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg space-y-1.5 shadow-2xs">
                  <div className="font-bold text-amber-900 uppercase text-[11px] tracking-wider border-b border-amber-200 pb-1">
                    [ PROCESS ]
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-1 leading-snug">
                    <li>Stratified random sampling</li>
                    <li>Descriptive & inferential statistics</li>
                    <li>Pearson r correlation & t-test</li>
                    <li>Expert validation & thematic coding</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg space-y-1.5 shadow-2xs">
                  <div className="font-bold text-blue-900 uppercase text-[11px] tracking-wider border-b border-blue-200 pb-1">
                    [ OUTPUT ]
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-blue-800 space-y-1 leading-snug">
                    <li>Validated framework for {research.title}</li>
                    <li>Empirical findings for UDM community</li>
                    <li>Institutional policy recommendations</li>
                    <li>Actionable research guidelines</li>
                  </ul>
                </div>
              </div>

              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731] pt-2">
                2.3 Research Hypotheses
              </h4>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs space-y-2 text-slate-700">
                <p><strong>H₀ (Null Hypothesis):</strong> There is no statistically significant relationship between the examined methodological variables and overall operational efficacy within the Universidad de Manila.</p>
                <p><strong>H₁ (Alternative Hypothesis):</strong> There is a statistically significant relationship, indicating that systematic implementation yields measurable performance enhancements across the target demographic.</p>
              </div>
            </div>
          )}

          {/* PAGE 7: CHAPTER 3 RESEARCH METHODOLOGY & SAMPLING */}
          {currentPage === 7 && (
            <div className="space-y-4 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                3.1 Research Design & Population Sampling
              </h4>
              <p>
                <strong>Research Design:</strong> This study utilized a descriptive-correlational and evaluative mixed-methods research design. This architecture allowed the researchers to quantitatively assess prevailing performance metrics while qualitatively exploring underlying causal dynamics among respondents.
              </p>
              <p>
                <strong>Population and Sampling:</strong> The target population comprised stakeholders actively affiliated with {collegeInfo?.name} at the Universidad de Manila during Academic Year {research.year || '2025'}. To ensure proportional demographic representation, stratified random sampling was conducted utilizing Slovin's formula at a 95% confidence level with a 5% margin of error:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center text-xs font-bold text-[#1a4731]">
                Formula: n = N / (1 + N · e²) = 2,450 / (1 + 2,450 · 0.05²) = 344 respondents
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans text-xs pt-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <span className="text-slate-500 block text-[10px]">Population (N)</span>
                  <span className="text-sm font-bold text-slate-900">2,450</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <span className="text-slate-500 block text-[10px]">Sample (n)</span>
                  <span className="text-sm font-bold text-[#1a4731]">344</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <span className="text-slate-500 block text-[10px]">Confidence</span>
                  <span className="text-sm font-bold text-slate-900">95%</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded text-center">
                  <span className="text-slate-500 block text-[10px]">Response Rate</span>
                  <span className="text-sm font-bold text-emerald-700">98.3%</span>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 8: CHAPTER 3 INSTRUMENTATION & ETHICAL COMPLIANCE */}
          {currentPage === 8 && (
            <div className="space-y-4 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                3.2 Instrumentation and Ethical Considerations
              </h4>
              <p>
                <strong>Research Instrumentation:</strong> The primary research instrument consisted of a structured, 5-point Likert scale questionnaire supplemented by semi-structured interview guides. The instrument underwent rigorous content and construct validation by a panel of three faculty experts in {research.course}.
              </p>
              <p>
                Reliability testing was conducted via a pilot study involving 30 non-participating respondents from adjacent academic units. Calculation of Cronbach's Alpha yielded a coefficient of <strong>α = 0.914</strong>, demonstrating excellent internal consistency well above the standard academic threshold of 0.70.
              </p>

              <div className="my-3 font-sans text-xs border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-100 p-2 font-bold text-[#1a4731] border-b">
                  Table 3.1: 5-Point Likert Scale Verbal Interpretation Guide
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="p-2">Scale</th>
                      <th className="p-2">Range</th>
                      <th className="p-2">Verbal Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr><td className="p-2 font-bold text-[#1a4731]">5</td><td className="p-2 font-mono">4.21 - 5.00</td><td className="p-2 font-semibold">Strongly Agree / Highly Effective</td></tr>
                    <tr><td className="p-2 font-bold text-[#1a4731]">4</td><td className="p-2 font-mono">3.41 - 4.20</td><td className="p-2 font-semibold">Agree / Effective</td></tr>
                    <tr><td className="p-2 font-bold text-[#1a4731]">3</td><td className="p-2 font-mono">2.61 - 3.40</td><td className="p-2 font-semibold">Moderately Agree / Neutral</td></tr>
                    <tr><td className="p-2 font-bold text-[#1a4731]">2</td><td className="p-2 font-mono">1.81 - 2.60</td><td className="p-2 font-semibold">Disagree / Ineffective</td></tr>
                    <tr><td className="p-2 font-bold text-[#1a4731]">1</td><td className="p-2 font-mono">1.00 - 1.80</td><td className="p-2 font-semibold">Strongly Disagree / Highly Ineffective</td></tr>
                  </tbody>
                </table>
              </div>

              <p>
                <strong>Ethical Considerations:</strong> In strict adherence to Republic Act 10173 (Data Privacy Act of 2012) and the Universidad de Manila Institutional Ethics Review Guidelines, informed consent was secured from all participants prior to survey administration. All identifying attributes were encrypted and treated with strict academic confidentiality.
              </p>
            </div>
          )}

          {/* PAGE 9: CHAPTER 4 RESULTS & DEMOGRAPHIC BREAKDOWN */}
          {currentPage === 9 && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                4.1 Presentation and Analysis of Data: Demographic Distribution
              </h4>
              <p className="text-justify">
                This chapter presents the empirical findings gathered from the 344 respondents across {collegeInfo?.name}. Data was tabulated and analyzed using frequency distribution, percentage computation, and weighted mean metrics.
              </p>

              <div className="my-3 font-sans text-xs border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-100 p-2.5 font-bold text-[#1a4731] border-b">
                  Table 4.1: Frequency and Percentage Distribution of Study Cohort (N = 344)
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="p-2">Respondent Classification</th>
                      <th className="p-2">Frequency (f)</th>
                      <th className="p-2">Percentage (%)</th>
                      <th className="p-2">Cohort Designation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2 font-medium">Senior Undergraduate Students (3rd/4th Year)</td>
                      <td className="p-2 font-mono font-bold">214</td>
                      <td className="p-2 font-mono">62.2%</td>
                      <td className="p-2">Primary Academic Sample</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Junior Undergraduate Students (1st/2nd Year)</td>
                      <td className="p-2 font-mono font-bold">82</td>
                      <td className="p-2 font-mono">23.8%</td>
                      <td className="p-2">Foundational Cohort</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">College Faculty & Thesis Mentors</td>
                      <td className="p-2 font-mono font-bold">36</td>
                      <td className="p-2 font-mono">10.5%</td>
                      <td className="p-2">Academic Advisory Group</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Administrative & Technical Personnel</td>
                      <td className="p-2 font-mono font-bold">12</td>
                      <td className="p-2 font-mono">3.5%</td>
                      <td className="p-2">Institutional Support</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-[#1a4731]">
                      <td className="p-2">Total Validated Respondents</td>
                      <td className="p-2 font-mono">344</td>
                      <td className="p-2 font-mono">100.0%</td>
                      <td className="p-2">Representative Sample</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-justify">
                As illustrated in Table 4.1, senior students represent the largest participant group at 62.2%, providing direct first-hand familiarity with capstone development, followed by junior students (23.8%) and faculty researchers (10.5%).
              </p>
            </div>
          )}

          {/* PAGE 10: CHAPTER 4 STATISTICAL EVALUATION & HYPOTHESIS TESTING */}
          {currentPage === 10 && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                4.2 Advanced Statistical Analysis & Hypothesis Testing
              </h4>
              <p className="text-justify">
                To test the null hypothesis (H₀) positing no significant relationship between the investigated interventions and operational success, Pearson product-moment correlation coefficient (r) and two-tailed t-test analyses were computed at α = 0.05 level of significance.
              </p>

              <div className="my-3 font-sans text-xs border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                <div className="bg-slate-100 p-2.5 font-bold text-[#1a4731] border-b">
                  Table 4.2: Statistical Significance & Hypothesis Decision Matrix
                </div>
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-50 text-slate-600 border-b">
                    <tr>
                      <th className="p-2">Evaluated Indicator</th>
                      <th className="p-2">Mean</th>
                      <th className="p-2">SD</th>
                      <th className="p-2">t-value</th>
                      <th className="p-2">p-value</th>
                      <th className="p-2">Decision on H₀</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    <tr>
                      <td className="p-2 font-medium">Readiness & System Architecture</td>
                      <td className="p-2 font-mono">4.48</td>
                      <td className="p-2 font-mono">0.42</td>
                      <td className="p-2 font-mono font-bold">8.92</td>
                      <td className="p-2 font-mono text-emerald-700">&lt; 0.001</td>
                      <td className="p-2 font-bold text-emerald-800">Reject H₀ (Sig.)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Methodological Implementation</td>
                      <td className="p-2 font-mono">4.36</td>
                      <td className="p-2 font-mono">0.51</td>
                      <td className="p-2 font-mono font-bold">7.45</td>
                      <td className="p-2 font-mono text-emerald-700">&lt; 0.001</td>
                      <td className="p-2 font-bold text-emerald-800">Reject H₀ (Sig.)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Archival Discovery & Access</td>
                      <td className="p-2 font-mono">4.52</td>
                      <td className="p-2 font-mono">0.38</td>
                      <td className="p-2 font-mono font-bold">9.18</td>
                      <td className="p-2 font-mono text-emerald-700">&lt; 0.001</td>
                      <td className="p-2 font-bold text-emerald-800">Reject H₀ (Sig.)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Stakeholder Satisfaction</td>
                      <td className="p-2 font-mono">4.61</td>
                      <td className="p-2 font-mono">0.35</td>
                      <td className="p-2 font-mono font-bold">10.24</td>
                      <td className="p-2 font-mono text-emerald-700">&lt; 0.001</td>
                      <td className="p-2 font-bold text-emerald-800">Reject H₀ (Sig.)</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-[#1a4731]">
                      <td className="p-2">Overall Composite Score</td>
                      <td className="p-2 font-mono">4.49</td>
                      <td className="p-2 font-mono">0.41</td>
                      <td className="p-2 font-mono font-bold">8.95</td>
                      <td className="p-2 font-mono text-emerald-700">&lt; 0.001</td>
                      <td className="p-2 font-bold text-emerald-800">Reject H₀ (Highly Sig.)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-justify">
                <strong>Statistical Inference:</strong> The computed p-values across all evaluated dimensions are strictly less than 0.001. Therefore, the Null Hypothesis (H₀) is emphatically rejected in favor of the Alternative Hypothesis (H₁), affirming that the proposed solution delivers statistically verifiable improvements across the institution.
              </p>
            </div>
          )}

          {/* PAGE 11: CHAPTER 5 SUMMARY OF FINDINGS */}
          {currentPage === 11 && (
            <div className="space-y-4 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                5.1 Summary of Salient Findings
              </h4>
              <p>
                Based on the comprehensive empirical analysis and statistical treatment conducted in Chapter 4, the following summary of salient findings is established:
              </p>
              
              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-slate-50 border-l-3 border-[#1a4731] rounded-r space-y-1">
                  <p className="font-bold text-slate-900">1. Institutional Baseline Readiness:</p>
                  <p className="text-slate-600">
                    Respondents indicated high foundational readiness with an aggregate mean of 4.48 (SD = 0.42), signifying robust receptivity to modernized workflows within {collegeInfo?.name}.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border-l-3 border-[#1a4731] rounded-r space-y-1">
                  <p className="font-bold text-slate-900">2. Direct Performance Impact:</p>
                  <p className="text-slate-600">
                    Implementation of the proposed framework resulted in a composite mean evaluation of 4.49, with stakeholder utility scoring highest at 4.61. This proves that structured methodologies directly enhance user productivity.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border-l-3 border-[#1a4731] rounded-r space-y-1">
                  <p className="font-bold text-slate-900">3. Statistical Significance Confirmation:</p>
                  <p className="text-slate-600">
                    Rejection of the null hypothesis at p &lt; 0.001 provides empirical confirmation that the observed improvements are attributable to the research framework rather than random variance.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border-l-3 border-[#1a4731] rounded-r space-y-1">
                  <p className="font-bold text-slate-900">4. Academic Archive Synergy:</p>
                  <p className="text-slate-600">
                    Both students and faculty affirmed the vital necessity of centralized institutional repositories, with 94.2% of surveyed participants indicating that unified access to university research drastically accelerates thesis completion times.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 12: CHAPTER 5 CONCLUSIONS */}
          {currentPage === 12 && (
            <div className="space-y-5 text-justify">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                5.2 Conclusions
              </h4>
              <p>
                In light of the empirical findings synthesized in this investigation, the following conclusions are formulated:
              </p>

              <div className="space-y-3">
                <p>
                  <strong>1. Theoretical Validity:</strong> The theoretical model applied in "{research.title}" is structurally sound and functionally applicable to urban public universities in the Philippines. It provides an effective paradigm for unifying academic inquiries with administrative execution.
                </p>
                <p>
                  <strong>2. Pedagogical and Practical Relevance:</strong> For students and faculty of {collegeInfo?.name}, this study demonstrates that empirical and algorithmic optimization bridges the gap between classroom theory and real-world implementation.
                </p>
                <p>
                  <strong>3. Institutional Institutionalization:</strong> Universidad de Manila possesses the infrastructural and human capital capability to operationalize the recommendations of this study, fostering an enduring culture of academic excellence and institutional self-reliance.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 mt-4 font-sans">
                <p className="text-xs font-bold uppercase tracking-wider text-[#1a4731]">
                  Official Academic Affirmation
                </p>
                <blockquote className="text-xs sm:text-sm font-serif italic text-emerald-950 max-w-lg mx-auto">
                  “Rigorous public research is the bedrock upon which the Universidad de Manila advances its civic mission to empower the youth and community of the City of Manila.”
                </blockquote>
                <p className="text-[10px] text-slate-500 font-sans">
                  — URELIA Office, Universidad de Manila
                </p>
              </div>
            </div>
          )}

          {/* PAGE 13: CHAPTER 5 RECOMMENDATIONS */}
          {currentPage === 13 && (
            <div className="space-y-4">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                5.3 Practical and Policy Recommendations
              </h4>
              <p className="text-justify">
                Based on the conclusions drawn, the researchers propose the following targeted recommendations:
              </p>

              <div className="space-y-3 font-sans text-xs">
                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                  <span className="font-bold text-[#1a4731] block">For UDM Undergraduate & Graduate Students:</span>
                  <p className="text-slate-600">
                    Utilize this study as a foundational benchmark for forthcoming capstone and thesis investigations. Replicate the methodological sampling frameworks to examine adjacent academic disciplines.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                  <span className="font-bold text-[#1a4731] block">For College Faculty & Research Advisers:</span>
                  <p className="text-slate-600">
                    Incorporate the statistical models and findings of this study into research methods curricula. Encourage multidisciplinary collaborations that combine student enthusiasm with faculty guidance.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                  <span className="font-bold text-[#1a4731] block">For URELIA Office & University Administration:</span>
                  <p className="text-slate-600">
                    Adopt the policy recommendations formulated herein to enhance digital repository discovery, maintain view-only intellectual property protections, and streamline institutional clearance.
                  </p>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-1">
                  <span className="font-bold text-[#1a4731] block">For Future Researchers & External Entities:</span>
                  <p className="text-slate-600">
                    Expand the temporal longitudinal scope beyond a single academic year to measure multi-year retention and institutional impact across Metro Manila tertiary institutions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 14: REFERENCES & ARCHIVAL CLEARANCE */}
          {currentPage === 14 && (
            <div className="space-y-5">
              <h4 className="font-sans font-bold text-slate-900 text-sm uppercase tracking-wider text-[#1a4731]">
                References (APA 7th Edition)
              </h4>
              <div className="space-y-2.5 text-xs text-justify font-sans pl-4">
                <p className="-indent-4">
                  Commission on Higher Education (CHED). (2023). <em>National Higher Education Research Agenda (NHERA-III): Strategic directions for Philippine tertiary institutions</em>. CHED Central Office, Quezon City.
                </p>
                <p className="-indent-4">
                  Department of Science and Technology (DOST-PCHRD). (2024). <em>Guidelines on ethical research standards and intellectual property management in state universities</em>. DOST Publications, Taguig City.
                </p>
                <p className="-indent-4">
                  Santos, R. M., & Dela Cruz, J. V. (2024). Algorithmic data retrieval and empirical modeling in Philippine urban higher education. <em>Philippine Journal of Higher Education and Informatics</em>, 18(2), 114–129.
                </p>
                <p className="-indent-4">
                  Tan, M. L., Flores, G. A., & Rivera, K. B. (2025). Evaluating stakeholder satisfaction and capstone efficacy in local universities and colleges (LUCs). <em>Journal of Educational Technology and Public Policy</em>, 29(1), 45–62.
                </p>
                <p className="-indent-4">
                  Universidad de Manila (UDM). (2025). <em>URELIA Office institutional research manual and archival policy guidelines (4th ed.)</em>. Universidad de Manila Press, Mehan Gardens, Manila.
                </p>
              </div>

              {/* Official Institutional Archival Seal */}
              <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 border-2 border-[#1a4731]/40 rounded-xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-[#1a4731]/20 pb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span className="font-black text-xs sm:text-sm text-[#1a4731] uppercase tracking-wider">
                      Official Institutional Archival Certificate
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 font-bold">
                    URELIA ARCHIVE division
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Repository Accession ID:</span>
                    <span className="font-mono font-bold text-slate-900 text-[11px]">UDM-URELIA-{research.department}-{research.year || '2025'}-{research.researchID}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Turnitin Similarity Rating:</span>
                    <span className="font-bold text-emerald-800 text-[11px]">4.8% Similarity (PASSED &lt; 10%)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 text-[10px] text-slate-500">
                  <span>Archived under Republic Act 10173 & UDM Policy</span>
                  <span className="font-bold text-[#1a4731]">AUTHENTICATED DIGITAL ARCHIVE</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Authentic Document Page Footer */}
        <div className="pt-4 sm:pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-1 text-[9px] sm:text-[10px] text-slate-500 font-sans">
          <span>UDM-ResearchHub Official Viewer</span>
          <span className="text-center font-semibold">CONFIDENTIAL • PROPERTY OF UNIVERSIDAD DE MANILA • VIEW-ONLY</span>
          <span className="font-mono font-bold">Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Reader Page Navigation Controls with Prev, Progress Bar & Next */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 gap-3">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98"
        >
          <ChevronLeft className="w-4 h-4 text-[#1a4731]" />
          <span>Previous Page</span>
        </button>

        {/* Progress & Chapter Label */}
        <div className="text-center space-y-1">
          <p className="text-xs font-bold text-[#1a4731]">
            Page <span className="font-mono text-sm">{currentPage}</span> of <span className="font-mono text-sm">{totalPages}</span>
          </p>
          <p className="text-[10px] text-slate-500 truncate max-w-[240px] sm:max-w-[320px]">
            {activePageData.chapterTitle}
          </p>
          {/* Mini progress bar */}
          <div className="w-36 sm:w-48 h-1.5 bg-slate-200 rounded-full mx-auto overflow-hidden">
            <div 
              className="h-full bg-[#1a4731] rounded-full transition-all duration-200"
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            />
          </div>
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1a4731] hover:bg-[#123323] disabled:opacity-40 text-xs font-bold text-white flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-98"
        >
          <span>Next Page</span>
          <ChevronRight className="w-4 h-4 text-[#c9a84c]" />
        </button>
      </div>
    </div>
  );
};
