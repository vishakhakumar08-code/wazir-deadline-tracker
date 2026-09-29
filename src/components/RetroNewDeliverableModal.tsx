'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { VERTICALS, ASSIGNEES, PRIORITIES, STATUSES } from '@/lib/constants';
import { Vertical, Assignee, TaskPriority, TaskStatus } from '@/types/task';
import { toDatetimeLocalString } from '@/lib/deadlineUtils';
import { X, Save, Clock, Users } from 'lucide-react';

export const RetroNewDeliverableModal: React.FC = () => {
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
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('To Do');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    d.setHours(23, 59, 0, 0);
    return toDatetimeLocalString(d);
  });

  const [isFullTeam, setIsFullTeam] = useState(false);
  const [selectedAssignees, setSelectedAssignees] = useState<Assignee[]>(() =>
    prefilledAssignee ? [prefilledAssignee] : []
  );

  if (!isCreateModalOpen) return null;

  const handleToggleAssignee = (name: Assignee) => {
    if (selectedAssignees.includes(name)) {
      setSelectedAssignees(selectedAssignees.filter((a) => a !== name));
    } else {
      setSelectedAssignees([...selectedAssignees, name]);
    }
  };

  const handleRequestExtension = () => {
    const curr = new Date(deadline);
    if (!isNaN(curr.getTime())) {
      curr.setDate(curr.getDate() + 3);
      setDeadline(toDatetimeLocalString(curr));
      showToast('Extended target deadline by +3 days!', 'info');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a deliverable title', 'warning');
      return;
    }

    const finalAssignees: Assignee[] = isFullTeam
      ? ASSIGNEES.map((a) => a.name)
      : selectedAssignees;

    await addTask({
      title: title.trim(),
      description: description.trim(),
      vertical,
      priority,
      status,
      deadline: new Date(deadline).toISOString(),
      assignees: finalAssignees,
      subtasks: [],
      resources: [],
    });

    // Reset and Close
    setTitle('');
    setDescription('');
    setSelectedAssignees([]);
    setIsFullTeam(false);
    setIsCreateModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#60A5FA] border-2 md:border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden">
        {/* Retro Window Top Bar (Grey with Black Border) */}
        <div className="bg-[#CBD5E1] border-b-2 border-black px-4 py-2 flex items-center justify-between font-pixel text-xs text-black font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-black inline-block" />
            <span className="tracking-wider">NEW DELIVERABLE</span>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(false)}
            className="w-6 h-6 bg-white hover:bg-red-500 hover:text-white border-2 border-black flex items-center justify-center font-pixel text-xs text-black transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Interior (Solid Blue) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Deliverable Title */}
          <div>
            <label className="block font-pixel text-[11px] text-black uppercase mb-1 font-bold">
              Deliverable Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="deliverable title..."
              className="w-full bg-white border-2 border-black p-2.5 font-serif text-slate-900 placeholder:text-slate-400 focus:outline-none text-base shadow-[2px_2px_0px_0px_#000000]"
            />
          </div>

          {/* Vertical & Priority Side-by-Side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-[10px] text-black uppercase mb-1 font-bold">
                Vertical
              </label>
              <select
                value={vertical}
                onChange={(e) => setVertical(e.target.value as Vertical)}
                className="w-full bg-white border-2 border-black p-2 font-serif text-sm text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              >
                {VERTICALS.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-pixel text-[10px] text-black uppercase mb-1 font-bold">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white border-2 border-black p-2 font-serif text-sm text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Deadline */}
          <div>
            <label className="block font-pixel text-[10px] text-black uppercase mb-1 font-bold">
              Target Deadline
            </label>
            <input
              type="datetime-local"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-white border-2 border-black p-2 font-serif text-sm text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            />
          </div>

          {/* Team Member Assignment with "full team" Checkbox */}
          <div className="bg-white/90 border-2 border-black p-3 space-y-2.5 shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[10px] text-black uppercase font-bold">
                Team Member Assignment
              </span>

              {/* Full Team Checkbox */}
              <label className="flex items-center gap-1.5 font-pixel text-[10px] text-black cursor-pointer bg-amber-200 border border-black px-2 py-0.5 shadow-[1px_1px_0px_0px_#000000]">
                <input
                  type="checkbox"
                  checked={isFullTeam}
                  onChange={(e) => setIsFullTeam(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black cursor-pointer"
                />
                <span>full team</span>
              </label>
            </div>

            {isFullTeam ? (
              <p className="font-serif italic text-xs text-slate-600 bg-slate-100 p-2 border border-slate-300">
                ✓ All 10 junior members assigned to this deliverable.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 max-h-32 overflow-y-auto p-1">
                {ASSIGNEES.map((assignee) => {
                  const isSelected = selectedAssignees.includes(assignee.name);
                  return (
                    <button
                      key={assignee.name}
                      type="button"
                      onClick={() => handleToggleAssignee(assignee.name)}
                      className={`p-1 text-center font-serif text-xs border transition-colors cursor-pointer truncate ${
                        isSelected
                          ? 'bg-black text-white border-black font-bold'
                          : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {assignee.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Work Stage Dropdown */}
          <div>
            <label className="block font-pixel text-[10px] text-black uppercase mb-1 font-bold">
              Work Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full bg-white border-2 border-black p-2 font-serif text-sm text-slate-900 focus:outline-none shadow-[2px_2px_0px_0px_#000000] cursor-pointer"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Complete</option>
            </select>
          </div>

          {/* Action Buttons: Yellow "request extension" & Green "SAVE" */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleRequestExtension}
              className="bg-[#FACC15] text-black border-2 border-black font-pixel text-[11px] py-2 px-3.5 shadow-[3px_3px_0px_0px_#000000] hover:bg-[#EAB308] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer font-bold"
            >
              request extension
            </button>

            <button
              type="submit"
              className="bg-[#4ADE80] text-black border-2 border-black font-pixel text-xs py-2 px-5 shadow-[3px_3px_0px_0px_#000000] hover:bg-[#22C55E] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer font-bold"
            >
              <Save className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>SAVE</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
