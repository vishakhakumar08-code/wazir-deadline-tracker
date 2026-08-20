'use client';

import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES, STATUSES } from '@/lib/constants';
import { getDeadlineInfo } from '@/lib/deadlineUtils';
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckSquare,
  CheckCircle,
  MoreHorizontal,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDragStart }) => {
  const { setSelectedTask, moveTaskStatus, toggleSubtask } = useTaskContext();

  const verticalConfig = VERTICALS.find((v) => v.id === task.vertical) || VERTICALS[0];
  const priorityConfig = PRIORITIES.find((p) => p.id === task.priority) || PRIORITIES[2];
  const deadlineInfo = getDeadlineInfo(task.deadline, task.status);

  const completedSubtasks = task.subtasks.filter((st) => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const handleCardClick = (e: React.MouseEvent) => {
    // Avoid triggering when clicking interactive child elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a')) {
      return;
    }
    setSelectedTask(task);
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'Urgent':
        return <Flame className="w-3 h-3 text-red-400 fill-red-400/20" />;
      case 'High':
        return <AlertTriangle className="w-3 h-3 text-orange-400" />;
      case 'Medium':
        return <Clock className="w-3 h-3 text-amber-400" />;
      default:
        return null;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        if (onDragStart) onDragStart(e, task.id);
        e.dataTransfer.setData('text/plain', task.id);
      }}
      onClick={handleCardClick}
      className={`group relative bg-wazir-card/90 hover:bg-wazir-cardHover rounded-xl p-4 border border-wazir-border/70 hover:border-slate-500/50 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer ${
        deadlineInfo.cardBorderHighlight
      } ${task.status === 'Completed' ? 'opacity-75 hover:opacity-100' : ''}`}
    >
      {/* Top Header: Vertical & Priority */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        {/* Vertical Badge */}
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${verticalConfig.badge}`}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: verticalConfig.color }}
          />
          {task.vertical}
        </span>

        {/* Priority Badge */}
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1 ${priorityConfig.badge}`}
        >
          {getPriorityIcon()}
          {task.priority}
        </span>
      </div>

      {/* Title & Description Preview */}
      <div className="mb-3">
        <h4
          className={`text-sm font-semibold text-white group-hover:text-amber-300 transition-colors leading-snug ${
            task.status === 'Completed' ? 'line-through text-slate-400' : ''
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Subtasks Progress Bar (if any) */}
      {totalSubtasks > 0 && (
        <div className="mb-3 bg-slate-900/60 rounded-lg p-2 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-sky-400" />
              <span>Deliverables</span>
            </span>
            <span className="font-medium text-slate-300">
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressPercent === 100
                  ? 'bg-emerald-400'
                  : 'bg-gradient-to-r from-sky-500 to-indigo-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Deadline Color-Coded Pill */}
      <div className="flex items-center justify-between pt-2.5 border-t border-wazir-border/40 gap-2">
        {/* Deadline Status Badge */}
        <div
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${deadlineInfo.badgeClass}`}
          title={`Deadline: ${deadlineInfo.formattedDate}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${deadlineInfo.dotClass}`} />
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate">{deadlineInfo.timeRemainingText}</span>
        </div>

        {/* Assignees Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees.map((assigneeName) => {
            const assignee = ASSIGNEES.find((a) => a.name === assigneeName);
            return (
              <div
                key={assigneeName}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border border-wazir-midnight shadow-sm ${
                  assignee?.avatarBg || 'bg-slate-700'
                } ${assignee?.textColor || 'text-white'}`}
                title={`${assigneeName} (${assignee?.role || 'Member'})`}
              >
                {assignee?.initials || assigneeName.substring(0, 2).toUpperCase()}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Move / Status Transition Toolbar on Hover */}
      <div className="mt-3 pt-2 border-t border-dashed border-slate-800/80 flex items-center justify-between text-xs">
        <select
          value={task.status}
          onChange={(e) => moveTaskStatus(task.id, e.target.value as TaskStatus)}
          className="bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700/60 rounded-md px-2 py-0.5 text-[11px] font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
        >
          {STATUSES.map((st) => (
            <option key={st.id} value={st.id}>
              {st.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setSelectedTask(task)}
          className="text-slate-400 hover:text-sky-400 text-[11px] font-medium flex items-center gap-0.5 transition-colors"
        >
          <span>Details</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
