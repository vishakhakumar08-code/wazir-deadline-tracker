'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ViewMode } from '@/types/task';
import {
  Users,
  CalendarCheck,
  MoreHorizontal,
  Database,
  FileText,
  X,
} from 'lucide-react';

const KanbanIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M8 7v7" />
    <path d="M12 7v4" />
    <path d="M16 7v9" />
  </svg>
);

export const MobileBottomNav: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    setIsSqlModalOpen,
    setIsExportModalOpen,
  } = useTaskContext();

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    {
      id: 'kanban',
      label: 'Board',
      icon: <KanbanIcon className="w-5 h-5" />,
    },
    {
      id: 'matrix',
      label: 'Matrix',
      icon: <Users className="w-5 h-5" />,
    },
    {
      id: 'attendance',
      label: 'Attendance',
      icon: <CalendarCheck className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 py-2 px-4 flex items-center justify-around shadow-lg">
        {tabs.map((tab) => {
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setViewMode(tab.id);
                setIsMoreOpen(false);
              }}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
                isActive
                  ? 'text-blue-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          );
        })}

        {/* More Tab */}
        <button
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={`flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-xl transition-colors cursor-pointer min-h-[44px] ${
            isMoreOpen
              ? 'text-blue-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[11px] font-medium">More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer / Bottom Sheet */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full bg-white rounded-t-3xl border-t border-slate-200 p-6 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 font-heading">
                More Tools &amp; Actions
              </h3>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsSqlModalOpen(true);
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-800 font-semibold text-sm border border-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Supabase SQL Schema</p>
                  <p className="text-xs text-slate-500">View real-time database schema &amp; setup</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsExportModalOpen(true);
                  setIsMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-800 font-semibold text-sm border border-slate-100 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900">Export MoM &amp; CSV</p>
                  <p className="text-xs text-slate-500">Download formatted reports &amp; summaries</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
