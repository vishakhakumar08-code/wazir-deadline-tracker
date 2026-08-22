'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { StatsOverview } from '@/components/StatsOverview';
import { FilterBar } from '@/components/FilterBar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { MemberMatrix } from '@/components/MemberMatrix';
import { AttendanceTracker } from '@/components/AttendanceTracker';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { TaskModal } from '@/components/TaskModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { SqlSetupModal } from '@/components/SqlSetupModal';
import { ExportModal } from '@/components/ExportModal';
import { CompletedArchiveModal } from '@/components/CompletedArchiveModal';
import { EditAvatarModal } from '@/components/EditAvatarModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Plus } from 'lucide-react';

export default function Home() {
  const {
    viewMode,
    toast,
    setIsCreateModalOpen,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
  } = useTaskContext();

  const getToastIcon = (type?: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'warning':
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-0 md:p-6 lg:p-8 flex justify-center items-start">
      {/* Central Modern Light Dashboard Container */}
      <div className="w-full max-w-7xl bg-white rounded-none md:rounded-3xl md:border md:border-slate-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[calc(100vh-64px)]">
        {/* Desktop Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {/* Top Header */}
          <Header />

          {/* Mobile Global Search Bar (< md) */}
          {viewMode !== 'attendance' && (
            <div className="md:hidden mb-3.5">
              <SearchBar placeholder="Search deliverables, verticals, or members..." />
            </div>
          )}

          {/* KPI Stat Cards and Filter Bar (shown on Kanban and Matrix views) */}
          {viewMode !== 'attendance' && (
            <>
              <StatsOverview />
              <FilterBar />
            </>
          )}

          {/* Active View Mode */}
          {viewMode === 'kanban' && <KanbanBoard />}
          {viewMode === 'matrix' && <MemberMatrix />}
          {viewMode === 'attendance' && <AttendanceTracker />}
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) for "+ New Deliverable" */}
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="md:hidden fixed bottom-20 right-5 z-40 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/40 flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
        aria-label="Create New Deliverable"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Modals & Dialogs */}
      <TaskModal />
      <TaskDetailModal />
      <SqlSetupModal />
      <ExportModal />
      <CompletedArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />
      <EditAvatarModal />

      {/* Toast Notifications */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 right-4 sm:right-8 z-50 animate-bounce transition-all">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-200 shadow-xl text-xs font-semibold text-slate-800 backdrop-blur-md max-w-[90vw]">
            {getToastIcon(toast.type)}
            <span className="truncate">{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
