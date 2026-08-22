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
  Layers,
  CheckSquare,
  Square,
  Plus,
  ExternalLink,
  Save,
  UserX,
  Minus,
  Users,
} from 'lucide-react';

export const TaskDetailModal: React.FC = () => {
  const {
    selectedTask,
    setSelectedTask,
    updateTask,
    deleteTask,
    toggleSubtask,
    moveTaskStatus,
    showToast,
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

  const verticalConfig = VERTICALS.find((v) => v.id === (isEditing ? editVertical : selectedTask.vertical)) || VERTICALS[0];
  const priorityConfig = PRIORITIES.find((p) => p.id === (isEditing ? editPriority : selectedTask.priority)) || PRIORITIES[2];
  const deadlineInfo = getDeadlineInfo(selectedTask.deadline, selectedTask.status);

  const startEditing = () => {
    setEditTitle(selectedTask.title);
    setEditDescription(selectedTask.description || '');
    setEditVertical(selectedTask.vertical);
    setEditPriority(selectedTask.priority);
    setEditDeadline(toDatetimeLocalString(new Date(selectedTask.deadline)));
    setEditAssignees([...selectedTask.assignees]);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      showToast('Please provide a deliverable title', 'warning');
      return;
    }

    try {
      const parsedDeadline = editDeadline ? new Date(editDeadline).toISOString() : selectedTask.deadline;
      await updateTask(selectedTask.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        vertical: editVertical,
        priority: editPriority,
        deadline: parsedDeadline,
        assignees: editAssignees,
      });
      setIsEditing(false);
      showToast('Deliverable updated successfully!', 'success');
    } catch (err: any) {
      console.error('Error saving edits:', err);
      showToast(`Failed to update: ${err?.message || 'Error saving'}`, 'error');
    }
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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle Indicator */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Top Urgency Color Bar */}
        <div className={`h-2 w-full ${
          deadlineInfo.urgency === 'overdue'
            ? 'bg-red-500'
            : deadlineInfo.urgency === 'due_soon'
            ? 'bg-amber-500'
            : deadlineInfo.urgency === 'completed'
            ? 'bg-emerald-500'
            : 'bg-blue-600'
        }`} />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${verticalConfig.badge}`}>
              {isEditing ? editVertical : selectedTask.vertical}
            </span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityConfig.badge}`}>
              {isEditing ? editPriority : selectedTask.priority}
            </span>
            {isEditing && (
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Editing Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="px-3 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm min-h-[36px]"
                title="Edit deliverable"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={cancelEditing}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 cursor-pointer min-h-[36px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer min-h-[36px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}

            {!isEditing && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this deliverable?')) {
                    deleteTask(selectedTask.id);
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Delete deliverable"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setSelectedTask(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Main Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Deliverable Title {isEditing && '*'}
            </label>
            {!isEditing ? (
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-heading leading-snug">
                {selectedTask.title}
              </h2>
            ) : (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Deliverable title"
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-base font-bold text-slate-900 focus:outline-none focus:border-blue-600 font-heading min-h-[44px]"
              />
            )}
          </div>

          {/* Edit Mode: Vertical & Priority Selector Row */}
          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              {/* Vertical Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  Club Vertical *
                </label>
                <select
                  value={editVertical}
                  onChange={(e) => setEditVertical(e.target.value as Vertical)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium cursor-pointer min-h-[44px]"
                >
                  {VERTICALS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority Level *
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRIORITIES.map((p) => {
                    const isSelected = editPriority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setEditPriority(p.id)}
                        className={`py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 min-h-[44px] cursor-pointer ${
                          isSelected
                            ? `${p.badge} ring-2 ring-blue-500 font-bold shadow-sm`
                            : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                        }`}
                      >
                        {p.id === 'Urgent' && <Flame className="w-3.5 h-3.5 text-red-500" />}
                        {p.id === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                        {p.id === 'Medium' && <Clock className="w-3.5 h-3.5 text-amber-500" />}
                        {p.id === 'Low' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Deadline Section: View Mode vs Edit Mode Date Picker */}
          <div>
            {!isEditing ? (
              /* Deadline Countdown Banner */
              <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-[11px] text-slate-500">Target Deadline</p>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900">
                      {deadlineInfo.formattedDate}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-semibold ${deadlineInfo.badgeClass}`}
                >
                  <span className={`w-2 h-2 rounded-full ${deadlineInfo.dotClass}`} />
                  <span>{deadlineInfo.timeRemainingText}</span>
                </div>
              </div>
            ) : (
              /* Editable Deadline Date & Time Picker */
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Modify Deadline Date &amp; Time *
                  </label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400">Quick:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 6 * 60 * 60 * 1000);
                        setEditDeadline(toDatetimeLocalString(d));
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer min-h-[30px]"
                    >
                      +6h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
                        setEditDeadline(toDatetimeLocalString(d));
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 cursor-pointer min-h-[30px]"
                    >
                      +24h
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(Date.now() + 72 * 60 * 60 * 1000);
                        setEditDeadline(toDatetimeLocalString(d));
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-emerald-700 border border-slate-200 cursor-pointer min-h-[30px]"
                    >
                      +3d
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="datetime-local"
                    required
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium min-h-[44px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Workflow Status Advance Bar (Only in View Mode) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Deliverable Workflow Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATUSES.map((st) => {
                  const isActive = selectedTask.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => moveTaskStatus(selectedTask.id, st.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 border min-h-[44px] cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-100'
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
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description / Context
            </label>
            {!isEditing ? (
              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                {selectedTask.description || 'No detailed notes provided for this deliverable.'}
              </p>
            ) : (
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Add context, objectives, or instructions..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 resize-none font-normal"
              ></textarea>
            )}
          </div>

          {/* Assignees Section */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Assigned Team Members ({(isEditing ? editAssignees : selectedTask.assignees).length})
            </label>
            {!isEditing ? (
              selectedTask.assignees && selectedTask.assignees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assignees.map((assigneeName) => {
                    const assignee = ASSIGNEES.find((a) => a.name === assigneeName);
                    return (
                      <div
                        key={assigneeName}
                        className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            assignee?.avatarBg || 'bg-slate-100'
                          } ${assignee?.textColor || 'text-slate-800'}`}
                        >
                          {assignee?.initials || assigneeName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{assigneeName}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <UserX className="w-4 h-4 text-amber-500" />
                    <span>Currently Unassigned</span>
                  </div>
                  <button
                    type="button"
                    onClick={startEditing}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    + Assign Team Member
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-slate-500">
                    {editAssignees.length === 0
                      ? 'Currently unassigned'
                      : `${editAssignees.length}/${ASSIGNEES.length} members selected`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (editAssignees.length === ASSIGNEES.length) {
                          setEditAssignees([]);
                        } else {
                          setEditAssignees(ASSIGNEES.map((a) => a.name));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer min-h-[34px] ${
                        editAssignees.length === ASSIGNEES.length
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                      }`}
                    >
                      {editAssignees.length === ASSIGNEES.length
                        ? '✓ Entire Team (Deselect)'
                        : '⚡ Select All / Entire Team'}
                    </button>
                    {editAssignees.length > 0 && editAssignees.length < ASSIGNEES.length && (
                      <button
                        type="button"
                        onClick={() => setEditAssignees([])}
                        className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ASSIGNEES.map((assignee) => {
                    const isSelected = editAssignees.includes(assignee.name);
                    return (
                      <button
                        key={assignee.name}
                        type="button"
                        onClick={() => toggleAssignee(assignee.name)}
                        className={`p-2.5 sm:p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all min-h-[44px] cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-300 text-blue-800 ring-1 ring-blue-400/40 shadow-sm'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : assignee.avatarBg
                          }`}
                        >
                          {isSelected ? '✓' : assignee.initials}
                        </div>
                        <span className="truncate">{assignee.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Checklist / Subtasks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 text-blue-600" />
                Checklist Deliverables
              </span>
              <span className="text-slate-500 text-xs">
                {selectedTask.subtasks.filter((s) => s.completed).length} / {selectedTask.subtasks.length} Done
              </span>
            </label>

            <div className="space-y-2 mb-3">
              {selectedTask.subtasks.map((st) => (
                <div
                  key={st.id}
                  onClick={() => toggleSubtask(selectedTask.id, st.id)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer min-h-[44px] ${
                    st.completed
                      ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={st.completed ? 'text-emerald-600' : 'text-slate-400'}>
                      {st.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </div>
                    <span className="text-xs sm:text-sm truncate font-medium">
                      {st.title}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtask(st.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
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
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </form>
          </div>

          {/* Resources / Links */}
          {selectedTask.resources && selectedTask.resources.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                External Artifacts &amp; Links
              </label>
              <div className="space-y-1.5">
                {selectedTask.resources.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-blue-600 hover:underline transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{url}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Edit Mode Bottom Action Bar */}
          {isEditing && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={cancelEditing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
