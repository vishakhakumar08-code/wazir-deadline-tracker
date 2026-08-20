'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import {
  Kanban,
  Users,
  Plus,
  Database,
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Sparkles,
  Layers,
  CalendarCheck,
} from 'lucide-react';
import { ViewMode } from '@/types/task';

export const Header: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setIsCreateModalOpen,
    setIsSqlModalOpen,
    setIsExportModalOpen,
    isSupabaseConfigured,
    realtimeStatus,
    reconnectSupabase,
    lastSyncTime,
  } = useTaskContext();

  const getStatusBadge = () => {
    switch (realtimeStatus) {
      case 'SUBSCRIBED':
        return (
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/20 transition-all cursor-pointer"
            title="Real-time live sync connected via Supabase. Click to view configuration."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Wifi className="w-3.5 h-3.5" />
            <span>Supabase Live</span>
          </button>
        );
      case 'CONNECTING':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-medium">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
            <span>Connecting...</span>
          </div>
        );
      case 'LOCAL_DEMO':
      default:
        return (
          <button
            onClick={() => setIsSqlModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-all cursor-pointer group"
            title="Running in local storage sandbox. Click to connect Supabase real-time backend."
          >
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Sandbox Mode</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded ml-1 group-hover:bg-amber-500/40">
              Connect DB
            </span>
          </button>
        );
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-wazir-midnight/80 border-b border-wazir-border/60 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Club Branding */}
          <div className="flex items-center gap-4">
            <div className="relative group cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-wazir-gold via-amber-600 to-wazir-navy p-[2px] shadow-lg shadow-amber-500/10 transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-wazir-midnight rounded-[10px] flex items-center justify-center border border-amber-500/20">
                  <span className="text-xl font-black tracking-wider bg-gradient-to-br from-amber-200 via-wazir-gold to-amber-500 bg-clip-text text-transparent font-heading">
                    W
                  </span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-wazir-midnight"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-heading">
                  WAZIR
                </h1>
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-sky-500/20 text-amber-300 border border-amber-500/30">
                  Tracker
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                The Strategy &amp; Consulting Club
              </p>
            </div>
          </div>

          {/* Center: View Switcher */}
          <div className="flex items-center bg-wazir-card/90 p-1 rounded-xl border border-wazir-border/70 shadow-inner">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban Board</span>
              <span className="sm:hidden">Kanban</span>
            </button>

            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'matrix'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Member Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </button>

            <button
              onClick={() => setViewMode('attendance')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'attendance'
                  ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Attendance</span>
            </button>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Realtime Status Badge */}
            <div className="hidden md:flex items-center">
              {getStatusBadge()}
            </div>

            {/* SQL & DB Modal Button */}
            <button
              onClick={() => setIsSqlModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-wazir-card hover:bg-wazir-cardHover text-slate-300 hover:text-white border border-wazir-border text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Supabase SQL Setup & Connection"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span className="hidden lg:inline">SQL Schema</span>
            </button>

            {/* Export MoM Button */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-wazir-card hover:bg-wazir-cardHover text-slate-300 hover:text-white border border-wazir-border text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Export Meeting Summary & CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Export MoM</span>
            </button>

            {/* Create Task Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-wazir-midnight font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">New Deliverable</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
