'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ChessQueenLogo } from '@/components/ChessQueenLogo';
import { InteractiveCalendar } from '@/components/InteractiveCalendar';
import { RetroKanbanBoard } from '@/components/RetroKanbanBoard';
import { AttendanceScreen } from '@/components/AttendanceScreen';
import { IndividualTrackerSearch } from '@/components/IndividualTrackerSearch';
import { IndividualMemberView } from '@/components/IndividualMemberView';
import { PartyCalendarScreen } from '@/components/PartyCalendarScreen';
import { RetroNewDeliverableModal } from '@/components/RetroNewDeliverableModal';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import { EditAvatarModal } from '@/components/EditAvatarModal';
import { SqlSetupModal } from '@/components/SqlSetupModal';
import { ExportModal } from '@/components/ExportModal';
import { CompletedArchiveModal } from '@/components/CompletedArchiveModal';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Database, Download } from 'lucide-react';

export default function Home() {
  const {
    currentScreen,
    toast,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    setIsSqlModalOpen,
    setIsExportModalOpen,
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
    <main className="min-h-screen bg-white text-black p-4 sm:p-6 lg:p-8 flex flex-col items-center selection:bg-blue-200">
      {/* Top Header Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-6 sm:pb-8 relative">
        {/* Top-Left Circular Royal Blue Badge with White Chess Queen Icon */}
        <ChessQueenLogo />

        {/* Home Screen Title & Subtitle (Centered) */}
        {currentScreen === 'home' && (
          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none sm:pointer-events-auto pt-2 sm:pt-3 mt-1 sm:mt-1.5">
            <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-black font-bold tracking-widest uppercase">
              WAZIR
            </h1>
            <p className="font-serif not-italic font-normal text-black text-base sm:text-xl -mt-0.5 sm:mt-0">
              keeping track
            </p>
          </div>
        )}

        {/* Top-Right Quick Utility Buttons (SQL Schema & Export) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 p-2 bg-white hover:bg-slate-100 text-black border-2 border-black font-pixel text-[10px] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            title="Export Minutes of Meeting"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">EXPORT</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSqlModalOpen(true)}
            className="p-2 bg-white hover:bg-slate-100 text-black border-2 border-black font-pixel text-[10px] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            title="Supabase Connection & Schema"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SQL</span>
          </button>
        </div>
      </header>

      {/* Main View Area with State-Based Routing */}
      <div className="w-full max-w-6xl flex-1 flex flex-col justify-start">
        {/* 1. HOME / MAIN BOARD VIEW */}
        {currentScreen === 'home' && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            {/* Left Column: Interactive Calendar + Navigation */}
            <div className="lg:col-span-4 flex justify-center lg:justify-start w-full">
              <InteractiveCalendar />
            </div>

            {/* Right Column: 3-Column Kanban Board */}
            <div className="lg:col-span-8 w-full">
              <RetroKanbanBoard />
            </div>
          </div>
        )}

        {/* 2. ATTENDANCE TRACKER VIEW */}
        {currentScreen === 'attendance' && <AttendanceScreen />}

        {/* 3. INDIVIDUAL TRACKER SEARCH VIEW */}
        {currentScreen === 'individual_search' && <IndividualTrackerSearch />}

        {/* 4. INDIVIDUAL MEMBER RESULT VIEW */}
        {currentScreen === 'individual_member' && <IndividualMemberView />}

        {/* 5. PARTY CALENDAR / MEMORIES VIEW */}
        {currentScreen === 'party_calendar' && <PartyCalendarScreen />}
      </div>

      {/* Modals & Popups */}
      <RetroNewDeliverableModal />
      <TaskDetailModal />
      <EditAvatarModal />
      <SqlSetupModal />
      <ExportModal />
      <CompletedArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
      />

      {/* Retro Toast Notifications */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white border-2 border-black shadow-[4px_4px_0px_0px_#000000] text-xs font-serif font-bold text-black max-w-[90vw]">
            {getToastIcon(toast.type)}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
