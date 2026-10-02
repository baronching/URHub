import React from 'react';
import { BookOpen, Sparkles, FilePlus, Building2, ShieldCheck, GraduationCap } from 'lucide-react';

interface HeroBannerProps {
  totalPapers: number;
  onOpenSubmission: () => void;
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalPapers,
  onOpenSubmission,
  onExploreClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-[#c9a84c]/40 bg-[#1a4731]/40 backdrop-blur-md min-h-[340px] sm:min-h-[380px] flex items-center transition-all p-6 sm:p-10">
      {/* Hero Content */}
      <div className="relative z-10 w-full space-y-6 max-w-4xl text-white">
        {/* Heraldic Tagline Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-[#c9a84c]/40 backdrop-blur-md text-xs font-bold text-[#c9a84c] tracking-wider uppercase">
          <GraduationCap className="w-4 h-4 text-[#c9a84c]" />
          <span>Universidad de Manila • URELIA Office Archive</span>
        </div>

        {/* Main Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
            Institutional Research <br className="hidden sm:inline" />
            <span className="text-[#c9a84c]">Archives & Repository</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-100 leading-relaxed max-w-2xl">
            Centralized digital research database for capstone projects, academic journals, and faculty studies across all 7 Colleges of Universidad de Manila. Enhanced with Machine Learning TF-IDF indexing.
          </p>
        </div>

        {/* Stats & Feature Highlights */}
        <div className="flex flex-wrap gap-3 sm:gap-6 pt-1 text-xs sm:text-sm font-semibold text-slate-100">
          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
            <BookOpen className="w-4 h-4 text-[#c9a84c]" />
            <span><strong className="text-white font-bold">{totalPapers}</strong> Approved Researches</span>
          </div>

          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
            <Building2 className="w-4 h-4 text-[#c9a84c]" />
            <span>7 Academic Colleges</span>
          </div>

          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[#c9a84c]" />
            <span>TF-IDF Recommendation</span>
          </div>

          <div className="flex items-center space-x-2 bg-black/30 px-3 py-1.5 rounded-lg border border-white/15 backdrop-blur-sm">
            <ShieldCheck className="w-4 h-4 text-[#c9a84c]" />
            <span>Abstract Protection</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onExploreClick}
            className="px-5 py-3 rounded-xl bg-[#c9a84c] hover:bg-[#b8973b] text-[#1a4731] font-bold text-xs sm:text-sm shadow-lg flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore Research Archive</span>
          </button>

          <button
            onClick={onOpenSubmission}
            className="px-5 py-3 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 font-bold text-xs sm:text-sm backdrop-blur-sm flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
          >
            <FilePlus className="w-4 h-4 text-[#c9a84c]" />
            <span>Submit Research Paper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
