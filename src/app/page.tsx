'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Header } from '@/components/Header';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { MemberMatrix } from '@/components/MemberMatrix';
import { TaskModal } from '@/components/TaskModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { SqlSetupModal } from '@/components/SqlSetupModal';
import { ExportModal } from '@/components/ExportModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function Home() {
  const { viewMode, toast } = useTaskContext();

  const getToastIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Info className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#070c18] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pb-16">
      {/* Top Navigation */}
      <Header />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Executive Stats KPI Bar */}
        <StatsOverview />

        {/* Global Filter Bar */}
        <FilterBar />

        {/* Dynamic View Mode */}
        {viewMode === 'kanban' ? <KanbanBoard /> : <MemberMatrix />}
      </div>

      {/* Interactive Modals */}
      <TaskModal />
      <TaskDetailModal />
      <SqlSetupModal />
      <ExportModal />

      {/* Floating Real-time Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce transition-all">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs font-semibold text-white backdrop-blur-md">
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
