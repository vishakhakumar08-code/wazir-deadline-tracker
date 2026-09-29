'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ASSIGNEES } from '@/lib/constants';
import { Assignee } from '@/types/task';

export const IndividualTrackerSearch: React.FC = () => {
  const { setCurrentScreen, setSelectedMemberName } = useTaskContext();
  const [searchInput, setSearchInput] = useState('');

  const handleSelectMember = (memberName: Assignee) => {
    setSelectedMemberName(memberName);
    setCurrentScreen('individual_member');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim().toLowerCase();
    if (!query) return;

    // Find closest member match
    const matched = ASSIGNEES.find((a) => a.name.toLowerCase().includes(query));
    if (matched) {
      handleSelectMember(matched.name);
    } else {
      // Default to Vishakha if not found
      handleSelectMember('Vishakha');
    }
  };

  const filteredMembers = ASSIGNEES.filter((a) =>
    a.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] space-y-8 px-4">
      {/* Title */}
      <h1 className="font-pixel text-xl sm:text-3xl text-black tracking-widest text-center font-bold">
        INDIVIDUAL TRACKER
      </h1>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-md flex flex-col items-center space-y-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="enter name..."
          autoFocus
          className="w-full bg-white border-2 md:border-[3px] border-black py-3 px-5 font-serif text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-[4px_4px_0px_0px_#000000]"
        />

        {/* Member Suggestions Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {filteredMembers.map((member) => (
            <button
              key={member.name}
              type="button"
              onClick={() => handleSelectMember(member.name)}
              className="bg-white hover:bg-black hover:text-white text-black border-2 border-black font-pixel text-[10px] py-1.5 px-3 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              {member.name.toUpperCase()}
            </button>
          ))}
        </div>
      </form>

      {/* Sub-Navigation Buttons (Solid Black with White Pixel Text) */}
      <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 w-full max-w-2xl mx-auto px-2 overflow-visible pt-6">
        <button
          type="button"
          onClick={() => setCurrentScreen('attendance')}
          className="bg-black text-white font-pixel text-[9px] sm:text-xs px-2.5 sm:px-4 py-2 sm:py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider whitespace-nowrap font-bold"
        >
          ATTENDANCE TRACKER
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('home')}
          className="bg-black text-white font-pixel text-[9px] sm:text-xs px-2.5 sm:px-4 py-2 sm:py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider whitespace-nowrap font-bold"
        >
          DEADLINE TRACKER
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('party_calendar')}
          className="bg-black text-white font-pixel text-[9px] sm:text-xs px-2.5 sm:px-4 py-2 sm:py-2.5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider whitespace-nowrap font-bold"
        >
          PARTY CALENDAR
        </button>
      </div>
    </div>
  );
};
