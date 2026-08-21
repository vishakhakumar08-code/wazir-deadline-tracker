import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Task } from '@/types/task';

let cachedClient: SupabaseClient | null = null;
let cachedUrl: string | null = null;
let cachedKey: string | null = null;

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

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

export interface SupabaseResponse<T> {
  data: T | null;
  error: any | null;
}

export async function fetchTasksFromSupabase(): Promise<SupabaseResponse<Task[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('deadline', { ascending: true });

    if (error) {
      console.error('[Supabase fetch error]:', error);
      return { data: null, error };
    }

    const tasks: Task[] = (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description || '',
      vertical: row.vertical,
      assignees: Array.isArray(row.assignees) ? row.assignees : [],
      status: row.status === 'Backlog' ? 'To Do' : row.status,
      priority: row.priority,
      deadline: row.deadline,
      subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
      resources: Array.isArray(row.resources) ? row.resources : [],
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return { data: tasks, error: null };
  } catch (err: any) {
    console.error('[Supabase fetch exception]:', err);
    return { data: null, error: err };
  }
}

export async function createTaskInSupabase(task: Omit<Task, 'created_at' | 'updated_at'>): Promise<SupabaseResponse<Task>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const insertPayload: any = {
      title: task.title,
      description: task.description || '',
      vertical: task.vertical,
      assignees: task.assignees || [],
      status: task.status,
      priority: task.priority,
      deadline: task.deadline,
      subtasks: task.subtasks || [],
      resources: task.resources || [],
    };

    // If task has a valid UUID format, pass it, otherwise let Supabase default to gen_random_uuid()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (task.id && uuidRegex.test(task.id)) {
      insertPayload.id = task.id;
    }

    const { data, error } = await client
      .from('tasks')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[Supabase insert error]:', error);
      return { data: null, error };
    }

    const createdTask: Task = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      vertical: data.vertical,
      assignees: Array.isArray(data.assignees) ? data.assignees : [],
      status: data.status,
      priority: data.priority,
      deadline: data.deadline,
      subtasks: Array.isArray(data.subtasks) ? data.subtasks : [],
      resources: Array.isArray(data.resources) ? data.resources : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
    };

    return { data: createdTask, error: null };
  } catch (err: any) {
    console.error('[Supabase insert exception]:', err);
    return { data: null, error: err };
  }
}

export async function updateTaskInSupabase(id: string, updates: Partial<Task>): Promise<SupabaseResponse<boolean>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const payload: any = { ...updates };
    delete payload.created_at;
    delete payload.updated_at;

    const { error } = await client
      .from('tasks')
      .update(payload)
      .eq('id', id);

    if (error) {
      console.error('[Supabase update error]:', error);
      return { data: false, error };
    }
    return { data: true, error: null };
  } catch (err: any) {
    console.error('[Supabase update exception]:', err);
    return { data: false, error: err };
  }
}

export async function deleteTaskInSupabase(id: string): Promise<SupabaseResponse<boolean>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const { error } = await client
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase delete error]:', error);
      return { data: false, error };
    }
    return { data: true, error: null };
  } catch (err: any) {
    console.error('[Supabase delete exception]:', err);
    return { data: false, error: err };
  }
}

// Attendance Supabase Helpers
export async function fetchAttendanceFromSupabase(dateStr: string): Promise<SupabaseResponse<any[]>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const { data, error } = await client
      .from('attendance')
      .select('*')
      .eq('date', dateStr);

    if (error) {
      console.error('[Supabase fetch attendance error]:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (err: any) {
    console.error('[Supabase fetch attendance exception]:', err);
    return { data: null, error: err };
  }
}

export async function upsertAttendanceToSupabase(record: {
  member_name: string;
  date: string;
  status: string;
  notes?: string;
}): Promise<SupabaseResponse<any>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const payload = {
      member_name: record.member_name,
      date: record.date,
      status: record.status,
      notes: record.notes || '',
    };

    const { data, error } = await client
      .from('attendance')
      .upsert(payload, { onConflict: 'member_name,date' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase upsert attendance error]:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('[Supabase upsert attendance exception]:', err);
    return { data: null, error: err };
  }
}

export async function bulkUpsertAttendanceToSupabase(records: {
  member_name: string;
  date: string;
  status: string;
  notes?: string;
}[]): Promise<SupabaseResponse<boolean>> {
  const client = getSupabaseClient();
  if (!client) {
    return { data: null, error: new Error('Supabase client is not configured') };
  }

  try {
    const { error } = await client
      .from('attendance')
      .upsert(records, { onConflict: 'member_name,date' });

    if (error) {
      console.error('[Supabase bulk upsert attendance error]:', error);
      return { data: false, error };
    }

    return { data: true, error: null };
  } catch (err: any) {
    console.error('[Supabase bulk upsert attendance exception]:', err);
    return { data: false, error: err };
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
            status: raw.status === 'Backlog' ? 'To Do' : raw.status,
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
            status: raw.status === 'Backlog' ? 'To Do' : raw.status,
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
