'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, VERTICALS, STATUSES } from '@/lib/constants';
import { getDeadlineInfo } from '@/lib/deadlineUtils';
import {
  User,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Task, TaskStatus } from '@/types/task';

export const MemberMatrix: React.FC = () => {
  const {
    tasks,
    memberStats,
    openCreateModalWithAssignee,
    setSelectedTask,
    moveTaskStatus,
  } = useTaskContext();

  return (
    <div className="space-y-6">
      {/* Top Banner: Club Team Workload Overview */}
      <div className="bg-gradient-to-r from-wazir-navy via-slate-900 to-wazir-navy p-5 rounded-2xl border border-wazir-border/70 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white font-heading">
                Wazir Core Team Matrix (10 Members)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Real-time deliverable allocation, load balancing, and deadline tracking across club leadership.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">Total Active Tasks:</span>
            <span className="font-bold text-sky-400">
              {tasks.filter((t) => t.status !== 'Completed').length}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Completed:</span>
            <span className="font-bold text-emerald-400">
              {tasks.filter((t) => t.status === 'Completed').length}
            </span>
          </div>
        </div>

        {/* Load Distribution Spectrum Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>Workload Allocation Distribution</span>
            <span>10 Active Leads &amp; Consultants</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-800">
            {memberStats.map((stat) => {
              const assignee = ASSIGNEES.find((a) => a.name === stat.member);
              const percentage = tasks.length > 0 ? (stat.total / (tasks.length * 2)) * 100 : 10;
              return (
                <div
                  key={stat.member}
                  className={`${assignee?.avatarBg ? assignee.avatarBg.replace('/20', '') : 'bg-sky-500'} transition-all`}
                  style={{ width: `${Math.max(5, percentage)}%` }}
                  title={`${stat.member}: ${stat.active} active deliverables`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {ASSIGNEES.map((assignee) => {
          const stats = memberStats.find((s) => s.member === assignee.name) || {
            member: assignee.name,
            total: 0,
            active: 0,
            inProgress: 0,
            inReview: 0,
            completed: 0,
            overdue: 0,
            dueSoon: 0,
            workloadScore: 0,
          };

          const memberTasks = tasks.filter((t) => t.assignees.includes(assignee.name));
          const activeTasks = memberTasks.filter((t) => t.status !== 'Completed');
          const completedTasks = memberTasks.filter((t) => t.status === 'Completed');

          // Workload density label
          let loadBadge = {
            label: 'Balanced',
            style: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
          };
          if (stats.overdue > 0) {
            loadBadge = {
              label: `${stats.overdue} Overdue`,
              style: 'bg-red-500/15 text-red-400 border-red-500/40 animate-pulse-slow',
            };
          } else if (stats.active >= 4) {
            loadBadge = {
              label: 'Heavy Load',
              style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
            };
          } else if (stats.active === 0) {
            loadBadge = {
              label: 'Available',
              style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
            };
          }

          return (
            <div
              key={assignee.name}
              className="bg-wazir-card/85 rounded-2xl border border-wazir-border/70 hover:border-slate-500/50 shadow-md p-5 flex flex-col justify-between transition-all"
            >
              {/* Member Header */}
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-wazir-border/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black border border-slate-700 shadow-sm ${assignee.avatarBg} ${assignee.textColor}`}
                    >
                      {assignee.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-heading">
                        {assignee.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{assignee.role}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${loadBadge.style}`}>
                    {loadBadge.label}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 my-3.5 text-center">
                  <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Active</p>
                    <p className="text-base font-bold text-white mt-0.5">{stats.active}</p>
                  </div>
                  <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-amber-400/90 uppercase font-semibold">&lt; 24h</p>
                    <p className="text-base font-bold text-amber-300 mt-0.5">{stats.dueSoon}</p>
                  </div>
                  <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-red-400/90 uppercase font-semibold">Overdue</p>
                    <p className="text-base font-bold text-red-400 mt-0.5">{stats.overdue}</p>
                  </div>
                  <div className="bg-slate-900/70 p-2 rounded-xl border border-slate-800">
                    <p className="text-[10px] text-emerald-400/90 uppercase font-semibold">Done</p>
                    <p className="text-base font-bold text-emerald-400 mt-0.5">{stats.completed}</p>
                  </div>
                </div>

                {/* Assigned Deliverables List */}
                <div className="space-y-2.5 my-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Active Deliverables ({activeTasks.length})</span>
                    {completedTasks.length > 0 && (
                      <span className="text-emerald-400/80 font-normal">
                        +{completedTasks.length} done
                      </span>
                    )}
                  </p>

                  {activeTasks.length > 0 ? (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                      {activeTasks.map((task) => {
                        const vConfig = VERTICALS.find((v) => v.id === task.vertical) || VERTICALS[0];
                        const dInfo = getDeadlineInfo(task.deadline, task.status);

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className={`p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all cursor-pointer ${dInfo.cardBorderHighlight}`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${vConfig.badge}`}
                              >
                                {task.vertical}
                              </span>

                              <div
                                className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex items-center gap-1 ${dInfo.badgeClass}`}
                              >
                                <span className={`w-1 h-1 rounded-full ${dInfo.dotClass}`} />
                                <span>{dInfo.timeRemainingText}</span>
                              </div>
                            </div>

                            <p className="text-xs font-semibold text-white truncate hover:text-amber-300">
                              {task.title}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[11px]">
                              <span className="text-slate-400">
                                Status: <span className="text-slate-200 font-medium">{task.status}</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus: Record<TaskStatus, TaskStatus> = {
                                    Backlog: 'In Progress',
                                    'In Progress': 'Review',
                                    Review: 'Completed',
                                    Completed: 'Completed',
                                  };
                                  moveTaskStatus(task.id, nextStatus[task.status]);
                                }}
                                className="text-[10px] bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 transition-colors"
                              >
                                Advance &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                      <p className="text-xs text-slate-500">No active deliverables in queue</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action: Assign task to this member */}
              <div className="pt-3 border-t border-wazir-border/40">
                <button
                  onClick={() => openCreateModalWithAssignee(assignee.name)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 hover:border-slate-600 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Assign Deliverable to {assignee.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
