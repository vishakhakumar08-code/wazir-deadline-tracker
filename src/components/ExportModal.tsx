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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle Indicator */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Export Club Deliverables &amp; MoM
              </h3>
              <p className="text-xs text-slate-500">
                Wazir - The Strategy &amp; Consulting Club Meeting Report
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsExportModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
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
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-200 text-left flex flex-col justify-between group transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-amber-600" />
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Copy MoM</p>
                <p className="text-[10px] text-slate-500">Markdown format</p>
              </div>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-200 text-left flex flex-col justify-between group transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Download CSV</p>
                <p className="text-[10px] text-slate-500">Excel / Google Sheets</p>
              </div>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 text-left flex flex-col justify-between group transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <FileCode className="w-5 h-5 text-blue-600" />
                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-700" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Download JSON</p>
                <p className="text-[10px] text-slate-500">Raw database backup</p>
              </div>
            </button>
          </div>

          {/* MoM Preview */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Minutes of Meeting (MoM) Preview
            </label>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 max-h-[260px] overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
              {momMarkdown}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
