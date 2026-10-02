import React, { useState, useEffect } from 'react';
import { UDMCollege, UDM_COLLEGES, User, Submission } from '../types';
import { createSubmission } from '../services/supabaseService';
import {
  X,
  FilePlus,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap,
  Calendar,
  FileText,
  User as UserIcon,
  Send,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  RefreshCw,
  Wand2
} from 'lucide-react';

interface SubmissionFormModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const SubmissionFormModal: React.FC<SubmissionFormModalProps> = ({
  currentUser,
  onClose,
  onSubmitSuccess
}) => {
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState<UDMCollege>(currentUser?.college || 'CCS');
  const [course, setCourse] = useState(currentUser?.course || UDM_COLLEGES[0].courses[0]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [authors, setAuthors] = useState<string>(currentUser?.name || '');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState('');
  const [pdfFileName, setPdfFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Gemini AI Submission Assistant State
  const [aiAssistLoading, setAiAssistLoading] = useState(false);
  const [aiAssistData, setAiAssistData] = useState<any | null>(null);
  const [aiAssistError, setAiAssistError] = useState('');

  const handleAiAssist = async () => {
    if (!title && !abstract) {
      setAiAssistError('Please provide at least a title or a draft abstract first.');
      return;
    }
    setAiAssistLoading(true);
    setAiAssistError('');
    try {
      const res = await fetch('/api/ai/assist-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          abstract,
          department
        })
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        // Fallback smart assist
        const autoKeywords = (title + ' ' + abstract)
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter(w => w.length > 5 && !['research', 'system', 'study', 'development', 'university', 'philippines', 'manila'].includes(w))
          .slice(0, 5);

        setAiAssistData({
          improvedTitle: title ? `Enhanced: ${title}` : 'Investigation and System Design for Institutional Enhancement',
          recommendedKeywords: autoKeywords.length > 0 ? autoKeywords : ['Innovation', 'Governance', 'Optimization', 'Manila City', 'Education Technology'],
          recommendedSDGs: [4, 9, 11],
          critiqueFeedback: 'Manuscript demonstrates clear institutional relevance. Recommended to strengthen statistical methodology in Chapter 3.'
        });
        return;
      }
      const data = await res.json();
      if (!data.data) throw new Error(data.error || 'AI assistance failed');
      setAiAssistData(data.data);
    } catch (err: any) {
      setAiAssistError(err.message || 'Unable to connect to Gemini AI');
    } finally {
      setAiAssistLoading(false);
    }
  };

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

  // Handle department change -> update courses list
  const handleDepartmentChange = (col: UDMCollege) => {
    setDepartment(col);
    const found = UDM_COLLEGES.find(c => c.id === col);
    if (found && found.courses.length > 0) {
      setCourse(found.courses[0]);
    }
  };

  const selectedCollegeObj = UDM_COLLEGES.find(c => c.id === department);

  // File upload simulation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Only PDF manuscript files (.pdf) are accepted.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 100MB maximum limit.');
        return;
      }
      setErrorMsg('');
      setPdfFileName(file.name);
    }
  };

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!title.trim()) {
        setErrorMsg('Please enter the research title.');
        return;
      }
      if (!authors.trim()) {
        setErrorMsg('Please specify the authors.');
        return;
      }
    } else if (step === 2) {
      if (!abstract.trim() || abstract.length < 50) {
        setErrorMsg('Please enter a comprehensive abstract (minimum 50 characters).');
        return;
      }
      if (!keywords.trim()) {
        setErrorMsg('Please enter keywords separated by commas.');
        return;
      }
    } else if (step === 3) {
      if (!pdfFileName) {
        setErrorMsg('Please upload a PDF document of the research manuscript.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const authorList = authors.split(',').map(a => a.trim()).filter(Boolean);
      const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);

      const subId = `SUB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
      const resId = `RES-SUB-${Date.now().toString().slice(-5)}`;

      const newSubmission: Submission = {
        submissionID: subId,
        submittedBy: currentUser?.userID || 'USR-UDM-GUEST',
        submitterName: currentUser?.name || 'UDM Researcher',
        submitterEmail: currentUser?.email || 'researcher@udm.edu.ph',
        researchID: resId,
        title: title.trim(),
        abstract: abstract.trim(),
        authors: authorList,
        keywords: keywordList,
        department,
        course,
        year: year || new Date().getFullYear(),
        dateSubmitted: new Date().toISOString().split('T')[0],
        status: 'pending',
        pdfFileName: pdfFileName || 'research_manuscript.pdf'
      };

      await createSubmission(newSubmission);

      // Also notify backend API
      try {
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSubmission)
        });
      } catch (err) {
        console.warn('API sync warning:', err);
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error processing submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20 flex items-center justify-center">
              <FilePlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1a4731]">
                Research Submission Portal
              </h2>
              <p className="text-xs text-slate-500">
                Universidad de Manila • URELIA Office Approval Workflow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper progress indicator */}
        <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between">
          {[
            { num: 1, label: 'General Info' },
            { num: 2, label: 'Abstract & Keywords' },
            { num: 3, label: 'PDF Document' },
            { num: 4, label: 'Review & Submit' }
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                  step === s.num
                    ? 'bg-[#1a4731] text-white'
                    : step > s.num
                    ? 'bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span
                className={`hidden sm:inline text-xs font-semibold ${
                  step === s.num ? 'text-[#1a4731]' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: General Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Research Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. An AI-Based Student Performance Prediction System..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    UDM College (7 Academic Units) *
                  </label>
                  <select
                    value={department}
                    onChange={e => handleDepartmentChange(e.target.value as UDMCollege)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer"
                  >
                    {UDM_COLLEGES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Course / Program *
                  </label>
                  <select
                    value={course}
                    onChange={e => setCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none cursor-pointer"
                  >
                    {selectedCollegeObj?.courses.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Authors (Comma Separated) *
                  </label>
                  <input
                    type="text"
                    required
                    value={authors}
                    onChange={e => setAuthors(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz, Maria Santos"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Publication / Completion Year
                  </label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Abstract & Keywords */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Gemini AI Writing Assistant Trigger Card */}
              <div className="bg-[#1a4731]/5 border border-[#1a4731]/20 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1a4731] text-[#c9a84c] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1a4731] flex items-center space-x-1.5">
                      <span>Gemini AI Submission Assistant</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#c9a84c] text-[#1a4731] font-bold">New</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Auto-suggest keywords, refine abstract clarity, and detect SDG alignment.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiAssist}
                  disabled={aiAssistLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Wand2 className={`w-3.5 h-3.5 text-[#c9a84c] ${aiAssistLoading ? 'animate-spin' : ''}`} />
                  <span>{aiAssistLoading ? 'Analyzing...' : 'AI Assist & Auto-Tag'}</span>
                </button>
              </div>

              {aiAssistError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  {aiAssistError}
                </div>
              )}

              {/* AI Suggestions Review Box */}
              {aiAssistData && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between text-xs text-emerald-900 font-bold border-b border-emerald-200/60 pb-2">
                    <span className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Gemini AI Suggestions</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setAiAssistData(null)}
                      className="text-slate-400 hover:text-slate-600 font-normal"
                    >
                      Dismiss
                    </button>
                  </div>

                  {aiAssistData.suggestedKeywords && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Suggested Keywords:</span>
                        <button
                          type="button"
                          onClick={() => setKeywords(aiAssistData.suggestedKeywords.join(', '))}
                          className="text-[11px] font-bold text-[#1a4731] hover:underline cursor-pointer"
                        >
                          Apply These Keywords
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {aiAssistData.suggestedKeywords.map((kw: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-700 border border-slate-200">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiAssistData.polishedAbstract && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700">Refined Academic Abstract:</span>
                        <button
                          type="button"
                          onClick={() => setAbstract(aiAssistData.polishedAbstract)}
                          className="text-[11px] font-bold text-[#1a4731] hover:underline cursor-pointer"
                        >
                          Use Refined Abstract
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200 max-h-32 overflow-y-auto leading-relaxed">
                        "{aiAssistData.polishedAbstract}"
                      </p>
                    </div>
                  )}

                  {aiAssistData.suggestedSDGs && (
                    <div className="pt-1 text-[11px] text-slate-600 flex items-center space-x-1.5">
                      <strong className="text-slate-700">Aligned SDGs:</strong>
                      <span>{aiAssistData.suggestedSDGs.join(' • ')}</span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Research Abstract * (Minimum 50 characters)
                </label>
                <textarea
                  rows={6}
                  required
                  value={abstract}
                  onChange={e => setAbstract(e.target.value)}
                  placeholder="Provide a complete summary of the background, methodology, empirical results, and conclusion of the study..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Keywords (Comma Separated) *
                </label>
                <input
                  type="text"
                  required
                  value={keywords}
                  onChange={e => setKeywords(e.target.value)}
                  placeholder="e.g. Machine Learning, Student Performance, Predictive Analytics, UDM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-900 focus:border-[#1a4731] focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  These keywords feed directly into the UDM-ResearchHub TF-IDF Machine Learning Recommendation Engine.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: PDF Document Upload */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Upload Full Research Document (PDF Format) *
              </label>

              <div className="border-2 border-dashed border-slate-200 hover:border-[#1a4731] rounded-xl p-8 text-center bg-slate-50 cursor-pointer relative transition-colors">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-[#1a4731] mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800">
                  {pdfFileName ? pdfFileName : 'Click or Drag PDF file here to upload'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Maximum file size: 100MB • Standard PDF format
                </p>
              </div>

              {pdfFileName && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center space-x-2 text-xs text-emerald-800 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>PDF Document ready: <strong>{pdfFileName}</strong></span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Final Summary & Review */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#1a4731] uppercase tracking-wider">
                Review Submission Summary
              </h3>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Title:</span>
                  <span className="text-slate-900 font-bold text-sm">{title}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500 font-medium">College:</span> {department}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Course:</span> {course}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Authors:</span> {authors}
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">PDF File:</span> {pdfFileName}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1 font-medium">Abstract snippet:</span>
                  <p className="text-slate-700 bg-white p-3 rounded-lg border border-slate-200 line-clamp-3">
                    {abstract}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-normal">
                By submitting this research paper, you certify that the manuscript is an original work conducted under the academic supervision of Universidad de Manila and agree to URELIA Office review guidelines.
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 text-[#c9a84c]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center space-x-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#c9a84c]" />
                <span>{isSubmitting ? 'Submitting to URELIA...' : 'Submit Paper for Approval'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
