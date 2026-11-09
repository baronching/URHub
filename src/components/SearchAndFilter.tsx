import React from 'react';
import { SearchFilters, UDMCollege, UDM_COLLEGES, User } from '../types';
import { canViewUnpublished, isStudent } from '../utils/userUtils';
import { Search, Filter, RotateCcw, Building2, BookOpen, Lock } from 'lucide-react';

interface SearchAndFilterProps {
  filters: SearchFilters;
  onChangeFilters: (filters: SearchFilters) => void;
  availableKeywords: string[];
  totalResults: number;
  currentUser?: User | null;
  onOpenAuthModal?: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onChangeFilters,
  availableKeywords,
  totalResults,
  currentUser,
  onOpenAuthModal
}) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, query: e.target.value });
  };

  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({ ...filters, college: e.target.value as UDMCollege | 'ALL' });
  };

  const handlePublicationStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!canViewUnpublished(currentUser)) {
      return;
    }
    onChangeFilters({
      ...filters,
      publicationStatus: val as 'ALL' | 'published' | 'unpublished'
    });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onChangeFilters({
      ...filters,
      year: val === 'ALL' ? 'ALL' : parseInt(val, 10)
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({
      ...filters,
      sortBy: e.target.value as 'relevance' | 'newest' | 'views'
    });
  };

  const handleKeywordClick = (kw: string) => {
    const newKw = filters.keyword === kw ? 'ALL' : kw;
    onChangeFilters({ ...filters, keyword: newKw });
  };

  const resetFilters = () => {
    onChangeFilters({
      query: '',
      college: 'ALL',
      year: 'ALL',
      keyword: 'ALL',
      authorCategory: 'ALL',
      publicationStatus: canViewUnpublished(currentUser) ? 'ALL' : 'published',
      sortBy: 'relevance'
    });
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4">
      {/* Search Input bar */}
      <div className="relative flex items-center">
        <Search className="w-5 h-5 absolute left-4 text-[#1a4731] pointer-events-none" />
        <input
          type="text"
          value={filters.query}
          onChange={handleQueryChange}
          placeholder="Search research title, abstract keywords, authors, or thesis topic..."
          className="w-full bg-slate-50 border border-slate-200 focus:border-[#1a4731] rounded-lg pl-12 pr-36 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4731]/20 transition-all font-medium"
        />
        <div className="absolute right-3 flex items-center space-x-2">
          {filters.query && (
            <button
              onClick={() => onChangeFilters({ ...filters, query: '' })}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors"
            >
              Clear
            </button>
          )}
          <span className="text-[11px] font-bold text-[#1a4731] bg-[#1a4731]/10 border border-[#1a4731]/20 px-2 py-0.5 rounded select-none">
            {totalResults} {totalResults === 1 ? 'Paper' : 'Papers'}
          </span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded select-none pointer-events-none">
            TF-IDF Search
          </span>
        </div>
      </div>

      {/* Dropdown Filters & Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          
          {/* UDM Unit / College Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
            <Building2 className="w-3.5 h-3.5 text-[#1a4731] shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Unit:</span>
            <select
              value={filters.college}
              onChange={handleCollegeChange}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-[240px] truncate"
              title="Filter by UDM Units (7 Colleges + Faculty & Administration)"
            >
              <option value="ALL">All UDM Units (7 Colleges + Faculty & Admin)</option>
              {UDM_COLLEGES.map(col => {
                const isFacultyAdmin = col.id === 'FAC-ADM';
                return (
                  <option key={col.id} value={col.id}>
                    {col.id} - {isFacultyAdmin ? 'Faculty & Administration' : col.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Publication Status Dropdown (Published / Unpublished / All) */}
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
            {canViewUnpublished(currentUser) ? (
              <BookOpen className="w-3.5 h-3.5 text-[#1a4731] shrink-0" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            )}
            <span className="text-slate-500 font-medium shrink-0">Status:</span>
            <select
              value={!canViewUnpublished(currentUser) ? 'published' : (filters.publicationStatus || 'ALL')}
              onChange={handlePublicationStatusChange}
              disabled={!canViewUnpublished(currentUser)}
              className={`bg-transparent text-slate-800 font-bold focus:outline-none ${
                !canViewUnpublished(currentUser) ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
              }`}
            >
              <option value="published">Published</option>
              {canViewUnpublished(currentUser) ? (
                <>
                  <option value="unpublished">Unpublished</option>
                  <option value="ALL">All Status (Published & Unpublished)</option>
                </>
              ) : (
                <option value="unpublished" disabled>
                  Unpublished (Dean, Director & Admin Only 🔒)
                </option>
              )}
            </select>
            {!canViewUnpublished(currentUser) && (
              <span
                className="text-[10px] text-amber-800 font-bold bg-amber-100/90 border border-amber-300 px-1.5 py-0.5 rounded ml-0.5 select-none"
                title="Roles 1 (Student), 2 (Program Chair), and 4 (URELIA Staff) have no access to unpublished research"
              >
                Published Only (No Access)
              </span>
            )}
          </div>

          {/* Year Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
            <Filter className="w-3.5 h-3.5 text-[#1a4731] shrink-0" />
            <span className="text-slate-500 font-medium shrink-0">Year:</span>
            <select
              value={filters.year.toString()}
              onChange={handleYearChange}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
            <span className="text-slate-500 font-medium shrink-0">Sort By:</span>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              <option value="relevance">Relevance (TF-IDF)</option>
              <option value="newest">Newest First</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 font-medium cursor-pointer"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Popular Keyword Chips */}
        {availableKeywords.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
            <span className="text-[11px] text-slate-500 font-medium">Keywords:</span>
            {availableKeywords.slice(0, 5).map(kw => (
              <button
                key={kw}
                onClick={() => handleKeywordClick(kw)}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                  filters.keyword === kw
                    ? 'bg-[#1a4731] text-white'
                    : 'bg-[#c9a84c]/10 text-[#1a4731] hover:bg-[#c9a84c]/20 border border-[#c9a84c]/30'
                }`}
              >
                #{kw}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
