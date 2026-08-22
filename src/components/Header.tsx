'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Plus, Bell, Radio } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    viewMode,
    realtimeStatus,
    setIsCreateModalOpen,
    showToast,
  } = useTaskContext();

  const getTitle = () => {
    switch (viewMode) {
      case 'matrix':
        return 'Member matrix';
      case 'attendance':
        return 'Attendance tracker';
      default:
        return 'Deliverable tracker';
    }
  };

  const isConnected = realtimeStatus === 'SUBSCRIBED' || realtimeStatus === 'LOCAL_DEMO';

  return (
    <>
      {/* Mobile Top App Bar (< md) - Royal Blue Header */}
      <header className="md:hidden bg-blue-600 text-white px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 text-white font-black flex items-center justify-center text-sm">
            W
          </div>
          <h1 className="text-lg font-bold tracking-tight font-heading">
            Wazir
          </h1>
        </div>

        <button
          onClick={() => showToast('Live sync active and connected', 'info')}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-300 ring-2 ring-blue-600" />
        </button>
      </header>

      {/* Desktop Main Content Top Header (>= md) */}
      <div className="hidden md:flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading tracking-tight">
            {getTitle()}
          </h1>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span>
              {isConnected ? 'Live sync connected' : 'Connecting to live sync...'}
            </span>
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New deliverable</span>
        </button>
      </div>
    </>
  );
};
