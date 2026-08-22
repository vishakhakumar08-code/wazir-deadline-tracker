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
      className={`flex flex-col bg-slate-900/60 rounded-2xl border transition-all duration-200 w-[85vw] sm:w-[70vw] md:w-auto min-w-[85vw] sm:min-w-[70vw] md:min-w-0 snap-center md:snap-align-none shrink-0 md:shrink ${
        isDragOver
          ? 'border-sky-400 bg-sky-950/20 ring-2 ring-sky-500/30'
          : 'border-wazir-border/60 hover:border-wazir-border'
      }`}
    >
      {/* Column Header */}
      <div className={`p-3.5 sm:p-4 rounded-t-2xl border-b border-wazir-border/60 ${statusConfig.headerBg} flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${statusConfig.dotColor} shadow-sm`} />
          <h3 className="text-sm font-bold text-white tracking-wide font-heading">
            {statusConfig.label}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isCompleted && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
              title={`Add deliverable to ${statusConfig.label}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Task List / Drop Zone */}
      <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px] scrollbar-thin">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <Inbox className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">
              {isCompleted ? 'No recent completions (< 48h)' : 'No deliverables'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isCompleted ? 'Click below to view all completed' : 'Drag tasks here or click +'}
            </p>
          </div>
        )}

        {/* Completed column archive footer link */}
        {isCompleted && (
          <div className="pt-2 border-t border-slate-800/60 text-center">
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl hover:bg-emerald-950/20 transition-colors cursor-pointer"
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
