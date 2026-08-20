'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, ATTENDANCE_STATUSES } from '@/lib/constants';
import { Assignee, AttendanceStatus, AttendanceRecord, DailyAttendanceSummary } from '@/types/task';
import {
  fetchAttendanceFromSupabase,
  upsertAttendanceToSupabase,
  bulkUpsertAttendanceToSupabase,
} from '@/lib/supabase';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  Users,
  Sparkles,
  RefreshCw,
  Edit2,
  FileSpreadsheet,
} from 'lucide-react';

export const AttendanceTracker: React.FC = () => {
  const { isSupabaseConfigured, showToast } = useTaskContext();

  // Selected date defaults to local today formatted as YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; notes?: string }>>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load attendance data for the selected date
  const loadAttendance = useCallback(async (dateStr: string) => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      const { data, error } = await fetchAttendanceFromSupabase(dateStr);
      if (error) {
        console.error('Error fetching attendance:', error);
        showToast(`Attendance error: ${error.message || 'Failed to load'}`, 'error');
      } else if (data) {
        const map: Record<string, { status: AttendanceStatus; notes?: string }> = {};
        data.forEach((row: any) => {
          map[row.member_name] = {
            status: row.status as AttendanceStatus,
            notes: row.notes || '',
          };
        });
        setAttendanceMap(map);
        setIsLoading(false);
        return;
      }
    }

    // Fallback to local storage
    if (typeof window !== 'undefined') {
      const cachedKey = `wazir_attendance_${dateStr}`;
      const cached = localStorage.getItem(cachedKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setAttendanceMap(parsed);
          setIsLoading(false);
          return;
        } catch (e) {}
      }
    }

    setAttendanceMap({});
    setIsLoading(false);
  }, [isSupabaseConfigured, showToast]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  // Persist to local backup
  useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(attendanceMap).length > 0) {
      localStorage.setItem(`wazir_attendance_${selectedDate}`, JSON.stringify(attendanceMap));
    }
  }, [attendanceMap, selectedDate]);

  // Update attendance for a single member
  const handleSetStatus = async (memberName: Assignee, newStatus: AttendanceStatus) => {
    const currentNotes = attendanceMap[memberName]?.notes || '';
    const updatedMap = {
      ...attendanceMap,
      [memberName]: { status: newStatus, notes: currentNotes },
    };
    setAttendanceMap(updatedMap);

    if (isSupabaseConfigured) {
      setIsSaving(true);
      const { error } = await upsertAttendanceToSupabase({
        member_name: memberName,
        date: selectedDate,
        status: newStatus,
        notes: currentNotes,
      });
      setIsSaving(false);

      if (error) {
        console.error('Error saving attendance:', error);
        showToast(`Failed to save attendance for ${memberName}: ${error.message}`, 'error');
      } else {
        showToast(`Marked ${memberName} as ${newStatus}`, 'success');
      }
    } else {
      showToast(`Marked ${memberName} as ${newStatus} (sandbox)`, 'info');
    }
  };

  // Bulk: Mark All Present
  const handleMarkAllPresent = async () => {
    const updatedMap: Record<string, { status: AttendanceStatus; notes?: string }> = {};
    const recordsToUpsert = ASSIGNEES.map((a) => {
      const notes = attendanceMap[a.name]?.notes || '';
      updatedMap[a.name] = { status: 'Present', notes };
      return {
        member_name: a.name,
        date: selectedDate,
        status: 'Present',
        notes,
      };
    });

    setAttendanceMap(updatedMap);

    if (isSupabaseConfigured) {
      setIsSaving(true);
      const { error } = await bulkUpsertAttendanceToSupabase(recordsToUpsert);
      setIsSaving(false);

      if (error) {
        showToast(`Failed to bulk update attendance: ${error.message}`, 'error');
      } else {
        showToast('All 10 team members marked as Present!', 'success');
      }
    } else {
      showToast('All team members marked as Present (sandbox)', 'success');
    }
  };

  // Quick Date Navigation
  const changeDateByDays = (days: number) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const formattedDateTitle = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDate]);

  // Compute Daily Attendance Summary
  const summary: DailyAttendanceSummary = useMemo(() => {
    let present = 0;
    let tardy = 0;
    let excusedTardy = 0;
    let absent = 0;
    let excusedAbsent = 0;
    let unmarked = 0;

    ASSIGNEES.forEach((assignee) => {
      const record = attendanceMap[assignee.name];
      if (!record || !record.status) {
        unmarked++;
      } else {
        switch (record.status) {
          case 'Present':
            present++;
            break;
          case 'Tardy':
            tardy++;
            break;
          case 'Excused Tardy':
            excusedTardy++;
            break;
          case 'Absent':
            absent++;
            break;
          case 'Excused Absence':
            excusedAbsent++;
            break;
        }
      }
    });

    const total = ASSIGNEES.length; // 10 members
    const attended = present + tardy + excusedTardy;
    const attendanceRate = total > 0 ? Math.round((attended / total) * 100) : 0;

    return {
      date: selectedDate,
      total,
      present,
      tardy,
      excusedTardy,
      absent,
      excusedAbsent,
      unmarked,
      attendanceRate,
    };
  }, [attendanceMap, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Date Selector Bar */}
      <div className="bg-gradient-to-r from-wazir-navy via-slate-900 to-wazir-navy p-5 rounded-2xl border border-wazir-border/70 shadow-lg">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-heading">
                Wazir Team Attendance Tracker
              </h2>
              {isSaving && (
                <span className="text-[11px] text-sky-400 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Record, audit, and monitor daily attendance across all 10 junior team members.
            </p>
          </div>

          {/* Date Picker & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => changeDateByDays(-1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-xl border border-slate-800">
              <Calendar className="w-4 h-4 text-amber-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => changeDateByDays(1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedDate(getTodayDateString())}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        {/* Date Display and Bulk Action Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-medium text-slate-300">
            Showing records for: <span className="text-amber-400 font-bold">{formattedDateTitle}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          </div>
        </div>
      </div>

      {/* Attendance KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Attendance Rate */}
        <div className="bg-wazir-card/80 p-4 rounded-2xl border border-wazir-border/70 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</p>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-2xl font-black text-white font-heading">{summary.attendanceRate}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
              style={{ width: `${summary.attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Present */}
        <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/30 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-emerald-400">Present</p>
          <p className="text-2xl font-black text-white font-heading my-1">{summary.present}</p>
          <p className="text-[10px] text-slate-400">On time</p>
        </div>

        {/* Tardy */}
        <div className="bg-amber-950/20 p-4 rounded-2xl border border-amber-500/30 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-amber-400">Tardy</p>
          <p className="text-2xl font-black text-white font-heading my-1">{summary.tardy}</p>
          <p className="text-[10px] text-slate-400">Late arrival</p>
        </div>

        {/* Excused Tardy */}
        <div className="bg-sky-950/20 p-4 rounded-2xl border border-sky-500/30 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-sky-400">Excused Tardy</p>
          <p className="text-2xl font-black text-white font-heading my-1">{summary.excusedTardy}</p>
          <p className="text-[10px] text-slate-400">Approved late</p>
        </div>

        {/* Absent */}
        <div className="bg-red-950/20 p-4 rounded-2xl border border-red-500/30 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-red-400">Absent</p>
          <p className="text-2xl font-black text-white font-heading my-1">{summary.absent}</p>
          <p className="text-[10px] text-slate-400">Unexcused</p>
        </div>

        {/* Excused Absence */}
        <div className="bg-purple-950/20 p-4 rounded-2xl border border-purple-500/30 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-purple-400">Excused Absence</p>
          <p className="text-2xl font-black text-white font-heading my-1">{summary.excusedAbsent}</p>
          <p className="text-[10px] text-slate-400">Approved leave</p>
        </div>
      </div>

      {/* Team Attendance Table / Cards */}
      <div className="bg-wazir-card/85 rounded-2xl border border-wazir-border/70 overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-wazir-border/60 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-heading">
              Junior Team Members (10 Members)
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {10 - summary.unmarked} / 10 marked
          </span>
        </div>

        <div className="divide-y divide-wazir-border/40">
          {ASSIGNEES.map((assignee) => {
            const currentRecord = attendanceMap[assignee.name];
            const currentStatus = currentRecord?.status;

            return (
              <div
                key={assignee.name}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
              >
                {/* Left: Member Identity (No position title) */}
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border border-slate-700 shadow-sm shrink-0 ${assignee.avatarBg} ${assignee.textColor}`}
                  >
                    {assignee.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-heading">
                      {assignee.name}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {currentStatus ? (
                        <span className="text-slate-300 font-medium">Status: {currentStatus}</span>
                      ) : (
                        <span className="text-amber-400/80 italic">Not marked yet</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right: Status Selector Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 flex-1 max-w-2xl">
                  {ATTENDANCE_STATUSES.map((statusItem) => {
                    const isSelected = currentStatus === statusItem.id;
                    return (
                      <button
                        key={statusItem.id}
                        onClick={() => handleSetStatus(assignee.name, statusItem.id)}
                        className={`py-2.5 px-2 sm:px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border cursor-pointer min-h-[44px] ${
                          isSelected
                            ? `${statusItem.buttonActive} ring-2 ring-white/20`
                            : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700'
                        }`}
                        title={statusItem.description}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isSelected ? 'bg-white' : statusItem.dotColor
                          }`}
                        />
                        <span className="truncate">{statusItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
