'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';

export const StatsOverview: React.FC = () => {
  const { stats, filters, setFilter } = useTaskContext();

  const activeCount = stats.total - stats.completed;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Overdue Deliverables */}
      <div
        onClick={() => setFilter('urgency', filters.urgency === 'overdue' ? 'ALL' : 'overdue')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.urgency === 'overdue'
            ? 'bg-red-100/80 border-red-300 ring-2 ring-red-400/40 shadow-sm'
            : 'bg-red-50/80 hover:bg-red-100/60 border-red-100 hover:border-red-200'
        }`}
      >
        <p className="text-xs font-semibold text-red-700/90">
          Overdue
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-red-900 font-heading mt-1">
          {stats.overdue}
        </h3>
      </div>

      {/* 2. Due in 24 Hours */}
      <div
        onClick={() => setFilter('urgency', filters.urgency === 'due_soon' ? 'ALL' : 'due_soon')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.urgency === 'due_soon'
            ? 'bg-amber-100/80 border-amber-300 ring-2 ring-amber-400/40 shadow-sm'
            : 'bg-amber-50/80 hover:bg-amber-100/60 border-amber-100 hover:border-amber-200'
        }`}
      >
        <p className="text-xs font-semibold text-amber-700/90">
          Due 24 hrs
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-amber-900 font-heading mt-1">
          {stats.due24h}
        </h3>
      </div>

      {/* 3. Active Workload */}
      <div
        onClick={() => setFilter('status', filters.status === 'Completed' ? 'ALL' : 'ALL')}
        className="group relative overflow-hidden rounded-2xl p-4 sm:p-5 border bg-blue-50/80 hover:bg-blue-100/60 border-blue-100 hover:border-blue-200 transition-all cursor-pointer"
      >
        <p className="text-xs font-semibold text-blue-700/90">
          Active
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-blue-900 font-heading mt-1">
          {activeCount}
        </h3>
      </div>

      {/* 4. Completed Rate */}
      <div
        onClick={() => setFilter('status', filters.status === 'Completed' ? 'ALL' : 'Completed')}
        className={`group relative overflow-hidden rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer ${
          filters.status === 'Completed'
            ? 'bg-emerald-100/80 border-emerald-300 ring-2 ring-emerald-400/40 shadow-sm'
            : 'bg-emerald-50/80 hover:bg-emerald-100/60 border-emerald-100 hover:border-emerald-200'
        }`}
      >
        <p className="text-xs font-semibold text-emerald-700/90">
          Completed
        </p>
        <h3 className="text-2xl sm:text-3xl font-black text-emerald-900 font-heading mt-1">
          {stats.completionRate}%
        </h3>
      </div>
    </div>
  );
};
