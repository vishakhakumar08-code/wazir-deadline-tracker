'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, ATTENDANCE_STATUSES } from '@/lib/constants';
import { Assignee, AttendanceStatus, AttendanceRecord } from '@/types/task';
import {
  fetchAttendanceForDate,
  fetchAllAttendanceRecords,
  upsertAttendanceRecord,
  subscribeToAttendanceChanges,
} from '@/lib/supabase';
import { ChevronLeft, ChevronRight, Calendar, History, X } from 'lucide-react';

interface MemberCumulativeAttendance {
  total: number;
  present: number;
  excusedTardy: number;
  tardy: number;
  excusedAbsence: number;
  absence: number;
  presentPct: number;
  excusedTardyPct: number;
  tardyPct: number;
  excusedAbsencePct: number;
  absencePct: number;
}

export const AttendanceScreen: React.FC = () => {
  const { showToast, isSupabaseConfigured } = useTaskContext();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [allHistoryRecords, setAllHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Alphabetically sorted roster of members (as shown in reference design)
  const sortedMembers = useMemo(() => {
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

  // Fetch All Attendance for Cumulative History
  const loadAllHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    if (isSupabaseConfigured) {
      const { data } = await fetchAllAttendanceRecords();
      if (data && Array.isArray(data)) {
        setAllHistoryRecords(data);
        setIsLoadingHistory(false);
        return;
      }
    }

    // Local fallback: collect from all local storage keys starting with wazir_attendance_
    if (typeof window !== 'undefined') {
      const records: AttendanceRecord[] = [];
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('wazir_attendance_')) {
            const parsed = JSON.parse(localStorage.getItem(key) || '{}');
            Object.values(parsed).forEach((rec: any) => {
              if (rec && rec.member_name && rec.status) {
                records.push(rec);
              }
            });
          }
        }
      } catch (e) {}
      setAllHistoryRecords(records);
    }
    setIsLoadingHistory(false);
  }, [isSupabaseConfigured]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  useEffect(() => {
    if (showHistoryModal) {
      loadAllHistory();
    }
  }, [showHistoryModal, loadAllHistory]);

  // Realtime attendance listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = subscribeToAttendanceChanges(() => {
      loadAttendance(selectedDate);
      if (showHistoryModal) {
        loadAllHistory();
      }
    });
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [isSupabaseConfigured, selectedDate, loadAttendance, loadAllHistory, showHistoryModal]);

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

  // Cumulative breakdown for all 10 members
  const memberCumulativeStats = useMemo(() => {
    const map: Record<string, MemberCumulativeAttendance> = {};

    sortedMembers.forEach((m) => {
      const memberRecords = allHistoryRecords.filter(
        (r) => r.member_name.toLowerCase() === m.name.toLowerCase()
      );

      let present = 0;
      let excusedTardy = 0;
      let tardy = 0;
      let excusedAbsence = 0;
      let absence = 0;

      memberRecords.forEach((r) => {
        switch (r.status) {
          case 'Present':
            present++;
            break;
          case 'Excused Tardy':
            excusedTardy++;
            break;
          case 'Tardy':
            tardy++;
            break;
          case 'Excused Absence':
            excusedAbsence++;
            break;
          case 'Absent':
            absence++;
            break;
        }
      });

      const total = present + excusedTardy + tardy + excusedAbsence + absence;

      if (total > 0) {
        const presentPct = Math.round((present / total) * 100);
        const excusedTardyPct = Math.round((excusedTardy / total) * 100);
        const tardyPct = Math.round((tardy / total) * 100);
        const excusedAbsencePct = Math.round((excusedAbsence / total) * 100);
        const absencePct = Math.max(0, 100 - (presentPct + excusedTardyPct + tardyPct + excusedAbsencePct));

        map[m.name] = {
          total,
          present,
          excusedTardy,
          tardy,
          excusedAbsence,
          absence,
          presentPct,
          excusedTardyPct,
          tardyPct,
          excusedAbsencePct,
          absencePct,
        };
      } else {
        map[m.name] = {
          total: 0,
          present: 0,
          excusedTardy: 0,
          tardy: 0,
          excusedAbsence: 0,
          absence: 0,
          presentPct: 0,
          excusedTardyPct: 0,
          tardyPct: 0,
          excusedAbsencePct: 0,
          absencePct: 0,
        };
      }
    });

    return map;
  }, [sortedMembers, allHistoryRecords]);

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

      {/* Redesigned All-Member Attendance History Summary Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white border-2 md:border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden max-h-[90vh] flex flex-col">
            {/* Top Bar */}
            <div className="bg-[#CBD5E1] border-b-2 border-black px-4 py-2 flex items-center justify-between font-pixel text-xs text-black font-bold shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-black inline-block" />
                <span className="tracking-wider">ATTENDANCE HISTORY: ALL MEMBERS</span>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-6 h-6 border-2 border-black bg-white hover:bg-red-500 hover:text-white font-pixel text-xs flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {/* Legend Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-pixel p-3 bg-slate-50 border border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#16A34A] border border-black inline-block" />
                  <span>Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#86EFAC] border border-black inline-block" />
                  <span>Excused Tardy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#FACC15] border border-black inline-block" />
                  <span>Tardy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#FB923C] border border-black inline-block" />
                  <span>Excused Absence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-[#DC2626] border border-black inline-block" />
                  <span>Absence</span>
                </div>
              </div>

              {/* Members Segmented Bars List */}
              <div className="space-y-3 pt-1">
                {sortedMembers.map((member) => {
                  const stats = memberCumulativeStats[member.name];

                  return (
                    <div
                      key={member.name}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                    >
                      {/* Member Name */}
                      <div className="w-32 shrink-0">
                        <span className="font-pixel text-xs text-black font-bold uppercase tracking-wider">
                          {member.name}
                        </span>
                      </div>

                      {/* Segmented Horizontal Bar or Empty Placeholder */}
                      <div className="flex-1 min-w-0">
                        {stats && stats.total > 0 ? (
                          <div className="w-full h-7 flex border-2 border-black shadow-[2px_2px_0px_0px_#000000] overflow-hidden">
                            {stats.presentPct > 0 && (
                              <div
                                style={{ width: `${stats.presentPct}%` }}
                                className="bg-[#16A34A] h-full flex items-center justify-center text-white font-pixel text-[9px] truncate"
                                title={`Present: ${stats.presentPct}% (${stats.present} logs)`}
                              >
                                {stats.presentPct >= 10 ? `${stats.presentPct}%` : ''}
                              </div>
                            )}

                            {stats.excusedTardyPct > 0 && (
                              <div
                                style={{ width: `${stats.excusedTardyPct}%` }}
                                className="bg-[#86EFAC] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
                                title={`Excused Tardy: ${stats.excusedTardyPct}% (${stats.excusedTardy} logs)`}
                              >
                                {stats.excusedTardyPct >= 10 ? `${stats.excusedTardyPct}%` : ''}
                              </div>
                            )}

                            {stats.tardyPct > 0 && (
                              <div
                                style={{ width: `${stats.tardyPct}%` }}
                                className="bg-[#FACC15] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
                                title={`Tardy: ${stats.tardyPct}% (${stats.tardy} logs)`}
                              >
                                {stats.tardyPct >= 10 ? `${stats.tardyPct}%` : ''}
                              </div>
                            )}

                            {stats.excusedAbsencePct > 0 && (
                              <div
                                style={{ width: `${stats.excusedAbsencePct}%` }}
                                className="bg-[#FB923C] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
                                title={`Excused Absence: ${stats.excusedAbsencePct}% (${stats.excusedAbsence} logs)`}
                              >
                                {stats.excusedAbsencePct >= 10 ? `${stats.excusedAbsencePct}%` : ''}
                              </div>
                            )}

                            {stats.absencePct > 0 && (
                              <div
                                style={{ width: `${stats.absencePct}%` }}
                                className="bg-[#DC2626] h-full flex items-center justify-center text-white font-pixel text-[9px] truncate"
                                title={`Absence: ${stats.absencePct}% (${stats.absence} logs)`}
                              >
                                {stats.absencePct >= 10 ? `${stats.absencePct}%` : ''}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-7 bg-slate-100 border border-slate-300 flex items-center justify-center font-serif italic text-xs text-slate-400">
                            No attendance logs recorded yet
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Close Button */}
              <div className="pt-3 text-right">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="bg-black text-white font-pixel text-xs py-2.5 px-6 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-slate-800 cursor-pointer font-bold tracking-wider"
                >
                  CLOSE [X]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
