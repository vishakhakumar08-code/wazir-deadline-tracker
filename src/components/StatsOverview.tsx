'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { AlertCircle, Clock, CheckCircle2, TrendingUp, Zap, Sparkles } from 'lucide-react';

export const StatsOverview: React.FC = () => {
  const { stats, filters, setFilter } = useTaskContext();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Overdue Deliverables */}
      <div
        onClick={() => setFilter('urgency', filters.urgency === 'overdue' ? 'ALL' : 'overdue')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.urgency === 'overdue'
            ? 'bg-red-950/40 border-red-500/80 shadow-lg shadow-red-500/10'
            : 'bg-wazir-card/70 hover:bg-wazir-card border-wazir-border/60 hover:border-red-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400/90 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                {stats.overdue > 0 && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${stats.overdue > 0 ? 'bg-red-500' : 'bg-slate-500'}`}></span>
              </span>
              Overdue
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {stats.overdue}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Requires immediate attention</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-red-500/40 group-hover:bg-red-500 transition-colors" />
      </div>

      {/* 2. Due in 24 Hours */}
      <div
        onClick={() => setFilter('urgency', filters.urgency === 'due_soon' ? 'ALL' : 'due_soon')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.urgency === 'due_soon'
            ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10'
            : 'bg-wazir-card/70 hover:bg-wazir-card border-wazir-border/60 hover:border-amber-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
              Due in 24 hrs
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {stats.due24h}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span>Upcoming milestone deadlines</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-amber-500/40 group-hover:bg-amber-500 transition-colors" />
      </div>

      {/* 3. Active Pipeline */}
      <div
        onClick={() => setFilter('status', filters.status === 'In Progress' ? 'ALL' : 'In Progress')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.status === 'In Progress'
            ? 'bg-sky-950/40 border-sky-500/80 shadow-lg shadow-sky-500/10'
            : 'bg-wazir-card/70 hover:bg-wazir-card border-wazir-border/60 hover:border-sky-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-400/90 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Active Workload
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
              {stats.inProgress + stats.inReview}
            </h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>{stats.inProgress} in progress · {stats.inReview} in review</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-sky-500/40 group-hover:bg-sky-500 transition-colors" />
      </div>

      {/* 4. Completion Rate */}
      <div
        onClick={() => setFilter('status', filters.status === 'Completed' ? 'ALL' : 'Completed')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.status === 'Completed'
            ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
            : 'bg-wazir-card/70 hover:bg-wazir-card border-wazir-border/60 hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Completed
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white font-heading">
                {stats.completionRate}%
              </h3>
              <span className="text-xs text-slate-400">({stats.completed}/{stats.total})</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-emerald-500/40 group-hover:bg-emerald-500 transition-colors" />
      </div>
    </div>
  );
};
