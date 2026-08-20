'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { KanbanColumn } from './KanbanColumn';
import { STATUSES } from '@/lib/constants';

export const KanbanBoard: React.FC = () => {
  const { filteredTasks } = useTaskContext();

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-5 md:overflow-visible md:pb-0 items-start no-scrollbar">
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
