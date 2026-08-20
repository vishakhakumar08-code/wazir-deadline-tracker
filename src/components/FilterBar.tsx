'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES } from '@/lib/constants';
import { Search, X, Filter, User, AlertTriangle, Layers } from 'lucide-react';
import { Vertical, Assignee, TaskPriority } from '@/types/task';

export const FilterBar: React.FC = () => {
  const { filters, setFilter, resetFilters, tasks, filteredTasks } = useTaskContext();

  const isFiltered =
    filters.vertical !== 'ALL' ||
    filters.assignee !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.urgency !== 'ALL' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-wazir-card/70 border border-wazir-border/60 rounded-2xl p-3.5 sm:p-4 mb-6 shadow-sm">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            placeholder="Search deliverables, verticals, or members..."
            className="w-full bg-slate-900/80 border border-wazir-border rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilter('searchQuery', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Assignee Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.assignee}
              onChange={(e) => setFilter('assignee', e.target.value as any)}
              className="w-full sm:w-auto appearance-none bg-slate-900/80 border border-wazir-border rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 hover:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Assignees (10)</option>
              <option value="UNASSIGNED">⚠️ Unassigned Only</option>
              {ASSIGNEES.map((assignee) => (
                <option key={assignee.name} value={assignee.name}>
                  {assignee.name} ({assignee.role})
                </option>
              ))}
            </select>
            <User className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Priority Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.priority}
              onChange={(e) => setFilter('priority', e.target.value as TaskPriority | 'ALL')}
              className="w-full sm:w-auto appearance-none bg-slate-900/80 border border-wazir-border rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 hover:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label} Priority
                </option>
              ))}
            </select>
            <AlertTriangle className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Deadline Urgency Filter Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={filters.urgency}
              onChange={(e) => setFilter('urgency', e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-900/80 border border-wazir-border rounded-xl px-3 py-2 pr-8 text-xs font-medium text-slate-300 hover:text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="ALL">All Deadlines</option>
              <option value="overdue">🔴 Overdue Only</option>
              <option value="due_soon">🟡 Due in 24 Hours</option>
              <option value="upcoming">🟢 Later Deadlines</option>
            </select>
            <Filter className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Vertical Chips Filter Bar */}
      <div className="mt-3.5 pt-3 border-t border-wazir-border/40 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          Vertical:
        </span>

        <button
          onClick={() => setFilter('vertical', 'ALL')}
          className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
            filters.vertical === 'ALL'
              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20 font-semibold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
          }`}
        >
          All Verticals ({tasks.length})
        </button>

        {VERTICALS.map((vertical) => {
          const count = tasks.filter((t) => t.vertical === vertical.id).length;
          const isSelected = filters.vertical === vertical.id;
          return (
            <button
              key={vertical.id}
              onClick={() => setFilter('vertical', isSelected ? 'ALL' : vertical.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                isSelected
                  ? `${vertical.badge} font-bold ring-2 ring-sky-500/50 shadow-sm`
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 border border-slate-700/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: vertical.color }}
              />
              <span>{vertical.label}</span>
              <span className="text-[10px] opacity-70 px-1 py-0.2 rounded bg-slate-900/50">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
