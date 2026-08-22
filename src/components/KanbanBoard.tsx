'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import { STATUSES } from '@/lib/constants';
import { sortTasksByDeadline } from '@/lib/deadlineUtils';

export const KanbanBoard: React.FC = () => {
  const { filteredTasks } = useTaskContext();

  const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
  const now = Date.now();

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0 items-start no-scrollbar">
      {STATUSES.map((status) => {
        const columnTasks = sortTasksByDeadline(
          filteredTasks.filter((task) => task.status === status.id)
        );

        if (status.id === 'Completed') {
          const recentTasks = columnTasks.filter((task) => {
            const time = task.updated_at
              ? new Date(task.updated_at).getTime()
              : new Date(task.deadline).getTime();
            return now - time <= FORTY_EIGHT_HOURS_MS;
          });

          return (
            <KanbanColumn
              key={status.id}
              status={status.id}
              tasks={recentTasks}
              totalCompletedCount={columnTasks.length}
            />
          );
        }

        return (
          <KanbanColumn
            key={status.id}
            status={status.id}
            tasks={columnTasks}
          />
        );
      })}
    </div>
  );
};
