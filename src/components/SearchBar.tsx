'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search deliverables, verticals, or members...',
}) => {
  const { filters, setFilter } = useTaskContext();

  return (
    <div className={`relative w-full ${className}`}>
      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={filters.searchQuery}
        onChange={(e) => setFilter('searchQuery', e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-600 rounded-full pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
      />
      {filters.searchQuery && (
        <button
          onClick={() => setFilter('searchQuery', '')}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
