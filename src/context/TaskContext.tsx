'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Task, TaskFilterState, ViewMode, TaskStatus, Assignee, Vertical, TaskPriority, MemberStats } from '@/types/task';
import { INITIAL_TASKS } from '@/lib/initialData';
import { ASSIGNEES } from '@/lib/constants';
import { getDeadlineInfo } from '@/lib/deadlineUtils';
import {
  getSupabaseCredentials,
  fetchTasksFromSupabase,
  createTaskInSupabase,
  updateTaskInSupabase,
  deleteTaskInSupabase,
  subscribeToTaskChanges,
} from '@/lib/supabase';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filters: TaskFilterState;
  setFilter: (key: keyof TaskFilterState, value: any) => void;
  resetFilters: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  
  // Real-time Supabase state
  isSupabaseConfigured: boolean;
  realtimeStatus: 'SUBSCRIBED' | 'DISCONNECTED' | 'LOCAL_DEMO' | 'CONNECTING' | 'ERROR';
  lastSyncTime: Date | null;
  reconnectSupabase: () => void;

  // Task Actions
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTaskStatus: (id: string, newStatus: TaskStatus) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Modals & Selection
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isSqlModalOpen: boolean;
  setIsSqlModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  prefilledAssignee: Assignee | null;
  openCreateModalWithAssignee: (assignee: Assignee) => void;

  // Computed Analytics
  memberStats: MemberStats[];
  stats: {
    total: number;
    urgent: number;
    overdue: number;
    due24h: number;
    completed: number;
    inProgress: number;
    inReview: number;
    backlog: number;
    completionRate: number;
  };

  // Notification Toast
  toast: { message: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

const initialFilters: TaskFilterState = {
  vertical: 'ALL',
  assignee: 'ALL',
  priority: 'ALL',
  status: 'ALL',
  urgency: 'ALL',
  searchQuery: '',
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'SUBSCRIBED' | 'DISCONNECTED' | 'LOCAL_DEMO' | 'CONNECTING' | 'ERROR'>('CONNECTING');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prefilledAssignee, setPrefilledAssignee] = useState<Assignee | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Initialize and load data
  const loadData = useCallback(async () => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConfigured(creds.isConfigured);

    if (creds.isConfigured) {
      setRealtimeStatus('CONNECTING');
      const supabaseTasks = await fetchTasksFromSupabase();
      if (supabaseTasks && supabaseTasks.length > 0) {
        setTasks(supabaseTasks);
        setLastSyncTime(new Date());
        setRealtimeStatus('SUBSCRIBED');
        return;
      } else if (supabaseTasks && supabaseTasks.length === 0) {
        // Table exists but is empty -> load initial seed or empty
        setTasks(INITIAL_TASKS);
        setLastSyncTime(new Date());
        setRealtimeStatus('SUBSCRIBED');
        return;
      }
    }

    // Fallback to local storage or INITIAL_TASKS
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('wazir_tasks_backup');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTasks(parsed);
            setRealtimeStatus('LOCAL_DEMO');
            setLastSyncTime(new Date());
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached local tasks', e);
        }
      }
    }

    setTasks(INITIAL_TASKS);
    setRealtimeStatus('LOCAL_DEMO');
    setLastSyncTime(new Date());
  }, []);

  // Setup Supabase Real-time Listener
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      return;
    }

    const channel = subscribeToTaskChanges(
      (inserted) => {
        setTasks((prev) => {
          if (prev.some((t) => t.id === inserted.id)) return prev;
          return [inserted, ...prev];
        });
        setLastSyncTime(new Date());
        showToast(`⚡ New task added: "${inserted.title}"`, 'info');
      },
      (updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setLastSyncTime(new Date());
      },
      (deletedId) => {
        setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        setLastSyncTime(new Date());
        showToast('Task removed', 'warning');
      },
      (status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('SUBSCRIBED');
        } else if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('ERROR');
        } else {
          setRealtimeStatus('DISCONNECTED');
        }
      }
    );

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [isSupabaseConfigured, showToast]);

  // Persist backup to LocalStorage for offline resilience
  useEffect(() => {
    if (typeof window !== 'undefined' && tasks.length > 0) {
      localStorage.setItem('wazir_tasks_backup', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Filter modifier
  const setFilter = (key: keyof TaskFilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  // Open Create Modal with prefilled assignee
  const openCreateModalWithAssignee = (assignee: Assignee) => {
    setPrefilledAssignee(assignee);
    setIsCreateModalOpen(true);
  };

  // CRUD Operations with Optimistic Updates & Supabase Sync
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic UI update
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Created "${newTask.title}"`, 'success');

    if (isSupabaseConfigured) {
      const created = await createTaskInSupabase(newTask);
      if (created) {
        setTasks((prev) => prev.map((t) => (t.id === newTask.id ? created : t)));
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: now } : t))
    );

    if (selectedTask?.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates, updated_at: now } : null));
    }

    if (isSupabaseConfigured) {
      await updateTaskInSupabase(id, updates);
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
    showToast(`Deleted "${taskToDelete?.title || 'Task'}"`, 'warning');

    if (isSupabaseConfigured) {
      await deleteTaskInSupabase(id);
    }
  };

  const moveTaskStatus = async (id: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === newStatus) return;

    await updateTask(id, { status: newStatus });
    if (newStatus === 'Completed') {
      showToast(`🎉 "${task.title}" marked as Completed!`, 'success');
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Vertical filter
      if (filters.vertical !== 'ALL' && task.vertical !== filters.vertical) {
        return false;
      }

      // 2. Assignee filter
      if (filters.assignee === 'UNASSIGNED') {
        if (task.assignees && task.assignees.length > 0) return false;
      } else if (filters.assignee !== 'ALL') {
        if (!task.assignees || !task.assignees.includes(filters.assignee)) {
          return false;
        }
      }

      // 3. Priority filter
      if (filters.priority !== 'ALL' && task.priority !== filters.priority) {
        return false;
      }

      // 4. Status filter
      if (filters.status !== 'ALL' && task.status !== filters.status) {
        return false;
      }

      // 5. Urgency / Deadline filter
      if (filters.urgency !== 'ALL') {
        const info = getDeadlineInfo(task.deadline, task.status);
        if (filters.urgency === 'overdue' && !info.isOverdue) return false;
        if (filters.urgency === 'due_soon' && !info.isDueSoon) return false;
        if (filters.urgency === 'upcoming' && !info.isUpcoming) return false;
      }

      // 6. Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesVertical = task.vertical.toLowerCase().includes(q);
        const matchesAssignees = task.assignees.some((a) => a.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesVertical && !matchesAssignees) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Executive KPI Summary computation
  const stats = useMemo(() => {
    let urgent = 0;
    let overdue = 0;
    let due24h = 0;
    let completed = 0;
    let inProgress = 0;
    let inReview = 0;
    let backlog = 0;

    tasks.forEach((task) => {
      if (task.status === 'Completed') completed++;
      if (task.status === 'In Progress') inProgress++;
      if (task.status === 'Review') inReview++;
      if (task.status === 'Backlog') backlog++;

      if (task.priority === 'Urgent' && task.status !== 'Completed') urgent++;

      const info = getDeadlineInfo(task.deadline, task.status);
      if (info.isOverdue) overdue++;
      if (info.isDueSoon) due24h++;
    });

    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      urgent,
      overdue,
      due24h,
      completed,
      inProgress,
      inReview,
      backlog,
      completionRate,
    };
  }, [tasks]);

  // Member Matrix Analytics computation (for all 10 assignees)
  const memberStats: MemberStats[] = useMemo(() => {
    return ASSIGNEES.map((assignee) => {
      const memberTasks = tasks.filter((t) => t.assignees && t.assignees.includes(assignee.name));
      const total = memberTasks.length;
      let inProgress = 0;
      let inReview = 0;
      let completed = 0;
      let overdue = 0;
      let dueSoon = 0;

      memberTasks.forEach((t) => {
        if (t.status === 'Completed') completed++;
        if (t.status === 'In Progress') inProgress++;
        if (t.status === 'Review') inReview++;

        const info = getDeadlineInfo(t.deadline, t.status);
        if (info.isOverdue) overdue++;
        if (info.isDueSoon) dueSoon++;
      });

      const active = total - completed;
      // Workload score calculation based on active tasks & urgency
      const workloadScore = inProgress * 2 + inReview * 1.5 + overdue * 3 + dueSoon * 2;

      return {
        member: assignee.name,
        total,
        active,
        inProgress,
        inReview,
        completed,
        overdue,
        dueSoon,
        workloadScore,
      };
    });
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        filters,
        setFilter,
        resetFilters,
        viewMode,
        setViewMode,
        isSupabaseConfigured,
        realtimeStatus,
        lastSyncTime,
        reconnectSupabase: loadData,
        addTask,
        updateTask,
        deleteTask,
        moveTaskStatus,
        toggleSubtask,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isSqlModalOpen,
        setIsSqlModalOpen,
        isExportModalOpen,
        setIsExportModalOpen,
        selectedTask,
        setSelectedTask,
        prefilledAssignee,
        openCreateModalWithAssignee,
        memberStats,
        stats,
        toast,
        showToast,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
