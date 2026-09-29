'use client';

import React from 'react';
import { Task } from '@/types/task';
import { useTaskContext } from '@/context/TaskContext';
import { getDeadlineInfo } from '@/lib/deadlineUtils';

import { getVerticalBadgeInfo } from '@/lib/constants';

interface TaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const { setSelectedTask } = useTaskContext();
  const deadlineInfo = getDeadlineInfo(task.deadline, task.status);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a')) {
      return;
    }
    setSelectedTask(task);
  };

  const verticalBadge = getVerticalBadgeInfo(task.vertical);
  const deadlineText = deadlineInfo.timeRemainingText;
  const isOverdue = deadlineInfo.isOverdue && task.status !== 'Completed';

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (onDragStart) onDragStart(e, task.id);
        e.dataTransfer.setData('text/plain', task.id);
      }}
      onClick={handleCardClick}
      className={`group relative rounded-2xl p-4 border transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md ${
        isOverdue
          ? 'bg-red-50/90 border-red-200 hover:border-red-300'
          : 'bg-white border-slate-200/90 hover:border-slate-300'
      } ${task.status === 'Completed' ? 'opacity-85' : ''}`}
    >
      <h4
        className={`text-sm font-bold leading-snug ${
          isOverdue ? 'text-red-950' : 'text-slate-900 group-hover:text-blue-600'
        } transition-colors ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}
      >
        {task.title}
      </h4>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-serif lowercase ${verticalBadge.className}`}
        >
          {verticalBadge.tag}
        </span>

        {task.assignees && task.assignees.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {task.assignees.map((assigneeName) => (
              <span
                key={assigneeName}
                title={assigneeName}
                className="text-[10px] font-sans font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.06)]"
              >
                {assigneeName.slice(0, 2).toUpperCase()}
              </span>
            ))}
          </div>
        )}

        <span
          className={`text-xs ml-auto font-normal ${
            isOverdue ? 'text-red-700/80 font-medium' : 'text-slate-500'
          }`}
        >
          {deadlineText}
        </span>
      </div>
    </div>
  );
};
