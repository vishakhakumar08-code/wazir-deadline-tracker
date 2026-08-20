'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import {
  X,
  Database,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Radio,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';

const SQL_SCHEMA_CONTENT = `-- ==============================================================================
-- WAZIR - The Strategy & Consulting Club
-- Real-Time Deadline Tracker Database Schema & Seed Data
-- ==============================================================================

-- 1. Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    vertical TEXT NOT NULL CHECK (vertical IN ('Editorial', 'Public Relations', 'Events', 'Casebook', 'Apex', 'External Relations')),
    assignees TEXT[] NOT NULL DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'Backlog' CHECK (status IN ('Backlog', 'In Progress', 'Review', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Urgent', 'High', 'Medium', 'Low')),
    deadline TIMESTAMPTZ NOT NULL,
    subtasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    resources TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Attach trigger to tasks table
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 5. Create policy to allow all operations for club members using anon key
DROP POLICY IF EXISTS "Public access to tasks for Wazir members" ON public.tasks;
CREATE POLICY "Public access to tasks for Wazir members"
    ON public.tasks
    FOR ALL
    TO public
    USING (true)
    WITH CHECK (true);

-- 6. Enable Realtime publication for the tasks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'tasks'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    END IF;
END $$;

-- 7. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_vertical ON public.tasks(vertical);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);`;

export const SqlSetupModal: React.FC = () => {
  const {
    isSqlModalOpen,
    setIsSqlModalOpen,
    realtimeStatus,
    reconnectSupabase,
    showToast,
  } = useTaskContext();

  const [copied, setCopied] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [activeTab, setActiveTab] = useState<'sql' | 'env'>('sql');

  if (!isSqlModalOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CONTENT);
    setCopied(true);
    showToast('SQL Schema copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !anonKey.trim()) {
      showToast('Please enter both Supabase URL and Anon Key', 'warning');
      return;
    }

    localStorage.setItem('wazir_supabase_url', supabaseUrl.trim());
    localStorage.setItem('wazir_supabase_key', anonKey.trim());
    showToast('Supabase credentials saved! Connecting...', 'success');
    reconnectSupabase();
    setIsSqlModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-wazir-card border border-wazir-border rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-wazir-border/60 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                Supabase Real-Time Backend Setup
              </h3>
              <p className="text-xs text-slate-400">
                SQL schema, Realtime publication &amp; Vercel deployment credentials
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSqlModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-wazir-border/60 px-6 bg-slate-900/40">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>1. SQL Schema Script</span>
          </button>

          <button
            onClick={() => setActiveTab('env')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'env'
                ? 'border-sky-500 text-sky-400 bg-sky-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>2. Connection Keys &amp; Vercel Env</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[calc(100vh-240px)] overflow-y-auto scrollbar-thin">
          {activeTab === 'sql' ? (
            <div className="space-y-4">
              {/* Instructions Callout */}
              <div className="p-4 rounded-2xl bg-sky-950/30 border border-sky-500/30 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-sky-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Quick Supabase Setup in 30 Seconds:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>
                    Open your project dashboard on{' '}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 underline font-medium inline-flex items-center gap-0.5"
                    >
                      supabase.com <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </li>
                  <li>Click on the <strong>SQL Editor</strong> tab on the left sidebar.</li>
                  <li>Paste the script below and click <strong>Run</strong>.</li>
                  <li>This creates the table, enables <strong>Row Level Security</strong>, and adds the table to <strong>Realtime Replication</strong>.</li>
                </ol>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400">supabase/schema.sql</span>
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-semibold transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[300px] leading-relaxed">
                  <code>{SQL_SCHEMA_CONTENT}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2">
                <p className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Vercel &amp; Local Environment Variables
                </p>
                <p className="text-slate-400">
                  To deploy on Vercel or run locally with Supabase, add these environment variables in your Vercel Project Settings or <code className="text-amber-300">.env.local</code>:
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 select-all">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co<br />
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
                </div>
              </div>

              {/* Direct Browser Credential Override */}
              <form onSubmit={handleSaveCredentials} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h4 className="text-sm font-bold text-white font-heading">
                  Direct Live Connect (In-Browser)
                </h4>
                <p className="text-xs text-slate-400">
                  You can also paste your Supabase keys directly below to connect this browser session immediately without redeploying.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">
                    Supabase Anon Public Key
                  </label>
                  <input
                    type="text"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                  >
                    Save &amp; Connect Real-Time
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
