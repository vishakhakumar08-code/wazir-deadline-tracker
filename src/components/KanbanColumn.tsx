'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from './TaskCard';
import { STATUSES } from '@/lib/constants';
import { useTaskContext } from '@/context/TaskContext';
import { Plus, Inbox } from 'lucide-react';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, tasks }) => {
  const { moveTaskStatus, setIsCreateModalOpen } = useTaskContext();
  const [isDragOver, setIsDragOver] = useState(false);

  const statusConfig = STATUSES.find((s) => s.id === status) || STATUSES[0];

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
      className={`flex flex-col bg-slate-900/60 rounded-2xl border transition-all duration-200 min-w-[280px] lg:min-w-0 ${
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

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          title={`Add task to ${statusConfig.label}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List / Drop Zone */}
      <div className="p-3 flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[160px] scrollbar-thin">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-slate-800 rounded-xl">
            <Inbox className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">No deliverables</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Drag tasks here or click +</p>
          </div>
        )}
      </div>
    </div>
  );
};
