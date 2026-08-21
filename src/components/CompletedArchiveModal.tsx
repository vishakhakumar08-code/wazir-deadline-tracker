'use client';

import React, { useState, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES } from '@/lib/constants';
import { Task, Vertical } from '@/types/task';
import {
  X,
  CheckCircle2,
  Search,
  Calendar,
  Layers,
  Users,
  Clock,
  ArrowUpDown,
  ExternalLink,
  Archive,
  CheckSquare,
} from 'lucide-react';

interface CompletedArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompletedArchiveModal: React.FC<CompletedArchiveModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { tasks, setSelectedTask } = useTaskContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVertical, setSelectedVertical] = useState<Vertical | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'priority'>('recent');

  // Filter all completed tasks
  const allCompletedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'Completed');
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    return allCompletedTasks
      .filter((task) => {
        // Vertical filter
        if (selectedVertical !== 'ALL' && task.vertical !== selectedVertical) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = task.description.toLowerCase().includes(q);
          const matchesVertical = task.vertical.toLowerCase().includes(q);
          const matchesAssignees =
            task.assignees && task.assignees.some((a) => a.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDesc && !matchesVertical && !matchesAssignees) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.updated_at || a.deadline).getTime();
        const timeB = new Date(b.updated_at || b.deadline).getTime();

        if (sortBy === 'recent') {
          return timeB - timeA;
        } else if (sortBy === 'oldest') {
          return timeA - timeB;
        } else if (sortBy === 'priority') {
          const order = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return (order[b.priority] || 0) - (order[a.priority] || 0);
        }
        return 0;
      });
  }, [allCompletedTasks, selectedVertical, searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-wazir-card border-t md:border border-wazir-border rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-900/80">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-wazir-border/60 bg-slate-900/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Completed Deliverables Archive
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {allCompletedTasks.length} Total
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                All-time historical record of finished Wazir strategy &amp; consulting deliverables
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-wazir-border/40 bg-slate-950/50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archived completed deliverables..."
                className="w-full bg-slate-900 border border-wazir-border rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors min-h-[40px]"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-wazir-border rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer min-h-[40px]"
              >
                <option value="recent">Most Recent First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Highest Priority</option>
              </select>
            </div>
          </div>

          {/* Vertical Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedVertical('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedVertical === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Verticals ({allCompletedTasks.length})
            </button>

            {VERTICALS.map((v) => {
              const count = allCompletedTasks.filter((t) => t.vertical === v.id).length;
              const isSelected = selectedVertical === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVertical(v.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSelected
                      ? `${v.badge} font-bold ring-2 ring-emerald-500/40 shadow-sm`
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: v.color }} />
                  <span>{v.label}</span>
                  <span className="text-[10px] opacity-70 px-1 rounded bg-slate-950/60">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deliverables List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-300">No completed deliverables found</p>
              <p className="text-xs text-slate-500 mt-1">
                {searchQuery || selectedVertical !== 'ALL'
                  ? 'Try adjusting your search or vertical filter.'
                  : 'Deliverables marked as Completed will be permanently archived here.'}
              </p>
            </div>
          ) : (
            filteredAndSortedTasks.map((task) => {
              const vConfig = VERTICALS.find((v) => v.id === task.vertical) || VERTICALS[0];
              const pConfig = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[2];
              const completedTimeStr = task.updated_at
                ? new Date(task.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : new Date(task.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTask(task);
                    onClose();
                  }}
                  className="group bg-slate-900/70 hover:bg-slate-900 border border-wazir-border/60 hover:border-emerald-500/50 p-4 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${vConfig.badge}`}>
                        {task.vertical}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${pConfig.badge}`}>
                        {task.priority}
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed on {completedTimeStr}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors font-heading truncate">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Right Meta (Assignees & Subtasks) */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800">
                        <CheckSquare className="w-3 h-3 text-emerald-400" />
                        <span>
                          {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                        </span>
                      </div>
                    )}

                    {/* Assignee Avatars */}
                    {task.assignees && task.assignees.length > 0 ? (
                      <div className="flex -space-x-1.5">
                        {task.assignees.map((aName) => {
                          const aConfig = ASSIGNEES.find((a) => a.name === aName);
                          return (
                            <div
                              key={aName}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border border-wazir-midnight ${
                                aConfig?.avatarBg || 'bg-slate-700'
                              } ${aConfig?.textColor || 'text-white'}`}
                              title={aName}
                            >
                              {aConfig?.initials || aName.slice(0, 2).toUpperCase()}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Unassigned</span>
                    )}

                    <span className="text-xs text-sky-400 group-hover:translate-x-0.5 transition-transform hidden sm:inline">
                      View →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
