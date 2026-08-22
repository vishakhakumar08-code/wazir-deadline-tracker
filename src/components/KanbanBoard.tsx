'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import { STATUSES } from '@/lib/constants';
import { sortTasksByDeadline } from '@/lib/deadlineUtils';
import { TaskStatus } from '@/types/task';

export const KanbanBoard: React.FC = () => {
  const { filteredTasks } = useTaskContext();
  const [mobileActiveStatus, setMobileActiveStatus] = useState<TaskStatus>('To Do');

  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();

  // Helper to compute tasks for each status
  const getTasksForStatus = (statusId: TaskStatus) => {
    const columnTasks = sortTasksByDeadline(
      filteredTasks.filter((task) => task.status === statusId)
    );

    if (statusId === 'Completed') {
      const recentTasks = columnTasks.filter((task) => {
        const time = task.updated_at
          ? new Date(task.updated_at).getTime()
          : new Date(task.deadline).getTime();
        return now - time <= FORTY_EIGHT_HOURS_MS;
      });

      return {
        tasks: recentTasks,
        totalCompletedCount: columnTasks.length,
      };
    }

    return {
      tasks: columnTasks,
      totalCompletedCount: columnTasks.length,
    };
  };

  return (
    <div>
      {/* Mobile Column Segment Switcher Tabs (< md) */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {STATUSES.map((status) => {
          const { tasks: currentTasks } = getTasksForStatus(status.id);
          const isActive = mobileActiveStatus === status.id;

          return (
            <button
              key={status.id}
              onClick={() => setMobileActiveStatus(status.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs shrink-0 transition-all font-semibold cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100'
              }`}
            >
              {status.label} · {currentTasks.length}
            </button>
          );
        })}
      </div>

      {/* Mobile Active Column View (< md) */}
      <div className="md:hidden">
        {(() => {
          const { tasks: activeTasks, totalCompletedCount } = getTasksForStatus(mobileActiveStatus);
          return (
            <KanbanColumn
              status={mobileActiveStatus}
              tasks={activeTasks}
              totalCompletedCount={totalCompletedCount}
            />
          );
        })()}
      </div>

      {/* Desktop 4-Column Grid (>= md) */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-start">
        {STATUSES.map((status) => {
          const { tasks: columnTasks, totalCompletedCount } = getTasksForStatus(status.id);

          return (
            <KanbanColumn
              key={status.id}
              status={status.id}
              tasks={columnTasks}
              totalCompletedCount={totalCompletedCount}
            />
          );
        })}
      </div>
    </div>
  );
};
