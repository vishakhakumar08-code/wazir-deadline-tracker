'use client';

import React, { useState, useEffect } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES } from '@/lib/constants';
import { Assignee } from '@/types/task';
import { RetroKanbanBoard } from './RetroKanbanBoard';
import { Camera, ChevronLeft, ChevronRight } from 'lucide-react';

export const IndividualMemberView: React.FC = () => {
  const {
    selectedMemberName,
    setSelectedMemberName,
    setCurrentScreen,
    getMemberAvatar,
    setEditingMemberForAvatar,
    updateMemberAvatar,
    showToast,
  } = useTaskContext();

  const currentMember = selectedMemberName || 'Vishakha';
  const customAvatar = getMemberAvatar(currentMember);
  const memberConfig = ASSIGNEES.find((a) => a.name === currentMember);

  // Proportions for attendance bar (mock/live stats)
  // Green (Present), Light Green (Excused Tardy), Yellow (Tardy), Orange (Excused Absence), Red (Absence)
  const attendanceBreakdown = {
    present: 55,
    excusedTardy: 15,
    tardy: 10,
    excusedAbsence: 15,
    absence: 5,
  };

  const handleNextMember = () => {
    const currentIndex = ASSIGNEES.findIndex((a) => a.name === currentMember);
    const nextIndex = (currentIndex + 1) % ASSIGNEES.length;
    setSelectedMemberName(ASSIGNEES[nextIndex].name);
  };

  const handlePrevMember = () => {
    const currentIndex = ASSIGNEES.findIndex((a) => a.name === currentMember);
    const prevIndex = (currentIndex - 1 + ASSIGNEES.length) % ASSIGNEES.length;
    setSelectedMemberName(ASSIGNEES[prevIndex].name);
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Please select an image smaller than 2MB', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await updateMemberAvatar(currentMember, dataUrl);
        showToast(`Photo for ${currentMember} updated!`, 'success');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Header / Back & Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3">
        <button
          onClick={() => setCurrentScreen('individual_search')}
          className="flex items-center gap-1.5 font-pixel text-xs text-black hover:underline cursor-pointer font-bold"
        >
          <span>&lt;- ALL MEMBERS</span>
        </button>

        {/* Member Selector Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMember}
            className="p-1 border-2 border-black bg-white hover:bg-slate-100 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <select
            value={currentMember}
            onChange={(e) => setSelectedMemberName(e.target.value as Assignee)}
            className="bg-white border-2 border-black px-3 py-1 font-pixel text-xs text-black focus:outline-none shadow-[2px_2px_0px_0px_#000] cursor-pointer font-bold"
          >
            {ASSIGNEES.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name.toUpperCase()}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMember}
            className="p-1 border-2 border-black bg-white hover:bg-slate-100 font-pixel text-xs cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden File Input for Direct Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleDirectFileUpload}
        className="hidden"
      />

      {/* Main Content Layout: Left Cutout Photo + Right Kanban */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Member Photo Cutout & Black Name Badge */}
        <div className="lg:col-span-4 flex flex-col items-center space-y-4">
          <div className="relative group w-full max-w-[260px] flex flex-col items-center">
            {/* Cutout Photo / Avatar */}
            <div className="w-56 h-64 sm:w-64 sm:h-72 flex items-center justify-center overflow-hidden">
              {customAvatar ? (
                <img
                  src={customAvatar}
                  alt={currentMember}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-cover rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#000000]"
                />
              ) : currentMember === 'Vishakha' ? (
                <img
                  src="/images/vishakha_cutout.png"
                  alt="Vishakha"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              ) : (
                <div
                  className={`w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center font-pixel text-4xl ${
                    memberConfig?.avatarBg || 'bg-amber-100'
                  } ${memberConfig?.textColor || 'text-amber-800'}`}
                >
                  {memberConfig?.initials || currentMember.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            {/* Change Photo Trigger */}
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setEditingMemberForAvatar(currentMember)}
                className="text-xs font-pixel text-slate-700 hover:text-black flex items-center gap-1.5 hover:underline cursor-pointer bg-white px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_#000]"
                title="Edit avatar with presets, upload, or URL"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>EDIT PHOTO</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-pixel text-slate-700 hover:text-black flex items-center gap-1 hover:underline cursor-pointer bg-amber-100 px-2 py-1 border border-black shadow-[1px_1px_0px_0px_#000]"
                title="Quick upload from device"
              >
                <span>UPLOAD</span>
              </button>
            </div>

            {/* Solid Black Badge Box Reading Name in White Pixel Font */}
            <div className="w-full bg-black text-white border-2 md:border-[3px] border-black py-2.5 px-4 text-center mt-3 shadow-[4px_4px_0px_0px_#000000]">
              <span className="font-pixel text-sm sm:text-base font-bold tracking-widest uppercase">
                {currentMember}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Column Personal Kanban Board */}
        <div className="lg:col-span-8 w-full">
          <RetroKanbanBoard memberFilter={currentMember} />
        </div>
      </div>

      {/* Bottom: Horizontal ATTENDANCE TRACKER Segmented Bar */}
      <div className="w-full pt-4 space-y-2">
        <div className="flex items-center justify-between font-pixel text-xs text-black font-bold">
          <span className="tracking-wider uppercase">ATTENDANCE TRACKER</span>
          <span className="text-[10px] font-sans text-slate-600 font-normal">
            Past 30 Days Summary
          </span>
        </div>

        {/* Segmented Color Bar with Crisp Black Outline */}
        <div className="w-full h-8 flex border-2 md:border-[3px] border-black shadow-[3px_3px_0px_0px_#000000] overflow-hidden">
          {/* Green = Present */}
          <div
            style={{ width: `${attendanceBreakdown.present}%` }}
            className="bg-[#16A34A] h-full flex items-center justify-center text-white font-pixel text-[9px] truncate"
            title={`Present: ${attendanceBreakdown.present}%`}
          >
            {attendanceBreakdown.present}%
          </div>

          {/* Light Green = Excused Tardy */}
          <div
            style={{ width: `${attendanceBreakdown.excusedTardy}%` }}
            className="bg-[#86EFAC] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
            title={`Excused Tardy: ${attendanceBreakdown.excusedTardy}%`}
          >
            {attendanceBreakdown.excusedTardy}%
          </div>

          {/* Yellow = Tardy */}
          <div
            style={{ width: `${attendanceBreakdown.tardy}%` }}
            className="bg-[#FACC15] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
            title={`Tardy: ${attendanceBreakdown.tardy}%`}
          >
            {attendanceBreakdown.tardy}%
          </div>

          {/* Orange = Excused Absence */}
          <div
            style={{ width: `${attendanceBreakdown.excusedAbsence}%` }}
            className="bg-[#FB923C] h-full flex items-center justify-center text-black font-pixel text-[9px] truncate"
            title={`Excused Absence: ${attendanceBreakdown.excusedAbsence}%`}
          >
            {attendanceBreakdown.excusedAbsence}%
          </div>

          {/* Red = Absence */}
          <div
            style={{ width: `${attendanceBreakdown.absence}%` }}
            className="bg-[#DC2626] h-full flex items-center justify-center text-white font-pixel text-[9px] truncate"
            title={`Absence: ${attendanceBreakdown.absence}%`}
          >
            {attendanceBreakdown.absence}%
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-pixel pt-1 text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#16A34A] border border-black inline-block" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#86EFAC] border border-black inline-block" />
            <span>Excused Tardy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FACC15] border border-black inline-block" />
            <span>Tardy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#FB923C] border border-black inline-block" />
            <span>Excused Absence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#DC2626] border border-black inline-block" />
            <span>Absence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
