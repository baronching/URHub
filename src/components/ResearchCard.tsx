import React from 'react';
import { Research, UDM_COLLEGES } from '../types';
import { Eye, Download, FileText, Calendar, GraduationCap, ArrowUpRight } from 'lucide-react';

interface ResearchCardProps {
  research: Research;
  onSelect: (research: Research) => void;
  onDownloadAbstract: (research: Research, e: React.MouseEvent) => void;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({
  research,
  onSelect,
  onDownloadAbstract
}) => {
  const collegeInfo = UDM_COLLEGES.find(c => c.id === research.department);

  return (
    <div
      onClick={() => onSelect(research)}
      className="group bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-slate-200 hover:border-[#1a4731]/40 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#1a4731]" />

      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2.5 sm:mb-3">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs font-bold bg-[#1a4731] text-white uppercase tracking-wider shrink-0">
              {research.department}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-semibold truncate max-w-[140px] sm:max-w-[200px]" title={collegeInfo?.name}>
              {collegeInfo?.name.replace('College of ', '') || research.department}
            </span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3 text-[11px] sm:text-xs text-slate-500 font-medium shrink-0">
            <span className="flex items-center space-x-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#1a4731]" />
              <span>{research.year}</span>
            </span>
            <span className="flex items-center space-x-1 font-mono">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{research.viewsCount}</span>
            </span>
          </div>
        </div>

        {/* Paper Title - Responsive for mobile portrait, tablet & desktop */}
        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#1a4731] transition-colors line-clamp-3 leading-snug break-words mb-2 sm:mb-2.5">
          {research.title}
        </h3>

        {/* Course & Authors */}
        <div className="space-y-1 mb-2.5 sm:mb-3">
          <p className="text-xs sm:text-sm text-[#1a4731] font-semibold flex items-center space-x-1 break-words">
            <GraduationCap className="w-3.5 h-3.5 text-[#1a4731] shrink-0" />
            <span>{research.course}</span>
          </p>
          <p className="text-xs text-slate-500 italic break-words">
            Authors: {research.authors.join(', ')}
          </p>
        </div>

        {/* Abstract snippet */}
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3 sm:mb-4 break-words">
          {research.abstract}
        </p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-1.5 mb-4 sm:mb-5">
          {research.keywords.slice(0, 4).map((kw, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#c9a84c]/10 text-[#1a4731] border border-[#c9a84c]/30"
            >
              #{kw}
            </span>
          ))}
          {research.keywords.length > 4 && (
            <span className="text-[10px] text-slate-400 self-center font-medium">
              +{research.keywords.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="pt-3 sm:pt-4 border-t border-slate-100 flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <button
          onClick={(e) => onDownloadAbstract(research, e)}
          className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-[#1a4731] border border-slate-200 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-[#c9a84c]" />
          <span>Download Abstract</span>
        </button>

        <button className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#1a4731] hover:bg-[#123323] text-white shadow-sm flex items-center justify-center space-x-1.5 transition-all group-hover:translate-x-0.5 cursor-pointer">
          <FileText className="w-3.5 h-3.5 text-[#c9a84c]" />
          <span>View Paper</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#c9a84c]" />
        </button>
      </div>
    </div>
  );
};
