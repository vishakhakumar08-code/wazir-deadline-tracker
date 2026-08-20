'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import { STATUSES } from '@/lib/constants';

export const KanbanBoard: React.FC = () => {
  const { filteredTasks } = useTaskContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-start overflow-x-auto pb-6">
      {STATUSES.map((status) => {
        const columnTasks = filteredTasks.filter((task) => task.status === status.id);
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
