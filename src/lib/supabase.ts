import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Task } from '@/types/task';

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export function getSupabaseCredentials(): { url: string; anonKey: string; isConfigured: boolean } {
  // 1. Check environment variables
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey && !envUrl.includes('your-project-ref')) {
    return { url: envUrl, anonKey: envKey, isConfigured: true };
  }

  // 2. Check browser localStorage override (for custom config modal)
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('wazir_supabase_url') || '';
    const localKey = localStorage.getItem('wazir_supabase_key') || '';
    if (localUrl && localKey) {
      return { url: localUrl, anonKey: localKey, isConfigured: true };
    }
  }

  return { url: envUrl, anonKey: envKey, isConfigured: false };
}

function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.includes('.')) {
    return `https://${trimmed}`;
  }
  return `https://${trimmed}.supabase.co`;
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  if (!isConfigured || !url || !anonKey) {
    return null;
  }

  const validUrl = normalizeUrl(url);

  if (cachedClient && cachedUrl === validUrl && cachedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(validUrl, anonKey, {
      auth: { persistSession: false },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    cachedUrl = validUrl;
    cachedKey = anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

export async function fetchTasksFromSupabase(): Promise<Task[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('Error fetching tasks from Supabase:', error);
      return null;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      vertical: row.vertical,
      assignees: Array.isArray(row.assignees) ? row.assignees : [],
      status: row.status,
      priority: row.priority,
      deadline: row.deadline,
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      resources: Array.isArray(row.resources) ? row.resources : [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    console.error('Unexpected error fetching from Supabase:', err);
    return null;
  }
}

export async function createTaskInSupabase(task: Omit<Task, 'created_at' | 'updated_at'>): Promise<Task | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('tasks')
      .insert({
        id: task.id,
        title: task.title,
        description: task.description,
        vertical: task.vertical,
        assignees: task.assignees,
        status: task.status,
        priority: task.priority,
        deadline: task.deadline,
        subtasks: task.subtasks,
        resources: task.resources || [],
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task in Supabase:', error);
      return null;
    }

    return data as Task;
  } catch (err) {
    console.error('Exception creating task in Supabase:', err);
    return null;
  }
}

export async function updateTaskInSupabase(id: string, updates: Partial<Task>): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const payload: any = { ...updates };
    delete payload.created_at;
    delete payload.updated_at;

    const { error } = await client
      .from('tasks')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('Error updating task in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception updating task in Supabase:', err);
    return false;
  }
}

export async function deleteTaskInSupabase(id: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Exception deleting task in Supabase:', err);
    return false;
  }
}

/**
 * Setup Realtime channel subscription for live sync across all users and tabs
 */
export function subscribeToTaskChanges(
  onInsert: (task: Task) => void,
  onUpdate: (task: Task) => void,
  onDelete: (taskId: string) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR') => void
): RealtimeChannel | null {
  const client = getSupabaseClient();
  if (!client) return null;

  const channel = client
    .channel('wazir-tasks-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        if (payload.new) {
          const raw = payload.new as any;
          onInsert({
            id: raw.id,
            title: raw.title,
            description: raw.description || '',
            vertical: raw.vertical,
            assignees: Array.isArray(raw.assignees) ? raw.assignees : [],
            status: raw.status,
            priority: raw.priority,
            deadline: raw.deadline,
            subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
            resources: Array.isArray(raw.resources) ? raw.resources : [],
            created_at: raw.created_at,
            updated_at: raw.updated_at,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        if (payload.new) {
          const raw = payload.new as any;
          onUpdate({
            id: raw.id,
            title: raw.title,
            description: raw.description || '',
            vertical: raw.vertical,
            assignees: Array.isArray(raw.assignees) ? raw.assignees : [],
            status: raw.status,
            priority: raw.priority,
            deadline: raw.deadline,
            subtasks: Array.isArray(raw.subtasks) ? raw.subtasks : [],
            resources: Array.isArray(raw.resources) ? raw.resources : [],
            created_at: raw.created_at,
            updated_at: raw.updated_at,
          });
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
      },
      (payload) => {
        if (payload.old && payload.old.id) {
          onDelete(payload.old.id);
        }
      }
    )
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status);
      }
    });

  return channel;
}
