'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, ATTENDANCE_STATUSES } from '@/lib/constants';
import { Assignee, AttendanceStatus, AttendanceRecord } from '@/types/task';
import {
  fetchAttendanceForDate,
  upsertAttendanceRecord,
  subscribeToAttendanceChanges,
} from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Calendar, History, X } from 'lucide-react';

export const AttendanceScreen: React.FC = () => {
  const { showToast, isSupabaseConfigured } = useTaskContext();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Alphabetically sorted roster of members (as shown in reference design)
  const sortedMembers = React.useMemo(() => {
    return [...ASSIGNEES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Fetch Attendance for Date
  const loadAttendance = useCallback(async (dateStr: string) => {
    if (isSupabaseConfigured) {
      const { data, error } = await fetchAttendanceForDate(dateStr);
      if (data) {
        const map: Record<string, AttendanceRecord> = {};
        data.forEach((rec) => {
          map[rec.member_name] = rec;
        });
        setAttendanceMap(map);
        return;
      }
    }

    // Local fallback
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(`wazir_attendance_${dateStr}`);
      if (cached) {
        try {
          setAttendanceMap(JSON.parse(cached));
          return;
        } catch (e) {}
      }
    }

    setAttendanceMap({});
  }, [isSupabaseConfigured]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  // Realtime attendance listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = subscribeToAttendanceChanges(() => {
      loadAttendance(selectedDate);
    });
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [isSupabaseConfigured, selectedDate, loadAttendance]);

  const handleSetStatus = async (memberName: Assignee, newStatus: AttendanceStatus) => {
    const existing = attendanceMap[memberName];

    // Optimistic Update
    const updatedRec: AttendanceRecord = {
      ...existing,
      member_name: memberName,
      date: selectedDate,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    const nextMap = { ...attendanceMap, [memberName]: updatedRec };
    setAttendanceMap(nextMap);

    if (typeof window !== 'undefined') {
      localStorage.setItem(`wazir_attendance_${selectedDate}`, JSON.stringify(nextMap));
    }

    // Supabase Sync
    if (isSupabaseConfigured) {
      const { error } = await upsertAttendanceRecord({
        member_name: memberName,
        date: selectedDate,
        status: newStatus,
      });

      if (error) {
        console.error('[Supabase attendance upsert error]:', error);
      }
    }

    showToast(`Marked ${memberName} as ${newStatus}`, 'success');
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl mx-auto flex flex-col items-center space-y-6 pb-12">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="font-pixel text-xl sm:text-3xl text-black tracking-widest font-bold">
          ATTENDANCE TRACKER
        </h1>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center gap-3 bg-white border-2 border-black p-1.5 shadow-[3px_3px_0px_0px_#000000]">
        <button
          type="button"
          onClick={() => changeDate(-1)}
          className="p-1 hover:bg-slate-100 text-black border border-black font-pixel text-xs cursor-pointer"
          title="Previous Day"
          aria-label="Previous Day"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 px-2 font-serif text-sm sm:text-base font-bold text-black">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent font-serif text-sm sm:text-base font-bold cursor-pointer focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => changeDate(1)}
          className="p-1 hover:bg-slate-100 text-black border border-black font-pixel text-xs cursor-pointer"
          title="Next Day"
          aria-label="Next Day"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Roster Table with Horizontal Scroll for Full Button Visibility */}
      <div className="w-full overflow-x-auto pb-2">
        <div className="min-w-[720px] bg-white border-2 md:border-[3px] border-black shadow-[5px_5px_0px_0px_#000000] p-4 sm:p-6 space-y-4">
          {sortedMembers.map((member) => {
            const activeStatus = attendanceMap[member.name]?.status;

            return (
              <div
                key={member.name}
                className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 last:border-b-0 last:pb-0"
              >
                {/* Member Name in Pixel Font */}
                <div className="min-w-[150px] shrink-0">
                  <span className="font-pixel text-xs sm:text-sm text-black font-bold tracking-wider uppercase">
                    {member.name}
                  </span>
                </div>

                {/* 5 Attendance Status Options - Full Text without Truncation */}
                <div className="grid grid-cols-5 gap-2 flex-1">
                  {ATTENDANCE_STATUSES.map((statusItem) => {
                    const isSelected = activeStatus === statusItem.id;

                    return (
                      <button
                        key={statusItem.id}
                        type="button"
                        onClick={() => handleSetStatus(member.name, statusItem.id)}
                        className={`py-2 px-2 font-pixel text-[9px] sm:text-[10px] font-bold border-2 border-black transition-all cursor-pointer text-center whitespace-nowrap ${
                          isSelected
                            ? `${statusItem.activeBg} ${statusItem.activeText} shadow-[2px_2px_0px_0px_#000000]`
                            : 'bg-black text-white hover:bg-slate-800'
                        }`}
                        title={`${statusItem.label} - ${statusItem.description}`}
                      >
                        {statusItem.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Yellow "ATTENDANCE HISTORY" Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setShowHistoryModal(true)}
          className="bg-[#FDE047] text-black border-2 border-black font-pixel text-xs py-2.5 px-8 shadow-[3px_3px_0px_0px_#000000] hover:bg-[#FACC15] active:translate-x-0.5 active:translate-y-0.5 transition-all font-bold cursor-pointer tracking-wider"
        >
          ATTENDANCE HISTORY
        </button>
      </div>

      {/* Attendance History Summary Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-pixel text-sm font-bold text-black">
                ATTENDANCE LOG: {selectedDate}
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-6 h-6 border-2 border-black bg-slate-100 hover:bg-red-500 hover:text-white font-pixel text-xs flex items-center justify-center cursor-pointer"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {sortedMembers.map((m) => {
                const rec = attendanceMap[m.name];
                return (
                  <div
                    key={m.name}
                    className="flex items-center justify-between p-2 border border-slate-300 font-serif text-sm"
                  >
                    <span className="font-bold">{m.name}</span>
                    <span className="font-pixel text-[10px] px-2 py-0.5 border border-black bg-slate-100">
                      {rec?.status || 'UNMARKED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
