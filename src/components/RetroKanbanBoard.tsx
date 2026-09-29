'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, getVerticalBadgeInfo } from '@/lib/constants';
import { Task, TaskStatus } from '@/types/task';
import { Plus } from 'lucide-react';

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  headerBg: string;
  headerText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'To Do',
    label: 'TO DO',
    headerBg: 'bg-[#38BDF8]',
    headerText: 'text-black',
  },
  {
    id: 'In Progress',
    label: 'IN PROGRESS',
    headerBg: 'bg-[#FACC15]',
    headerText: 'text-black',
  },
  {
    id: 'Completed',
    label: 'COMPLETE',
    headerBg: 'bg-[#4ADE80]',
    headerText: 'text-black',
  },
];

export const RetroKanbanBoard: React.FC<{ memberFilter?: string }> = ({ memberFilter }) => {
  const {
    filteredTasks,
    tasks,
    moveTaskStatus,
    setSelectedTask,
    setIsCreateModalOpen,
  } = useTaskContext();

  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({
    'To Do': false,
    'In Progress': false,
    Completed: false,
  });

  const toggleExpand = (columnId: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const currentTasks = memberFilter
    ? tasks.filter((t) => t.assignees && t.assignees.includes(memberFilter as any))
    : filteredTasks;

  const getVerticalBadge = (verticalName: string) => {
    const badgeInfo = getVerticalBadgeInfo(verticalName);
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-serif lowercase ${badgeInfo.className}`}
      >
        {badgeInfo.tag}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 3-Column Kanban Board Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 border-2 md:border-[3px] border-black bg-white shadow-[4px_4px_0px_0px_#000000]">
        {COLUMNS.map((column, colIdx) => {
          const colTasks = currentTasks.filter((t) => {
            if (column.id === 'To Do') {
              return t.status === 'To Do' || (t.status as any) === 'Backlog';
            }
            if (column.id === 'In Progress') {
              return t.status === 'In Progress' || t.status === 'Review';
            }
            return t.status === 'Completed';
          });

          const isExpanded = expandedColumns[column.id];
          const displayLimit = isExpanded ? colTasks.length : 5;
          const visibleTasks = colTasks.slice(0, displayLimit);
          const hasMore = colTasks.length > 5;
          const isLastCol = colIdx === COLUMNS.length - 1;

          return (
            <div
              key={column.id}
              className={`flex flex-col min-h-[380px] sm:min-h-[460px] ${
                !isLastCol ? 'border-b-2 md:border-b-0 md:border-r-2 md:border-r-black' : ''
              }`}
            >
              {/* Header Box */}
              <div
                className={`py-2 px-4 border-b-2 border-black ${column.headerBg} flex items-center justify-center`}
              >
                <h3 className="font-pixel text-xs sm:text-sm font-bold text-black tracking-widest uppercase">
                  {column.label}
                </h3>
              </div>

              {/* Tasks List */}
              <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-y-auto">
                {visibleTasks.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="font-serif italic text-sm text-slate-400">
                      No deliverables
                    </p>
                  </div>
                ) : (
                  visibleTasks.map((task) => {
                    const isCompleted = task.status === 'Completed';

                    return (
                      <div
                        key={task.id}
                        className="group flex items-start gap-3 p-1 transition-all"
                      >
                        {/* Square Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isCompleted) {
                              moveTaskStatus(task.id, 'To Do');
                            } else {
                              moveTaskStatus(task.id, 'Completed');
                            }
                          }}
                          className={`w-5 h-5 border-2 border-black mt-0.5 flex items-center justify-center font-pixel text-xs shrink-0 cursor-pointer transition-colors ${
                            isCompleted ? 'bg-black text-white' : 'bg-white hover:bg-slate-100 text-black'
                          }`}
                          aria-label={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                        >
                          {isCompleted ? '✓' : ''}
                        </button>

                        {/* Title & Tags */}
                        <div
                          onClick={() => setSelectedTask(task)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <p
                            className={`font-serif text-sm sm:text-base text-slate-900 leading-snug break-words ${
                              isCompleted ? 'line-through text-slate-400' : 'hover:text-blue-700'
                            }`}
                          >
                            {task.title}
                          </p>

                          {/* Verticals & Secondary tags */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            {getVerticalBadge(task.vertical)}

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
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom "more..." Button */}
              {hasMore && (
                <div className="p-3 border-t border-slate-100 text-center">
                  <button
                    type="button"
                    onClick={() => toggleExpand(column.id)}
                    className="font-serif italic text-sm text-slate-700 hover:text-black hover:underline cursor-pointer"
                  >
                    {isExpanded ? 'less...' : 'more...'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Centered "+ ADD NEW" Button */}
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-black text-white font-pixel text-xs sm:text-sm py-3 px-8 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer tracking-wider font-bold"
        >
          <span>+ ADD NEW</span>
        </button>
      </div>
    </div>
  );
};
