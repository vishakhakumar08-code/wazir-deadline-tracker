'use client';

import React, { useState, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { getDeadlineInfo } from '@/lib/deadlineUtils';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  FileText,
  FileCode,
  Sparkles,
} from 'lucide-react';

export const ExportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, tasks, showToast } = useTaskContext();
  const [copied, setCopied] = useState(false);

  // Generate formatted MoM markdown
  const momMarkdown = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const activeTasks = tasks.filter((t) => t.status !== 'Completed');
    const completedTasks = tasks.filter((t) => t.status === 'Completed');

    let md = `# Wazir - The Strategy & Consulting Club\n`;
    md += `## Deliverables & Status Summary (MoM)\n`;
    md += `**Date:** ${today}\n\n`;

    md += `### 📌 Active Deliverables (${activeTasks.length})\n\n`;
    activeTasks.forEach((t, i) => {
      const dInfo = getDeadlineInfo(t.deadline, t.status);
      md += `${i + 1}. **[${t.vertical}] ${t.title}**\n`;
      md += `   - **Status:** ${t.status} | **Priority:** ${t.priority}\n`;
      md += `   - **Assignees:** ${t.assignees.join(', ')}\n`;
      md += `   - **Deadline:** ${dInfo.formattedDate} (${dInfo.timeRemainingText})\n`;
      if (t.subtasks.length > 0) {
        const done = t.subtasks.filter((s) => s.completed).length;
        md += `   - **Checklist:** ${done}/${t.subtasks.length} completed\n`;
      }
      md += `\n`;
    });

    md += `### ✅ Completed Deliverables (${completedTasks.length})\n\n`;
    completedTasks.forEach((t, i) => {
      md += `${i + 1}. **[${t.vertical}] ${t.title}** - *${t.assignees.join(', ')}*\n`;
    });

    return md;
  }, [tasks]);

  if (!isExportModalOpen) return null;

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(momMarkdown);
    setCopied(true);
    showToast('MoM summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadCSV = () => {
    const headers = ['ID', 'Title', 'Vertical', 'Assignees', 'Status', 'Priority', 'Deadline', 'Completed Subtasks', 'Total Subtasks'];
    const rows = tasks.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.vertical,
      `"${t.assignees.join('; ')}"`,
      t.status,
      t.priority,
      t.deadline,
      t.subtasks.filter((s) => s.completed).length,
      t.subtasks.length,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wazir_deliverables_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully!', 'success');
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `wazir_deliverables_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('JSON export downloaded!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-wazir-card border border-wazir-border rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-wazir-border/60 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Export Club Deliverables &amp; MoM
              </h3>
              <p className="text-xs text-slate-400">
                Wazir - The Strategy &amp; Consulting Club Meeting Report
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin">
          {/* Action Export Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleCopyMarkdown}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex flex-col justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-amber-400" />
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-white" />}
              </div>
              <div>
                <p className="text-xs font-bold text-white">Copy MoM</p>
                <p className="text-[10px] text-slate-400">Markdown format</p>
              </div>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex flex-col justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Download CSV</p>
                <p className="text-[10px] text-slate-400">Excel / Google Sheets</p>
              </div>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-left flex flex-col justify-between group transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <FileCode className="w-5 h-5 text-sky-400" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Download JSON</p>
                <p className="text-[10px] text-slate-400">Raw database backup</p>
              </div>
            </button>
          </div>

          {/* MoM Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Minutes of Meeting (MoM) Preview
            </label>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 max-h-[260px] overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {momMarkdown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
