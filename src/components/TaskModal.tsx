'use client';

import React, { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES, STATUSES } from '@/lib/constants';
import { toDatetimeLocalString } from '@/lib/deadlineUtils';
import { Vertical, Assignee, TaskPriority, TaskStatus, SubTask } from '@/types/task';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Check,
  Flame,
  AlertTriangle,
  Clock,
  Minus,
  Sparkles,
  Link as LinkIcon,
  ListTodo,
  UserX,
  Users,
} from 'lucide-react';
import { MemberAvatar } from './MemberAvatar';

export const TaskModal: React.FC = () => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    addTask,
    prefilledAssignee,
    showToast,
  } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vertical, setVertical] = useState<Vertical>('Editorial');
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>([]);
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  
  // Default deadline: 2 days from now at 18:00
  const defaultDeadline = new Date();
  defaultDeadline.setDate(defaultDeadline.getDate() + 2);
  defaultDeadline.setHours(18, 0, 0, 0);
  const [deadline, setDeadline] = useState(toDatetimeLocalString(defaultDeadline));

  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [newResourceUrl, setNewResourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set prefilled assignee if explicitly initiated from Member Matrix, otherwise start completely empty/unassigned
  useEffect(() => {
    if (isCreateModalOpen) {
      if (prefilledAssignee) {
        setSelectedAssignees([prefilledAssignee]);
      } else {
        setSelectedAssignees([]);
      }
    }
  }, [isCreateModalOpen, prefilledAssignee]);

  if (!isCreateModalOpen) return null;

  const toggleAssignee = (name: Assignee) => {
    setSelectedAssignees((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const clearAllAssignees = () => {
    setSelectedAssignees([]);
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    setSubtasks((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddResource = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newResourceUrl.trim()) return;
    setResources((prev) => [...prev, newResourceUrl.trim()]);
    setNewResourceUrl('');
  };

  const handleRemoveResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  // Quick Preset Deadlines
  const setQuickDeadline = (hoursFromNow: number) => {
    const d = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    setDeadline(toDatetimeLocalString(d));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a deliverable title', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        vertical,
        assignees: selectedAssignees,
        status,
        priority,
        deadline: new Date(deadline).toISOString(),
        subtasks,
        resources,
      });

      // Reset Form State
      setTitle('');
      setDescription('');
      setVertical('Editorial');
      setSelectedAssignees([]);
      setStatus('To Do');
      setPriority('Medium');
      setSubtasks([]);
      setResources([]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle Indicator */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                New Deliverable / Project
              </h3>
              <p className="text-xs text-slate-500">
                Create and allocate a deliverable across club verticals
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sponsor deck v2, Newsletter layout, Conclave pitch..."
              className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium min-h-[44px]"
            />
          </div>

          {/* Vertical & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vertical Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Club Vertical *
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium cursor-pointer min-h-[44px]"
              >
                {VERTICALS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Level */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Priority Level *
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {PRIORITIES.map((p) => {
                  const isSelected = priority === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPriority(p.id)}
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

          {/* Target Deadline with Quick Presets */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Target Deadline *
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Quick:</span>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(6)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
                >
                  +6h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(24)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 cursor-pointer"
                >
                  +24h
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(72)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200 cursor-pointer"
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
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-medium min-h-[44px]"
              />
            </div>
          </div>

          {/* Assignees (Manual Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Assign Team Members ({selectedAssignees.length})
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAssignees.length === ASSIGNEES.length) {
                      clearAllAssignees();
                    } else {
                      setSelectedAssignees(ASSIGNEES.map((a) => a.name));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer min-h-[34px] ${
                    selectedAssignees.length === ASSIGNEES.length
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {selectedAssignees.length === ASSIGNEES.length
                    ? '✓ Entire Team (Deselect)'
                    : '⚡ Select All / Entire Team'}
                </button>
                {selectedAssignees.length > 0 && selectedAssignees.length < ASSIGNEES.length && (
                  <button
                    type="button"
                    onClick={clearAllAssignees}
                    className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ASSIGNEES.map((assignee) => {
                const isSelected = selectedAssignees.includes(assignee.name);
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
                    <MemberAvatar name={assignee.name} size="xs" />
                    <span className="truncate">{assignee.name}</span>
                    {isSelected && <span className="text-[10px] text-blue-600 font-bold ml-auto">✓</span>}
                  </button>
                );
              })}
            </div>
            {selectedAssignees.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1.5 flex items-center gap-1">
                <UserX className="w-3 h-3" />
                <span>Starts as unassigned until members are checked.</span>
              </p>
            )}
          </div>

          {/* Workflow Stage */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Initial Workflow Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUSES.map((st) => {
                const isSelected = status === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? 'bg-white' : st.dotColor
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key instructions, deliverables, requirements, or meeting notes..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 font-normal resize-none"
            ></textarea>
          </div>

          {/* Checklist Subtasks */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-blue-600" />
              Checklist / Subtasks ({subtasks.length})
            </label>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
                  >
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add subtask or checkpoint..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 flex items-center gap-1 min-h-[44px] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating...' : 'Create Deliverable'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
