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
  const [status, setStatus] = useState<TaskStatus>('Backlog');
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
        assignees: selectedAssignees, // Empty array if unassigned, or manually selected members
        status,
        priority,
        deadline: new Date(deadline).toISOString(),
        subtasks,
        resources,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedAssignees([]);
      setSubtasks([]);
      setResources([]);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-wazir-card border border-wazir-border rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-wazir-border/60 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Create New Deliverable
              </h3>
              <p className="text-xs text-slate-400">
                Wazir - The Strategy &amp; Consulting Club
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Casebook 2026 - M&A Strategy Sector Deck"
              className="w-full bg-slate-900 border border-wazir-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-medium"
            />
          </div>

          {/* Vertical & Priority Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vertical Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Club Vertical *
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
                className="w-full bg-slate-900 border border-wazir-border rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
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
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? `${p.badge} ring-2 ring-amber-400/50 shadow-md`
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {p.id === 'Urgent' && <Flame className="w-3.5 h-3.5 text-red-400" />}
                      {p.id === 'High' && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                      {p.id === 'Medium' && <Clock className="w-3.5 h-3.5 text-amber-400" />}
                      {p.id === 'Low' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Assign Junior Team Members
                {selectedAssignees.length === 0 ? (
                  <span className="text-[11px] font-normal text-amber-400/90 lowercase">
                    (currently unassigned)
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-300">
                    ({selectedAssignees.length}/{ASSIGNEES.length} selected)
                  </span>
                )}
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAssignees.length === ASSIGNEES.length) {
                      setSelectedAssignees([]);
                    } else {
                      setSelectedAssignees(ASSIGNEES.map((a) => a.name));
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedAssignees.length === ASSIGNEES.length
                      ? 'bg-amber-500 text-wazir-midnight border-amber-400 shadow-md shadow-amber-500/30'
                      : 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border-sky-500/40'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  <span>
                    {selectedAssignees.length === ASSIGNEES.length
                      ? '✓ Entire Team Selected (Deselect)'
                      : '⚡ Select All / Entire Team'}
                  </span>
                </button>
                {selectedAssignees.length > 0 && selectedAssignees.length < ASSIGNEES.length && (
                  <button
                    type="button"
                    onClick={clearAllAssignees}
                    className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Select team members or click <strong>Entire Team</strong> to assign to all 10 members.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {ASSIGNEES.map((assignee) => {
                const isSelected = selectedAssignees.includes(assignee.name);
                return (
                  <button
                    key={assignee.name}
                    type="button"
                    onClick={() => toggleAssignee(assignee.name)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm ring-1 ring-amber-400/40'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-amber-400 text-wazir-midnight' : assignee.avatarBg
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : assignee.initials}
                    </div>
                    <span className="truncate">{assignee.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline Date & Time Picker + Quick Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Deadline Date &amp; Time *
              </label>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">Quick:</span>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(6)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700"
                >
                  In 6 hrs
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(24)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700"
                >
                  In 24 hrs
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadline(72)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700"
                >
                  In 3 days
                </button>
              </div>
            </div>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none" />
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-900 border border-wazir-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Context &amp; Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline deliverables, objectives, review steps, or dependencies..."
              className="w-full bg-slate-900 border border-wazir-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none font-normal"
            />
          </div>

          {/* Checklist / Subtasks Builder */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-sky-400" />
                Deliverable Checklist ({subtasks.length})
              </span>
            </label>
            
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Add sub-deliverable or milestone..."
                className="flex-1 bg-slate-900 border border-wazir-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
              <button
                type="button"
                onClick={() => handleAddSubtask()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between gap-2 bg-slate-900 p-2 rounded-lg border border-slate-800 text-xs text-slate-200"
                  >
                    <span className="truncate">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Initial Workflow Column
            </label>
            <div className="grid grid-cols-4 gap-2">
              {STATUSES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    status === st.id
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-wazir-border/60">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-wazir-midnight font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{isSubmitting ? 'Creating...' : 'Create Deliverable'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
