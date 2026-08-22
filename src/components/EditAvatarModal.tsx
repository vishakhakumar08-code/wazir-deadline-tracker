'use client';

import React, { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES } from '@/lib/constants';
import { MemberAvatar } from './MemberAvatar';
import {
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  Camera,
  Check,
  Trash2,
  Smile,
  RefreshCw,
} from 'lucide-react';

export const EditAvatarModal: React.FC = () => {
  const {
    editingMemberForAvatar,
    setEditingMemberForAvatar,
    getMemberAvatar,
    updateMemberAvatar,
    showToast,
  } = useTaskContext();

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'upload' | 'url'>('presets');

  const memberName = editingMemberForAvatar;
  const currentAvatar = memberName ? getMemberAvatar(memberName) : undefined;

  useEffect(() => {
    if (editingMemberForAvatar) {
      const existing = getMemberAvatar(editingMemberForAvatar) || '';
      setSelectedAvatarUrl(existing);
      setCustomUrlInput(existing.startsWith('http') ? existing : '');
    }
  }, [editingMemberForAvatar, getMemberAvatar]);

  if (!editingMemberForAvatar) return null;

  const assigneeConfig = ASSIGNEES.find((a) => a.name === editingMemberForAvatar);

  // Curated Preset Avatar Styles via DiceBear
  const presetCollections = [
    {
      id: 'avataaars',
      label: 'Memoji',
      url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'bottts',
      label: 'Robo Bot',
      url: `https://api.dicebear.com/7.x/bottts/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'notionists',
      label: 'Notionist',
      url: `https://api.dicebear.com/7.x/notionists/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'micah',
      label: 'Illustrated',
      url: `https://api.dicebear.com/7.x/micah/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'lorelei',
      label: 'Anime/Art',
      url: `https://api.dicebear.com/7.x/lorelei/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'adventurer',
      label: 'Adventurer',
      url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'fun-emoji',
      label: 'Emoji',
      url: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'open-peeps',
      label: 'Peeps',
      url: `https://api.dicebear.com/7.x/open-peeps/svg?seed=${editingMemberForAvatar}`,
    },
    {
      id: 'personas',
      label: 'Corporate',
      url: `https://api.dicebear.com/7.x/personas/svg?seed=${editingMemberForAvatar}`,
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Please select an image smaller than 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setSelectedAvatarUrl(dataUrl);
        showToast('Image loaded! Click Save to apply.', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    setSelectedAvatarUrl(customUrlInput.trim());
    showToast('Preview updated! Click Save to apply.', 'info');
  };

  const handleSave = async () => {
    if (!editingMemberForAvatar) return;
    setIsSaving(true);
    try {
      await updateMemberAvatar(editingMemberForAvatar, selectedAvatarUrl);
      setEditingMemberForAvatar(null);
    } catch (err: any) {
      console.error('Failed to save avatar:', err);
      showToast(`Failed to update avatar: ${err?.message || 'Error'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToInitials = async () => {
    if (!editingMemberForAvatar) return;
    setIsSaving(true);
    try {
      await updateMemberAvatar(editingMemberForAvatar, '');
      setSelectedAvatarUrl('');
      setEditingMemberForAvatar(null);
      showToast(`Reset ${editingMemberForAvatar}'s photo to default initials`, 'info');
    } catch (err: any) {
      console.error('Failed to reset avatar:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white border-t md:border border-slate-200 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] md:max-h-[calc(100vh-80px)] my-0 md:my-8 flex flex-col">
        {/* Mobile Swipe Handle */}
        <div className="md:hidden flex justify-center pt-2.5 pb-1 bg-slate-100">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                Edit Member Avatar / Photo
              </h3>
              <p className="text-xs text-slate-500">
                Updating profile for <span className="font-bold text-slate-800">{editingMemberForAvatar}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setEditingMemberForAvatar(null)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto scrollbar-thin">
          {/* Live Preview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="relative">
              {selectedAvatarUrl ? (
                <img
                  src={selectedAvatarUrl}
                  alt={editingMemberForAvatar}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black border border-slate-200 shadow-md ${
                    assigneeConfig?.avatarBg || 'bg-blue-100'
                  } ${assigneeConfig?.textColor || 'text-blue-800'}`}
                >
                  {assigneeConfig?.initials || editingMemberForAvatar.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 font-heading">
                {editingMemberForAvatar}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedAvatarUrl ? 'Custom photo / Memoji selected' : 'Using default initials'}
              </p>

              {selectedAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedAvatarUrl('')}
                  className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 mt-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove / Revert to Initials</span>
                </button>
              )}
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Memoji &amp; Vector Presets</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Tab Content: Presets */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Click any character style to set as <span className="font-semibold">{editingMemberForAvatar}</span>&apos;s avatar:
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {presetCollections.map((preset) => {
                  const isSelected = selectedAvatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedAvatarUrl(preset.url)}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="text-[11px] font-bold text-slate-800">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab Content: Upload File */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Upload a JPEG or PNG profile picture from your computer or phone (max 2MB):
              </p>

              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50 hover:bg-blue-50/30">
                <Upload className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-bold text-slate-900">
                  Click or drag photo here to upload
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Tab Content: Direct Image URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-3">
              <p className="text-xs text-slate-500">
                Paste any publicly accessible image or LinkedIn photo URL:
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
                >
                  Preview
                </button>
              </div>
            </form>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToInitials}
              disabled={isSaving || !currentAvatar}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                currentAvatar
                  ? 'text-red-600 hover:bg-red-50 cursor-pointer'
                  : 'text-slate-300 cursor-not-allowed'
              }`}
            >
              Reset to Initials
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingMemberForAvatar(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saving...' : 'Save Avatar'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
