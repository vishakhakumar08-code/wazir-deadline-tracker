'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES, VERTICALS, STATUSES } from '@/lib/constants';
import { getDeadlineInfo, sortTasksByDeadline } from '@/lib/deadlineUtils';
import {
  User,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Briefcase,
  Layers,
  UserX,
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

  const unassignedTasks = sortTasksByDeadline(
    tasks.filter(
      (t) => (!t.assignees || t.assignees.length === 0) && t.status !== 'Completed'
    )
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Club Team Workload Overview */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Wazir Core Team Matrix (10 Members)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time deliverable allocation, load balancing, and deadline tracking across the team.
            </p>
          </div>

          {/* Quick Summary Pill */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-sm">
            <span className="text-slate-500">Active:</span>
            <span className="font-bold text-blue-600">
              {tasks.filter((t) => t.status !== 'Completed').length}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Unassigned:</span>
            <span className="font-bold text-amber-600">
              {unassignedTasks.length}
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">Completed:</span>
            <span className="font-bold text-emerald-600">
              {tasks.filter((t) => t.status === 'Completed').length}
            </span>
          </div>
        </div>

        {/* Load Distribution Spectrum Bar */}
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-medium">
            <span>Workload Allocation Distribution</span>
            <span>10 Team Members</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-200">
            {memberStats.map((stat) => {
              const assignee = ASSIGNEES.find((a) => a.name === stat.member);
              const percentage = tasks.length > 0 ? (stat.total / (tasks.length * 2)) * 100 : 10;
              return (
                <div
                  key={stat.member}
                  className={`${assignee?.avatarBg ? assignee.avatarBg.replace('100', '500') : 'bg-blue-500'} transition-all`}
                  style={{ width: `${Math.max(5, percentage)}%` }}
                  title={`${stat.member}: ${stat.active} active deliverables`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Unassigned Deliverables Queue Alert (if any exist) */}
      {unassignedTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-amber-950">
                Unassigned Deliverables ({unassignedTasks.length})
              </h3>
              <span className="text-[11px] text-amber-700 font-medium">
                Pending assignment to team members
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unassignedTasks.map((task) => {
              const vConfig = VERTICALS.find((v) => v.id === task.vertical) || VERTICALS[0];
              const dInfo = getDeadlineInfo(task.deadline, task.status);

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vConfig.badge}`}>
                      {task.vertical}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${dInfo.badgeClass}`}>
                      {dInfo.timeRemainingText}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate hover:text-blue-600">
                    {task.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                    <span className="text-amber-600 font-semibold">Unassigned</span>
                    <span className="text-blue-600 font-semibold hover:underline">Click to Assign &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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

          const memberTasks = sortTasksByDeadline(
            tasks.filter((t) => t.assignees && t.assignees.includes(assignee.name))
          );
          const activeTasks = memberTasks.filter((t) => t.status !== 'Completed');
          const completedTasks = memberTasks.filter((t) => t.status === 'Completed');

          // Workload density label
          let loadBadge = {
            label: 'Balanced',
            style: 'bg-blue-50 text-blue-700 border-blue-200',
          };
          if (stats.overdue > 0) {
            loadBadge = {
              label: `${stats.overdue} Overdue`,
              style: 'bg-red-50 text-red-700 border-red-200 font-bold',
            };
          } else if (stats.active >= 4) {
            loadBadge = {
              label: 'Heavy Load',
              style: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
            };
          } else if (stats.active === 0) {
            loadBadge = {
              label: 'Available',
              style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            };
          }

          return (
            <div
              key={assignee.name}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-sm p-5 flex flex-col justify-between transition-all"
            >
              {/* Member Header */}
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border border-slate-200 shadow-sm ${assignee.avatarBg} ${assignee.textColor}`}
                    >
                      {assignee.initials}
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                        {assignee.name}
                      </h3>
                    </div>
                  </div>

                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${loadBadge.style}`}>
                    {loadBadge.label}
                  </span>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-2 my-3 text-center">
                  <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Active</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{stats.active}</p>
                  </div>
                  <div className="bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                    <p className="text-[10px] text-amber-700 uppercase font-semibold">&lt; 24h</p>
                    <p className="text-sm font-black text-amber-800 mt-0.5">{stats.dueSoon}</p>
                  </div>
                  <div className="bg-red-50/60 p-2 rounded-xl border border-red-100">
                    <p className="text-[10px] text-red-700 uppercase font-semibold">Overdue</p>
                    <p className="text-sm font-black text-red-800 mt-0.5">{stats.overdue}</p>
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <p className="text-[10px] text-emerald-700 uppercase font-semibold">Done</p>
                    <p className="text-sm font-black text-emerald-800 mt-0.5">{stats.completed}</p>
                  </div>
                </div>

                {/* Assigned Deliverables List */}
                <div className="space-y-2 my-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Active Deliverables ({activeTasks.length})</span>
                    {completedTasks.length > 0 && (
                      <span className="text-emerald-600 font-normal">
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
                            className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-all cursor-pointer"
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${vConfig.badge}`}
                              >
                                {task.vertical}
                              </span>

                              <div
                                className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${dInfo.badgeClass}`}
                              >
                                <span>{dInfo.timeRemainingText}</span>
                              </div>
                            </div>

                            <p className="text-xs font-bold text-slate-900 truncate hover:text-blue-600">
                              {task.title}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-200 text-[11px]">
                              <span className="text-slate-500">
                                Stage: <span className="text-slate-800 font-medium">{task.status}</span>
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const nextStatus: Record<TaskStatus, TaskStatus> = {
                                    'To Do': 'In Progress',
                                    'In Progress': 'Review',
                                    Review: 'Completed',
                                    Completed: 'Completed',
                                  };
                                  moveTaskStatus(task.id, nextStatus[task.status]);
                                }}
                                className="text-[10px] bg-white hover:bg-blue-600 text-slate-700 hover:text-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-sm transition-colors cursor-pointer"
                              >
                                Advance &rarr;
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                      <p className="text-xs text-slate-400">No deliverables currently assigned</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Assign Deliverable CTA */}
              <button
                onClick={() => openCreateModalWithAssignee(assignee.name)}
                className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white text-xs font-semibold border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign New Deliverable</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
