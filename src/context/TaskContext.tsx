'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  Task,
  TaskFilterState,
  ViewMode,
  TaskStatus,
  Assignee,
  Vertical,
  TaskPriority,
  MemberStats,
  MemberProfile,
} from '@/types/task';
import { INITIAL_TASKS } from '@/lib/initialData';
import { ASSIGNEES } from '@/lib/constants';
import { getDeadlineInfo, sortTasksByDeadline } from '@/lib/deadlineUtils';
import {
  generateUUID,
  getSupabaseCredentials,
  fetchTasksFromSupabase,
  createTaskInSupabase,
  updateTaskInSupabase,
  deleteTaskInSupabase,
  subscribeToTaskChanges,
  fetchMembersFromSupabase,
  upsertMemberAvatarInSupabase,
  subscribeToMemberChanges,
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
  isArchiveModalOpen: boolean;
  setIsArchiveModalOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  prefilledAssignee: Assignee | null;
  openCreateModalWithAssignee: (assignee: Assignee) => void;

  // Member Avatars & Profiles
  memberAvatars: Record<string, string>;
  getMemberAvatar: (name: string) => string | undefined;
  updateMemberAvatar: (name: Assignee, avatarUrl: string) => Promise<void>;
  editingMemberForAvatar: Assignee | null;
  setEditingMemberForAvatar: (member: Assignee | null) => void;

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
    toDo: number;
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
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [prefilledAssignee, setPrefilledAssignee] = useState<Assignee | null>(null);

  // Member Avatars
  const [memberAvatars, setMemberAvatars] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('wazir_member_avatars');
        if (cached) return JSON.parse(cached);
      } catch (e) {}
    }
    return {};
  });
  const [editingMemberForAvatar, setEditingMemberForAvatar] = useState<Assignee | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 5000);
  }, []);

  // Initialize and load data directly from Supabase
  const loadData = useCallback(async () => {
    const creds = getSupabaseCredentials();
    setIsSupabaseConfigured(creds.isConfigured);

    // Also fetch member profiles
    if (creds.isConfigured) {
      fetchMembersFromSupabase().then(({ data }) => {
        if (data && Array.isArray(data)) {
          const map: Record<string, string> = {};
          data.forEach((m) => {
            if (m.name && m.avatar_url) {
              map[m.name] = m.avatar_url;
            }
          });
          setMemberAvatars((prev) => {
            const combined = { ...prev, ...map };
            if (typeof window !== 'undefined') {
              localStorage.setItem('wazir_member_avatars', JSON.stringify(combined));
            }
            return combined;
          });
        }
      });
    }

    if (creds.isConfigured) {
      setRealtimeStatus('CONNECTING');
      const { data, error } = await fetchTasksFromSupabase();

      if (error) {
        console.error('[Supabase Load Error]:', error);
        setRealtimeStatus('ERROR');
        showToast(`Supabase Connection: ${error.message || 'Failed to fetch tasks'}`, 'error');
        // Fallback to local storage if available when network/credentials fail
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('wazir_tasks_backup');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                const normalized = parsed.map((t: any) => ({
                  ...t,
                  status: t.status === 'Backlog' ? 'To Do' : t.status,
                }));
                setTasks(normalized);
              }
            } catch (e) {}
          }
        }
        return;
      }

      if (data !== null) {
        const normalized = data.map((t: any) => ({
          ...t,
          status: t.status === 'Backlog' ? 'To Do' : t.status,
        }));
        setTasks(normalized);
        setLastSyncTime(new Date());
        setRealtimeStatus('SUBSCRIBED');
        return;
      }
    }

    // Supabase not configured -> Local Sandbox Mode
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('wazir_tasks_backup');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            const normalized = parsed.map((t: any) => ({
              ...t,
              status: t.status === 'Backlog' ? 'To Do' : t.status,
            }));
            setTasks(normalized);
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
  }, [showToast]);

  // Setup Supabase Real-time Listener
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (!creds.isConfigured) {
      return;
    }

    const taskChannel = subscribeToTaskChanges(
      (inserted) => {
        setTasks((prev) => {
          if (prev.some((t) => t.id === inserted.id)) {
            return prev.map((t) => (t.id === inserted.id ? inserted : t));
          }
          return [inserted, ...prev];
        });
        setLastSyncTime(new Date());
        showToast(`⚡ Live deliverable synced: "${inserted.title}"`, 'info');
      },
      (updated) => {
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setLastSyncTime(new Date());
      },
      (deletedId) => {
        setTasks((prev) => prev.filter((t) => t.id !== deletedId));
        setLastSyncTime(new Date());
        showToast('Deliverable removed', 'warning');
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

    const memberChannel = subscribeToMemberChanges((member) => {
      setMemberAvatars((prev) => {
        const next = { ...prev, [member.name]: member.avatar_url || '' };
        if (typeof window !== 'undefined') {
          localStorage.setItem('wazir_member_avatars', JSON.stringify(next));
        }
        return next;
      });
    });

    return () => {
      if (taskChannel) taskChannel.unsubscribe();
      if (memberChannel) memberChannel.unsubscribe();
    };
  }, [isSupabaseConfigured, showToast]);

  // Persist backup to LocalStorage for offline resilience
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wazir_tasks_backup', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Avatar helper
  const getMemberAvatar = useCallback((name: string): string | undefined => {
    return memberAvatars[name] || undefined;
  }, [memberAvatars]);

  const updateMemberAvatar = useCallback(async (name: Assignee, avatarUrl: string) => {
    // 1. Optimistic UI update
    setMemberAvatars((prev) => {
      const next = { ...prev, [name]: avatarUrl };
      if (typeof window !== 'undefined') {
        localStorage.setItem('wazir_member_avatars', JSON.stringify(next));
      }
      return next;
    });

    // 2. Persist to Supabase
    const { error } = await upsertMemberAvatarInSupabase(name, avatarUrl);
    if (error) {
      console.error('[Supabase member avatar update error]:', error);
      // Still preserved locally
    }
    showToast(`Updated avatar for ${name}!`, 'success');
  }, [showToast]);

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

  // CRUD Operations with Direct Supabase Calls & Error Handling
  const addTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    const validUUID = generateUUID();
    const newTask: Task = {
      ...taskData,
      status: taskData.status === ('Backlog' as any) ? 'To Do' : taskData.status,
      id: validUUID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistic Update
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Deliverable "${newTask.title}" added!`, 'success');

    if (isSupabaseConfigured) {
      const { data, error } = await createTaskInSupabase(newTask);
      if (error) {
        console.error('[Supabase addTask error]:', error);
        showToast(`Saved locally (Supabase: ${error.message || 'Insert failed'})`, 'warning');
      } else if (data) {
        setTasks((prev) => prev.map((t) => (t.id === validUUID ? data : t)));
      }
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const normalizedUpdates = {
      ...updates,
      status: updates.status === ('Backlog' as any) ? 'To Do' : updates.status,
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...normalizedUpdates } : t))
    );

    if (selectedTask && selectedTask.id === id) {
      setSelectedTask((prev) => (prev ? { ...prev, ...normalizedUpdates } : null));
    }

    if (isSupabaseConfigured) {
      const { error } = await updateTaskInSupabase(id, normalizedUpdates);
      if (error) {
        console.error('[Supabase updateTask error]:', error);
        showToast(`Updated locally (Supabase: ${error.message || 'Update failed'})`, 'warning');
      }
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
    showToast(`Deliverable deleted`, 'info');

    if (isSupabaseConfigured) {
      const { error } = await deleteTaskInSupabase(id);
      if (error) {
        console.error('[Supabase deleteTask error]:', error);
        showToast(`Deleted locally (Supabase: ${error.message || 'Delete failed'})`, 'warning');
      }
    }
  };

  const moveTaskStatus = async (id: string, newStatus: TaskStatus) => {
    await updateTask(id, { status: newStatus });
    showToast(`Status updated to ${newStatus}`, 'info');
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    await updateTask(taskId, { subtasks: updatedSubtasks });
  };

  const reconnectSupabase = () => {
    loadData();
    showToast('Re-syncing with Supabase real-time backend...', 'info');
  };

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    const result = tasks.filter((task) => {
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
        const matchesAssignees = task.assignees && task.assignees.some((a) => a.toLowerCase().includes(q));
        const matchesSubtasks = task.subtasks && task.subtasks.some((st) => st.title.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesVertical && !matchesAssignees && !matchesSubtasks) {
          return false;
        }
      }

      return true;
    });

    return sortTasksByDeadline(result);
  }, [tasks, filters]);

  // Executive KPI Summary computation
  const stats = useMemo(() => {
    const total = tasks.length;
    let urgent = 0;
    let overdue = 0;
    let due24h = 0;
    let completed = 0;
    let inProgress = 0;
    let inReview = 0;
    let toDo = 0;

    tasks.forEach((t) => {
      const dInfo = getDeadlineInfo(t.deadline, t.status);
      if (t.priority === 'Urgent') urgent++;
      if (dInfo.isOverdue && t.status !== 'Completed') overdue++;
      if (dInfo.isDueSoon && t.status !== 'Completed') due24h++;
      if (t.status === 'Completed') completed++;
      if (t.status === 'In Progress') inProgress++;
      if (t.status === 'Review') inReview++;
      if (t.status === 'To Do' || (t.status as any) === 'Backlog') toDo++;
    });

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      urgent,
      overdue,
      due24h,
      completed,
      inProgress,
      inReview,
      toDo,
      backlog: toDo,
      completionRate,
    };
  }, [tasks]);

  // Member Workload & Matrix Computation
  const memberStats: MemberStats[] = useMemo(() => {
    return ASSIGNEES.map((assignee) => {
      const memberTasks = tasks.filter((t) => t.assignees && t.assignees.includes(assignee.name));
      const total = memberTasks.length;
      let active = 0;
      let inProgress = 0;
      let inReview = 0;
      let completed = 0;
      let overdue = 0;
      let dueSoon = 0;

      memberTasks.forEach((t) => {
        const dInfo = getDeadlineInfo(t.deadline, t.status);
        if (t.status === 'Completed') {
          completed++;
        } else {
          active++;
          if (t.status === 'In Progress') inProgress++;
          if (t.status === 'Review') inReview++;
          if (dInfo.isOverdue) overdue++;
          if (dInfo.isDueSoon) dueSoon++;
        }
      });

      // Workload Score Calculation: weight overdue heavily, then dueSoon, then active
      const workloadScore = (overdue * 3) + (dueSoon * 2) + active;

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
        reconnectSupabase,
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
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        selectedTask,
        setSelectedTask,
        prefilledAssignee,
        openCreateModalWithAssignee,
        memberAvatars,
        getMemberAvatar,
        updateMemberAvatar,
        editingMemberForAvatar,
        setEditingMemberForAvatar,
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
