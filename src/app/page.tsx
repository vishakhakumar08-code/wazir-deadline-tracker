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
import { CompletedArchiveModal } from '@/components/CompletedArchiveModal';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Plus } from 'lucide-react';

export default function Home() {
  const { viewMode, toast, setIsCreateModalOpen, isArchiveModalOpen, setIsArchiveModalOpen } = useTaskContext();

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
    <main className="min-h-screen bg-[#070c18] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pb-20 md:pb-16">
      {/* Top Navigation */}
      <Header />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {viewMode !== 'attendance' && (
          <>
            {/* Executive Stats KPI Bar */}
            <StatsOverview />

            {/* Global Filter Bar */}
            <FilterBar />
          </>
        )}

        {/* Dynamic View Mode */}
        {viewMode === 'kanban' && <KanbanBoard />}
        {viewMode === 'matrix' && <MemberMatrix />}
        {viewMode === 'attendance' && <AttendanceTracker />}
      </div>

      {/* Mobile Floating Action Button (FAB) for "+ New Deliverable" */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-400 text-wazir-midnight shadow-2xl shadow-amber-500/40 flex items-center justify-center border-2 border-amber-300 active:scale-95 transition-transform cursor-pointer"
        aria-label="Create New Deliverable"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Interactive Modals */}
      <TaskModal />
      <TaskDetailModal />
      <SqlSetupModal />
      <ExportModal />
      <CompletedArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />

      {/* Floating Real-time Toast Notifications */}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 animate-bounce transition-all">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl text-xs font-semibold text-white backdrop-blur-md max-w-[90vw]">
            {getToastIcon(toast.type)}
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
