'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES, STATUSES } from '@/lib/constants';
import { getDeadlineInfo, toDatetimeLocalString } from '@/lib/deadlineUtils';
import { Task, TaskStatus, TaskPriority, Vertical, Assignee } from '@/types/task';
import {
  X,
  Clock,
  CheckCircle2,
  Calendar,
  Trash2,
  Edit3,
  Flame,
  AlertTriangle,
  User,
  Layers,
  CheckSquare,
  Square,
  Plus,
  ExternalLink,
  Save,
  UserX,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    moveTaskStatus,
  } = useTaskContext();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVertical, setEditVertical] = useState<Vertical>('Editorial');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Medium');
  const [editDeadline, setEditDeadline] = useState('');
  const [editAssignees, setEditAssignees] = useState<Assignee[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');

  if (!selectedTask) return null;

  const verticalConfig = VERTICALS.find((v) => v.id === selectedTask.vertical) || VERTICALS[0];
  const priorityConfig = PRIORITIES.find((p) => p.id === selectedTask.priority) || PRIORITIES[2];
  const deadlineInfo = getDeadlineInfo(selectedTask.deadline, selectedTask.status);

  const startEditing = () => {
    setEditTitle(selectedTask.title);
    setEditDescription(selectedTask.description);
    setEditVertical(selectedTask.vertical);
    setEditPriority(selectedTask.priority);
    setEditDeadline(toDatetimeLocalString(new Date(selectedTask.deadline)));
    setEditAssignees([...selectedTask.assignees]);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    await updateTask(selectedTask.id, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      vertical: editVertical,
      priority: editPriority,
      deadline: new Date(editDeadline).toISOString(),
      assignees: editAssignees,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskInput.trim()) return;
    const newSt = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newSubtaskInput.trim(),
      completed: false,
    };
    await updateTask(selectedTask.id, {
      subtasks: [...selectedTask.subtasks, newSt],
    });
    setNewSubtaskInput('');
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    await updateTask(selectedTask.id, {
      subtasks: selectedTask.subtasks.filter((st) => st.id !== subtaskId),
    });
  };

  const toggleAssignee = (name: Assignee) => {
    setEditAssignees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-wazir-card border-t md:border border-wazir-border rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle Indicator */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-900/80">
          <div className="w-12 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Top Urgency Color Bar */}
        <div className={`h-2 w-full ${
          deadlineInfo.urgency === 'overdue'
            ? 'bg-red-500'
            : deadlineInfo.urgency === 'due_soon'
            ? 'bg-amber-500'
            : deadlineInfo.urgency === 'completed'
            ? 'bg-emerald-500'
            : 'bg-sky-500'
        }`} />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-wazir-border/60 bg-slate-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${verticalConfig.badge}`}>
              {selectedTask.vertical}
            </span>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${priorityConfig.badge}`}>
              {selectedTask.priority}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
                title="Edit details"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this deliverable?')) {
                  deleteTask(selectedTask.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Delete deliverable"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSelectedTask(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
          {/* Main Title & Deadline Callout */}
          <div>
            {!isEditing ? (
              <h2 className="text-xl font-bold text-white font-heading leading-snug">
                {selectedTask.title}
              </h2>
            ) : (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-900 border border-wazir-border rounded-xl px-3 py-2 text-lg font-bold text-white focus:outline-none focus:border-amber-500"
              />
            )}

            {/* Deadline Countdown Banner */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-[11px] text-slate-400">Target Deadline</p>
                  <p className="text-xs font-semibold text-white">
                    {deadlineInfo.formattedDate}
                  </p>
                </div>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg border font-semibold ${deadlineInfo.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${deadlineInfo.dotClass}`} />
                <span>{deadlineInfo.timeRemainingText}</span>
              </div>
            </div>
          </div>

          {/* Workflow Status Advance Bar */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Deliverable Workflow Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUSES.map((st) => {
                const isActive = selectedTask.status === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => moveTaskStatus(selectedTask.id, st.id)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
                      isActive
                        ? 'bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20'
                        : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive ? 'bg-white' : st.dotColor
                      }`}
                    />
                    <span>{st.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Description / Notes
            </label>
            {!isEditing ? (
              <p className="text-sm text-slate-300 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                {selectedTask.description || 'No detailed notes provided for this deliverable.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-900 border border-wazir-border rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-500"
              ></textarea>
            )}
          </div>

          {/* Assignees Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Assigned Team Members ({selectedTask.assignees.length})
            </label>
            {!isEditing ? (
              selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignees.map((assigneeName) => {
                    const assignee = ASSIGNEES.find((a) => a.name === assigneeName);
                    return (
                      <div
                        key={assigneeName}
                        className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800"
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            assignee?.avatarBg || 'bg-slate-800'
                          } ${assignee?.textColor || 'text-white'}`}
                        >
                          {assignee?.initials || assigneeName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{assigneeName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-dashed border-slate-700">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <UserX className="w-4 h-4 text-amber-400" />
                    <span>Currently Unassigned</span>
                  </div>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    + Assign Team Member
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-slate-400">
                    {editAssignees.length === 0
                      ? 'Currently unassigned'
                      : `${editAssignees.length}/${ASSIGNEES.length} members selected`}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (editAssignees.length === ASSIGNEES.length) {
                        setEditAssignees([]);
                      } else {
                        setEditAssignees(ASSIGNEES.map((a) => a.name));
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                      editAssignees.length === ASSIGNEES.length
                        ? 'bg-amber-500 text-wazir-midnight border-amber-400 font-bold'
                        : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40'
                    }`}
                  >
                    {editAssignees.length === ASSIGNEES.length
                      ? '✓ Entire Team (Deselect)'
                      : '⚡ Select All / Entire Team'}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ASSIGNEES.map((assignee) => {
                    const isSelected = editAssignees.includes(assignee.name);
                    return (
                      <button
                        key={assignee.name}
                        type="button"
                        onClick={() => toggleAssignee(assignee.name)}
                        className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400/30'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{assignee.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Checklist / Subtasks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-sky-400" />
                Checklist Deliverables
              </span>
              <span className="text-slate-400 text-xs">
                {selectedTask.subtasks.filter((s) => s.completed).length} / {selectedTask.subtasks.length} Done
              </span>
            </label>

            <div className="space-y-2 mb-3">
              {selectedTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(selectedTask.id, st.id)}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 cursor-pointer group transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    {st.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        st.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {st.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtask(st.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskInput}
                onChange={(e) => setNewSubtaskInput(e.target.value)}
                placeholder="Add next action item or checkpoint..."
                className="flex-1 bg-slate-900 border border-wazir-border rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Resources / Links */}
          {selectedTask.resources && selectedTask.resources.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                External Artifacts &amp; Links
              </label>
              <div className="space-y-1.5">
                {selectedTask.resources.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
