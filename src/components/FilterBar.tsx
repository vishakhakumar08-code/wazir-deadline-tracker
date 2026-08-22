'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES } from '@/lib/constants';
import { Search, X, ChevronDown } from 'lucide-react';
import { TaskPriority } from '@/types/task';
import { SearchBar } from './SearchBar';

export const FilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters } = useTaskContext();

  const isFiltered =
    filters.vertical !== 'ALL' ||
    filters.assignee !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.urgency !== 'ALL' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="mb-6 space-y-3">
      {/* Desktop Search + Filter Row (>= md) */}
      <div className="hidden md:flex items-center justify-between gap-3 flex-wrap">
        {/* Desktop Search Input */}
        <SearchBar className="max-w-xs lg:max-w-sm" />

        {/* Filter Summary / Reset */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-red-500" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Pill Filter Row (Matching Reference Designs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {/* Assignee Filter Dropdown Pill */}
        <div className="relative shrink-0">
          <select
            value={filters.assignee}
            onChange={(e) => setFilter('assignee', e.target.value as any)}
            className={`appearance-none text-xs font-medium pl-3.5 pr-7 py-1.5 rounded-full border cursor-pointer transition-all shadow-sm ${
              filters.assignee !== 'ALL'
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <option value="ALL">All assignees</option>
            <option value="UNASSIGNED">Unassigned Only</option>
            {ASSIGNEES.map((assignee) => (
              <option key={assignee.name} value={assignee.name}>
                {assignee.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Priority Filter Dropdown Pill */}
        <div className="relative shrink-0">
          <select
            value={filters.priority}
            onChange={(e) => setFilter('priority', e.target.value as TaskPriority | 'ALL')}
            className={`appearance-none text-xs font-medium pl-3.5 pr-7 py-1.5 rounded-full border cursor-pointer transition-all shadow-sm ${
              filters.priority !== 'ALL'
                ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <option value="ALL">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} Priority
              </option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Vertical Pills */}
        {VERTICALS.map((vertical) => {
          const isSelected = filters.vertical === vertical.id;
          return (
            <button
              key={vertical.id}
              onClick={() => setFilter('vertical', isSelected ? 'ALL' : vertical.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border shadow-sm cursor-pointer ${
                isSelected
                  ? `${vertical.badge} ring-1 ring-current shadow-sm`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {vertical.label}
            </button>
          );
        })}

        {/* Mobile Reset Filter Button if active */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3 h-3 text-red-500" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
