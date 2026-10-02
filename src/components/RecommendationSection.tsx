import React from 'react';
import { Recommendation, Research, UDM_COLLEGES, UDMCollege, User } from '../types';
import { Sparkles, BrainCircuit, Sliders, ArrowUpRight, BookOpen, ChevronDown } from 'lucide-react';

interface RecommendationSectionProps {
  currentUser: User | null;
  recommendations: (Recommendation & { paper?: Research })[];
  targetCollege?: UDMCollege;
  onTargetCollegeChange?: (college: UDMCollege) => void;
  onSelectResearch: (research: Research) => void;
  onOpenAuth: () => void;
}

export const RecommendationSection: React.FC<RecommendationSectionProps> = ({
  currentUser,
  recommendations,
  targetCollege,
  onTargetCollegeChange,
  onSelectResearch,
  onOpenAuth
}) => {
  if (!currentUser) {
    return (
      <div className="bg-white rounded-xl p-8 border border-slate-200 text-center space-y-4 max-w-2xl mx-auto shadow-sm my-8">
        <div className="w-16 h-16 rounded-full bg-[#1a4731]/10 border border-[#1a4731]/20 flex items-center justify-center text-[#1a4731] mx-auto">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#1a4731]">
          Personalized AI Machine Learning Recommendations
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Log in with your official UDM email address (@udm.edu.ph) to access personalized research recommendations powered by TF-IDF Cosine Similarity (Content-Based) and User Interaction Matrix (Collaborative Filtering).
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-3 rounded-lg bg-[#1a4731] hover:bg-[#123323] text-white font-bold text-xs shadow-sm inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4 text-[#c9a84c]" />
          <span>Login with UDM Account</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner Explanation */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-[#1a4731]/10 text-[#1a4731] border border-[#1a4731]/20">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-[#1a4731]">
              AI Recommendations for {currentUser.name}
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            Engineered using <strong>TF-IDF Vector Space</strong> (Content-Based 60%) & <strong>User-Item Interaction Matrix</strong> (Collaborative Filtering 40%)
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs bg-slate-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-slate-200">
          <Sliders className="w-4 h-4 text-[#1a4731] shrink-0" />
          <label htmlFor="target-college-select" className="text-slate-500 font-medium whitespace-nowrap">
            Target College:
          </label>
          <div className="relative inline-flex items-center">
            <select
              id="target-college-select"
              value={targetCollege || currentUser.college || 'CCS'}
              onChange={(e) => onTargetCollegeChange?.(e.target.value as UDMCollege)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-[#1a4731] font-mono shadow-xs focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] cursor-pointer appearance-none pr-7 hover:border-slate-400 transition-colors"
            >
              {UDM_COLLEGES.map((c) => (
                <option key={c.id} value={c.id} className="font-sans font-medium text-slate-800">
                  {c.id} - {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Recommendation Grid */}
      {recommendations.length === 0 ? (
        <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
          No recommendations available yet. Browse and view papers in the Research Archive to build your interaction profile!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const paper = rec.paper;
            if (!paper) return null;

            const matchPercent = Math.round(rec.score * 100);
            const collegeInfo = UDM_COLLEGES.find(c => c.id === paper.department);

            return (
              <div
                key={rec.recommendID}
                onClick={() => onSelectResearch(paper)}
                className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-slate-200 hover:border-[#1a4731]/40 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top Score Badge */}
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5 sm:mb-3">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#1a4731] text-[#c9a84c] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#c9a84c]" />
                      <span>{matchPercent}% Match</span>
                    </span>

                    <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                      CB: {Math.round(rec.contentBasedScore * 100)}% | CF: {Math.round(rec.collaborativeScore * 100)}%
                    </span>
                  </div>

                  {/* College & Year */}
                  <span className="text-xs font-bold text-[#1a4731] block mb-1">
                    {paper.department} • {collegeInfo?.name.replace('College of ', '')}
                  </span>

                  {/* Paper Title - Responsive */}
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 group-hover:text-[#1a4731] transition-colors line-clamp-3 leading-snug break-words mb-2 sm:mb-2.5">
                    {paper.title}
                  </h3>

                  {/* Abstract Snippet */}
                  <p className="text-xs text-slate-600 line-clamp-3 mb-4">
                    {paper.abstract}
                  </p>

                  {/* Matched Terms */}
                  <div className="space-y-1 mb-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      TF-IDF Matched Vectors:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {rec.matchedKeywords.map((term, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] bg-[#c9a84c]/10 text-[#1a4731] border border-[#c9a84c]/30 font-mono font-medium"
                        >
                          #{term}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#1a4731] group-hover:underline">
                  <span className="flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#c9a84c]" />
                    <span>View Recommended Paper</span>
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#c9a84c]" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
