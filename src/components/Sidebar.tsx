'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ViewMode } from '@/types/task';
import {
  LayoutKanban,
  Users,
  CalendarCheck,
  Database,
  FileText,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setIsSqlModalOpen,
    setIsExportModalOpen,
  } = useTaskContext();

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'kanban',
      label: 'Kanban board',
      icon: <LayoutKanban className="w-4 h-4" />,
    },
    {
      id: 'matrix',
      label: 'Member matrix',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CalendarCheck className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-60 min-w-[220px] max-w-[240px] border-r border-slate-100 p-6 bg-white shrink-0">
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-sm">
            W
          </div>
          <span className="text-lg font-bold text-slate-900 font-heading">
            Wazir
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setViewMode(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <span className={isActive ? 'text-blue-600' : 'text-slate-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Tools at Bottom */}
      <div className="pt-6 border-t border-slate-100 space-y-1">
        <button
          onClick={() => setIsSqlModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>SQL schema</span>
        </button>

        <button
          onClick={() => setIsExportModalOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <FileText className="w-4 h-4 text-slate-400" />
          <span>Export MoM</span>
        </button>
      </div>
    </aside>
  );
};
