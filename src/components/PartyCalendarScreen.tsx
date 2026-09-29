'use client';

import React, { useState } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { Sparkles, Calendar, Heart, Music, Film, Gift, Dice5, Flame, X } from 'lucide-react';

interface PartyEvent {
  month: string;
  theme: string;
  tagline: string;
  color: string;
  notes: string;
  icon: string;
}

const PARTY_EVENTS: PartyEvent[] = [
  {
    month: 'SEPTEMBER',
    theme: 'old bollywood',
    tagline: 'Retro drama, classic anthems & vintage cinema vibes',
    color: 'bg-amber-100 border-amber-300 text-amber-900',
    notes: 'Costumes inspired by 70s-90s Hindi cinema, dialogue face-offs, and Chai & samosa mixer.',
    icon: 'Film',
  },
  {
    month: 'OCTOBER',
    theme: 'house of horrors',
    tagline: 'Spooky season, mysterious puzzles & Halloween masquerade',
    color: 'bg-purple-100 border-purple-300 text-purple-900',
    notes: 'Escape room challenge, eerie trivia, and best costume prize giveaway.',
    icon: 'Flame',
  },
  {
    month: 'NOVEMBER',
    theme: 'casino night',
    tagline: 'High stakes, poker chips & Monte Carlo glamour',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-900',
    notes: 'Black-tie attire, mock poker & blackjack tournaments, mocktails, and live jazz playlist.',
    icon: 'Dice5',
  },
  {
    month: 'DECEMBER',
    theme: 'ugly sweater party',
    tagline: 'Hot cocoa, tacky woollens & Secret Santa gift exchange',
    color: 'bg-rose-100 border-rose-300 text-rose-900',
    notes: 'Secret Santa reveals, holiday photo booth, year-end consulting roast & toasts.',
    icon: 'Gift',
  },
  {
    month: 'JANUARY',
    theme: 'new year old wazir',
    tagline: 'Welcoming the new cohort while celebrating club traditions',
    color: 'bg-sky-100 border-sky-300 text-sky-900',
    notes: 'Alumni fireside chat, goal vision board session, and kickoff dinner for the winter term.',
    icon: 'Sparkles',
  },
  {
    month: 'FEBRUARY',
    theme: 'wazir valentines',
    tagline: 'Cupid notes, consulting speed-dating & sweet treats',
    color: 'bg-pink-100 border-pink-300 text-pink-900',
    notes: 'Anonymous appreciation notes, chocolate fountain, and dynamic pairing case sprint.',
    icon: 'Heart',
  },
];

export const PartyCalendarScreen: React.FC = () => {
  const { setCurrentScreen } = useTaskContext();
  const [selectedEvent, setSelectedEvent] = useState<PartyEvent | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-8 pb-12">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="font-pixel text-xl sm:text-3xl text-black tracking-widest font-bold">
          MEMORIES LOADING...
        </h1>
        <p className="font-serif not-italic font-normal text-black text-base sm:text-lg">
          a look back
        </p>
      </div>

      {/* Main Party Calendar Scrapbook Frame */}
      <div className="relative flex items-center justify-center">
        {/* Spiral Binding Rings Effect on Left */}
        <div className="hidden sm:flex flex-col justify-around absolute -left-6 top-8 bottom-8 z-10 space-y-2 pointer-events-none">
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="w-8 h-4 rounded-full border-2 border-black bg-slate-200 -rotate-12 shadow-[1px_1px_0px_0px_#000]"
            />
          ))}
        </div>

        {/* Poster / Scrapbook Container */}
        <div className="bg-[#FFFBEB] border-2 md:border-[3px] border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_#000000] max-w-lg w-full">
          {/* Party Calendar Poster Image */}
          <div className="relative w-full overflow-hidden border-2 border-black bg-white">
            <img
              src="/images/party_calendar_poster.png"
              alt="Wazir Party Calendar"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Interactive Month Buttons Grid */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PARTY_EVENTS.map((event) => (
              <button
                key={event.month}
                onClick={() => setSelectedEvent(event)}
                className="p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white transition-all text-left shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer flex flex-col justify-between"
              >
                <span className="font-pixel text-[9px] uppercase font-bold tracking-wider">
                  {event.month}
                </span>
                <span className="font-serif italic text-xs mt-1 font-medium">
                  {event.theme}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={() => setCurrentScreen('home')}
          className="bg-black text-white font-pixel text-xs py-3 px-5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider"
        >
          DEADLINE TRACKER
        </button>

        <button
          onClick={() => setCurrentScreen('attendance')}
          className="bg-black text-white font-pixel text-xs py-3 px-5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider"
        >
          ATTENDANCE TRACKER
        </button>

        <button
          onClick={() => setCurrentScreen('individual_search')}
          className="bg-black text-white font-pixel text-xs py-3 px-5 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer tracking-wider"
        >
          INDIVIDUAL TASKS
        </button>
      </div>

      {/* Event Details Retro Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border-2 md:border-[3px] border-black shadow-[6px_6px_0px_0px_#000000] p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div>
                <span className="font-pixel text-xs text-blue-600 font-bold tracking-widest uppercase">
                  {selectedEvent.month} EVENT
                </span>
                <h3 className="font-serif text-2xl font-bold text-black mt-0.5 capitalize">
                  {selectedEvent.theme}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-7 h-7 border-2 border-black bg-white hover:bg-red-500 hover:text-white font-pixel text-xs flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="space-y-3">
              <p className="font-serif italic text-sm text-slate-700 bg-amber-50 p-3 border border-amber-200">
                &ldquo;{selectedEvent.tagline}&rdquo;
              </p>

              <div>
                <h4 className="font-pixel text-[10px] text-black uppercase font-bold mb-1">
                  Event Highlights &amp; Activities:
                </h4>
                <p className="font-serif text-sm text-slate-800 leading-relaxed">
                  {selectedEvent.notes}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedEvent(null)}
                className="bg-black text-white font-pixel text-xs py-2 px-5 border-2 border-black shadow-[2px_2px_0px_0px_#000000] hover:bg-slate-800 cursor-pointer"
              >
                CLOSE [X]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
