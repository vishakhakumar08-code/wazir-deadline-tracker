'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES } from '@/lib/constants';
import { Search, X, ChevronDown } from 'lucide-react';
import { Vertical, Assignee, TaskPriority } from '@/types/task';

export const FilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters, tasks } = useTaskContext();

  const isFiltered =
    filters.vertical !== 'ALL' ||
    filters.assignee !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.urgency !== 'ALL' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="mb-6 space-y-3">
      {/* Search Bar (Optional collapsible / inline) */}
      {filters.searchQuery && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            placeholder="Search deliverables, verticals, or members..."
            className="w-full bg-white border border-slate-200 rounded-full pl-10 pr-9 py-1.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
          />
          <button
            onClick={() => setFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all border shadow-sm cursor-pointer ${
                isSelected
                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {vertical.label}
            </button>
          );
        })}

        {/* Reset Filter Button if active */}
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-3 h-3 text-red-500" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
