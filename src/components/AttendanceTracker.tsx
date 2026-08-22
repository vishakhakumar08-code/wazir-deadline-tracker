'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, ATTENDANCE_STATUSES } from '@/lib/constants';
import {
  Assignee,
  AttendanceStatus,
  AttendanceRecord,
  DailyAttendanceSummary,
} from '@/types/task';
import {
  getSupabaseCredentials,
  fetchAttendanceForDate,
  upsertAttendanceRecord,
  subscribeToAttendanceChanges,
} from '@/lib/supabase';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserX,
  ShieldAlert,
  Percent,
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';
import { MemberAvatar } from './MemberAvatar';

export const AttendanceTracker: React.FC = () => {
  const { showToast, isSupabaseConfigured } = useTaskContext();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadAttendance = useCallback(async (date: string) => {
    setIsLoading(true);
    const { data, error } = await fetchAttendanceForDate(date);
    if (error) {
      console.error('[Attendance fetch error]:', error);
      showToast(`Attendance load: ${error.message || 'Failed to fetch'}`, 'error');
    }

    const map: Record<string, AttendanceRecord> = {};
    if (data && Array.isArray(data)) {
      data.forEach((rec) => {
        map[rec.member_name] = rec;
      });
    }
    setAttendanceMap(map);
    setIsLoading(false);
  }, [showToast]);

  useEffect(() => {
    loadAttendance(selectedDate);
  }, [selectedDate, loadAttendance]);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) return;

    const channel = subscribeToAttendanceChanges(
      selectedDate,
      (record) => {
        setAttendanceMap((prev) => ({
          ...prev,
          [record.member_name]: record,
        }));
      },
      (record) => {
        setAttendanceMap((prev) => ({
          ...prev,
          [record.member_name]: record,
        }));
      }
    );

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [selectedDate]);

  const handleSetStatus = async (memberName: Assignee, status: AttendanceStatus) => {
    const existing = attendanceMap[memberName];
    const optimisticRecord: AttendanceRecord = {
      ...existing,
      member_name: memberName,
      date: selectedDate,
      status,
      updated_at: new Date().toISOString(),
    };

    setAttendanceMap((prev) => ({
      ...prev,
      [memberName]: optimisticRecord,
    }));

    setIsSaving(true);
    const { error } = await upsertAttendanceRecord({
      member_name: memberName,
      date: selectedDate,
      status,
    });

    setIsSaving(false);
    if (error) {
      console.error('[Attendance save error]:', error);
      showToast(`Failed to save attendance: ${error.message || 'Error'}`, 'error');
    } else {
      showToast(`Marked ${memberName} as ${status}`, 'success');
    }
  };

  const handleMarkAllPresent = async () => {
    const updates: Promise<any>[] = [];
    const newMap = { ...attendanceMap };

    ASSIGNEES.forEach((a) => {
      newMap[a.name] = {
        member_name: a.name,
        date: selectedDate,
        status: 'Present',
        updated_at: new Date().toISOString(),
      };
      updates.push(
        upsertAttendanceRecord({
          member_name: a.name,
          date: selectedDate,
          status: 'Present',
        })
      );
    });

    setAttendanceMap(newMap);
    setIsSaving(true);
    await Promise.all(updates);
    setIsSaving(false);
    showToast('All 10 junior members marked Present!', 'success');
  };

  const changeDateByDays = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const setDateToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const summary: DailyAttendanceSummary = useMemo(() => {
    const total = ASSIGNEES.length;
    let present = 0;
    let tardy = 0;
    let excusedTardy = 0;
    let absent = 0;
    let excusedAbsent = 0;
    let unmarked = 0;

    ASSIGNEES.forEach((a) => {
      const rec = attendanceMap[a.name];
      if (!rec || !rec.status) {
        unmarked++;
      } else {
        switch (rec.status) {
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

    const attendingCount = present + tardy + excusedTardy;
    const markedCount = total - unmarked;
    const rate = markedCount > 0 ? Math.round((attendingCount / total) * 100) : 0;

    return {
      date: selectedDate,
      total,
      present,
      tardy,
      excusedTardy,
      absent,
      excusedAbsent,
      unmarked,
      attendanceRate: rate,
    };
  }, [attendanceMap, selectedDate]);

  const formattedDateTitle = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, [selectedDate]);

  const isToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate === today;
  }, [selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Header & Date Navigation Card */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Junior Team Attendance Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Record daily meeting attendance, check-ins, leaves, and track club participation rate.
            </p>
          </div>

          {/* Date Picker Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative px-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs sm:text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {!isToday && (
              <button
                onClick={setDateToToday}
                className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
              >
                Today
              </button>
            )}

            <button
              onClick={handleMarkAllPresent}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ml-auto md:ml-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark All Present</span>
            </button>
          </div>
        </div>

        {/* Selected Date Callout */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold text-slate-900">
            {formattedDateTitle}
          </span>
          <span className="text-[11px] text-slate-500">
            {summary.total - summary.unmarked} of {summary.total} members recorded
          </span>
        </div>
      </div>

      {/* Summary KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Attendance Rate */}
        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-emerald-700">Attendance Rate</p>
          <p className="text-2xl font-black text-emerald-900 font-heading my-1">{summary.attendanceRate}%</p>
          <p className="text-[10px] text-emerald-700">
            {summary.present + summary.tardy + summary.excusedTardy} of {summary.total} attended
          </p>
        </div>

        {/* Present */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-emerald-700">Present</p>
          <p className="text-2xl font-black text-emerald-900 font-heading my-1">{summary.present}</p>
          <p className="text-[10px] text-emerald-600">On time</p>
        </div>

        {/* Tardy */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-amber-700">Tardy</p>
          <p className="text-2xl font-black text-amber-900 font-heading my-1">{summary.tardy}</p>
          <p className="text-[10px] text-amber-700">Late unexcused</p>
        </div>

        {/* Excused Tardy */}
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-blue-700">Excused Tardy</p>
          <p className="text-2xl font-black text-blue-900 font-heading my-1">{summary.excusedTardy}</p>
          <p className="text-[10px] text-blue-700">Approved late</p>
        </div>

        {/* Absent */}
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-red-700">Absent</p>
          <p className="text-2xl font-black text-red-900 font-heading my-1">{summary.absent}</p>
          <p className="text-[10px] text-red-700">Unexcused</p>
        </div>

        {/* Excused Absence */}
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-purple-700">Excused Leave</p>
          <p className="text-2xl font-black text-purple-900 font-heading my-1">{summary.excusedAbsent}</p>
          <p className="text-[10px] text-purple-700">Approved leave</p>
        </div>
      </div>

      {/* Team Attendance Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Junior Team Members (10 Members)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {10 - summary.unmarked} / 10 marked
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {ASSIGNEES.map((assignee) => {
            const currentRecord = attendanceMap[assignee.name];
            const currentStatus = currentRecord?.status;

            return (
              <div
                key={assignee.name}
                className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                {/* Left: Member Identity (No position title) */}
                <div className="flex items-center gap-3.5 min-w-[200px]">
                  <MemberAvatar name={assignee.name} size="lg" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 font-heading">
                      {assignee.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {currentStatus ? (
                        <span className="text-slate-700 font-medium">Status: {currentStatus}</span>
                      ) : (
                        <span className="text-amber-600 italic">Not marked yet</span>
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
                        className={`py-2.5 px-2 sm:px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border cursor-pointer min-h-[44px] ${
                          isSelected
                            ? `${statusItem.buttonActive} ring-2 ring-blue-500/20`
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                        title={statusItem.description}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : statusItem.dotColor}`} />
                        <span>{statusItem.label}</span>
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
