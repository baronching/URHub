import React from 'react';
import { SearchFilters, UDMCollege, UDM_COLLEGES } from '../types';
import { Search, Filter, RotateCcw, Building2 } from 'lucide-react';

interface SearchAndFilterProps {
  filters: SearchFilters;
  onChangeFilters: (filters: SearchFilters) => void;
  availableKeywords: string[];
  totalResults: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  filters,
  onChangeFilters,
  availableKeywords,
  totalResults
}) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeFilters({ ...filters, query: e.target.value });
  };

  const handleCollegeSelect = (college: UDMCollege | 'ALL') => {
    onChangeFilters({ ...filters, college });
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
          className="w-full bg-slate-50 border border-slate-200 focus:border-[#1a4731] rounded-lg pl-12 pr-28 py-3 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a4731]/20 transition-all font-medium"
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
          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded select-none pointer-events-none">
            TF-IDF Search
          </span>
        </div>
      </div>

      {/* College Filter Buttons (7 UDM Colleges) */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span className="font-bold text-[#1a4731] flex items-center space-x-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#1a4731]" />
            <span>Filter by UDM Colleges (7 Academic Units)</span>
          </span>
          <span className="text-[#1a4731] font-bold">{totalResults} Researches Found</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCollegeSelect('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              filters.college === 'ALL'
                ? 'bg-[#1a4731] text-white border-[#1a4731] shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-[#1a4731]/40'
            }`}
          >
            All Colleges (7)
          </button>

          {UDM_COLLEGES.map(col => (
            <button
              key={col.id}
              onClick={() => handleCollegeSelect(col.id)}
              title={col.name}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all border ${
                filters.college === col.id
                  ? 'bg-[#1a4731] text-white border-[#1a4731] shadow-sm ring-2 ring-[#1a4731]/20'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-[#1a4731]/40'
              }`}
            >
              <span className={filters.college === col.id ? 'text-[#c9a84c]' : 'text-[#1a4731]'}>{col.id}</span>
              <span className="hidden sm:inline text-[10px] opacity-80">• {col.name.replace('College of ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Additional Dropdowns & Keywords */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Year Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-[#1a4731]" />
            <span className="text-slate-500 font-medium">Year:</span>
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
          <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 font-medium">Sort By:</span>
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
            className="flex items-center space-x-1 text-slate-500 hover:text-rose-600 transition-colors px-2 py-1 font-medium"
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
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
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
