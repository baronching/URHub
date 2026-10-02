import React, { useState } from 'react';
import { 
  GraduationCap, 
  Cpu, 
  Handshake, 
  Globe, 
  CheckCircle2, 
  ExternalLink,
  Info,
  ChevronDown
} from 'lucide-react';

interface SDGItem {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  bgColor: string;
  accentColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  alignmentDetails: string;
  unUrl: string;
}

const SDG_DATA: SDGItem[] = [
  {
    id: 4,
    number: '04',
    title: 'Quality Education',
    subtitle: 'Ensure inclusive & equitable quality education',
    bgColor: 'bg-[#C5192D]',
    accentColor: '#C5192D',
    icon: GraduationCap,
    description: 'Giving all students and faculty free, easy access to verified research, student theses, and academic learning materials across all 7 UDM colleges.',
    alignmentDetails: 'Gives students and teachers open access to completed research papers and capstone projects, making it easy to study, find related literature, and learn from past academic works.',
    unUrl: 'https://sdgs.un.org/goals/goal4'
  },
  {
    id: 9,
    number: '09',
    title: 'Industry, Innovation & Infrastructure',
    subtitle: 'Build resilient infrastructure & foster innovation',
    bgColor: 'bg-[#FD6925]',
    accentColor: '#FD6925',
    icon: Cpu,
    description: 'Upgrading the university’s research tools with smart search and digital archiving so papers are safe, well-organized, and fast to find.',
    alignmentDetails: 'Modernizes how research is saved and discovered with smart search features that automatically suggest related papers based on your research topics and interests.',
    unUrl: 'https://sdgs.un.org/goals/goal9'
  },
  {
    id: 17,
    number: '17',
    title: 'Partnerships for the Goals',
    subtitle: 'Strengthen the means of implementation & partnerships',
    bgColor: 'bg-[#19486A]',
    accentColor: '#19486A',
    icon: Handshake,
    description: 'Helping students, professors, and university offices collaborate and share research across different colleges and academic programs.',
    alignmentDetails: 'Connects student researchers, faculty mentors, and the URELIA Research Office in one shared hub, making it easy to collaborate across different departments and colleges.',
    unUrl: 'https://sdgs.un.org/goals/goal17'
  }
];

export const SDGSection: React.FC = () => {
  // Store expanded state per card ID so each card expands/collapses independently
  const [expandedSDGs, setExpandedSDGs] = useState<Record<number, boolean>>({});

  const toggleSDG = (id: number) => {
    setExpandedSDGs((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <section 
      id="sdg-alignment-section" 
      className="bg-[#113122]/95 border border-[#c9a84c]/30 rounded-2xl p-6 sm:p-7 shadow-xl backdrop-blur-sm text-white transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="p-1.5 rounded-lg bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/40">
              <Globe className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#c9a84c]">
              UN Sustainable Development Goals
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Institutional SDG Alignment
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Universidad de Manila aligns its academic research repository with the United Nations 2030 Agenda for Sustainable Development to foster innovation, quality education, and collaborative scholarship.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a84c] mr-1.5" />
            3 Primary Supported Goals
          </span>
        </div>
      </div>

      {/* 3 SDG Official Color-Coded Square Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 items-start">
        {SDG_DATA.map((sdg) => {
          const IconComponent = sdg.icon;
          const isExpanded = !!expandedSDGs[sdg.id];

          return (
            <div
              key={sdg.id}
              className={`relative rounded-xl border transition-all duration-200 overflow-hidden p-4 flex flex-col justify-between ${
                isExpanded 
                  ? 'bg-white/15 border-[#c9a84c] shadow-lg ring-1 ring-[#c9a84c]/50' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div>
                {/* Header with Official SDG Badge Square */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    {/* Official SDG Color-coded Square Icon Badge */}
                    <div 
                      className={`w-12 h-12 rounded-lg ${sdg.bgColor} text-white flex flex-col items-center justify-center shadow-md shrink-0 border border-white/20`}
                      style={{ backgroundColor: sdg.accentColor }}
                    >
                      <span className="text-[10px] font-black tracking-wider leading-none">
                        SDG
                      </span>
                      <span className="text-base font-black leading-none mt-0.5">
                        {sdg.number}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-[#c9a84c] uppercase tracking-wider block">
                        Goal {sdg.id}
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {sdg.title}
                      </h3>
                    </div>
                  </div>

                  <div className="p-1 rounded-md bg-white/5 text-white/50">
                    <IconComponent className="w-4 h-4" />
                  </div>
                </div>

                {/* Subtitle & Impact description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {sdg.description}
                </p>
              </div>

              {/* Action / Detail reveal trigger button */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => toggleSDG(sdg.id)}
                  aria-expanded={isExpanded}
                  className="group/btn inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-[#c9a84c] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c] rounded cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-[#c9a84c]" />
                  <span>{isExpanded ? 'Hide alignment details' : 'View alignment details'}</span>
                  <ChevronDown 
                    className={`w-3.5 h-3.5 text-slate-400 group-hover/btn:text-[#c9a84c] transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>

              {/* Expanded alignment details */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200 bg-black/20 -mx-4 -mb-4 p-4 space-y-2 animate-in fade-in duration-150">
                  <div className="font-semibold text-[#c9a84c] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#c9a84c] shrink-0" />
                    How UDM-ResearchHub Supports SDG {sdg.id}:
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {sdg.alignmentDetails}
                  </p>
                  <div className="pt-1">
                    <a
                      href={sdg.unUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] font-semibold text-[#c9a84c] hover:underline gap-1"
                    >
                      <span>UN Official Goal Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
