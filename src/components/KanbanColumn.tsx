'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { STATUSES } from '@/lib/constants';
import { useTaskContext } from '@/context/TaskContext';
import { sortTasksByDeadline } from '@/lib/deadlineUtils';
import { Plus, Inbox, Archive } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  totalCompletedCount?: number;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  totalCompletedCount,
}) => {
  const { moveTaskStatus, setIsCreateModalOpen, setIsArchiveModalOpen } = useTaskContext();
  const [isDragOver, setIsDragOver] = useState(false);

  const statusConfig = STATUSES.find((s) => s.id === status) || STATUSES[0];
  const isCompleted = status === 'Completed';
  const sortedTasks = sortTasksByDeadline(tasks);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTaskStatus(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col rounded-2xl transition-all duration-150 ${
        isDragOver ? 'bg-blue-50/50 ring-2 ring-blue-400' : ''
      }`}
    >
      {/* Column Header (Desktop) */}
      <div className="hidden md:flex items-center justify-between pb-3.5 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor}`} />
          <h3 className="text-sm font-bold text-slate-900 font-heading">
            {statusConfig.label}
          </h3>
          <span className="text-sm font-semibold text-slate-400">
            {tasks.length}
          </span>
        </div>

        {!isCompleted && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title={`Add deliverable to ${statusConfig.label}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Task List / Drop Zone */}
      <div className="space-y-3 min-h-[140px]">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <Inbox className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-medium text-slate-500">
              {isCompleted ? 'No recent completions (< 48h)' : 'No deliverables'}
            </p>
          </div>
        )}

        {/* Completed column archive footer trigger */}
        {isCompleted && (
          <div className="pt-2 text-center">
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>
                View All {totalCompletedCount ?? tasks.length} Completed Tasks →
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
