'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';

export const InteractiveCalendar: React.FC = () => {
  const {
    tasks,
    selectedCalendarDay,
    setSelectedCalendarDay,
    setCurrentScreen,
  } = useTaskContext();

  // Days 1..31 with calendar layout starting on Tuesday (matching reference mockup with 1 on Tuesday/Wednesday)
  // Monoline grid with S M T W T F S
  // Row 1: [empty, empty, empty, empty, empty, 1, 2] -> 5 empty leading cells
  // Or match the exact reference grid:
  // Row 1: [ , , , , , 1, 2]
  // Row 2: [3, 4, 5, 6, 7, 8, 9]
  // Row 3: [10, 11, 12, 13, 14, 15, 16]
  // Row 4: [17, 18, 19, 20, 21, 22, 23]
  // Row 5: [24, 25, 26, 27, 28, 29, 30]
  // Row 6: [31, , , , , , ]

  const daysWithTasks = React.useMemo(() => {
    const set = new Set<number>();
    tasks.forEach((t) => {
      const d = new Date(t.deadline);
      if (!isNaN(d.getTime())) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [tasks]);

  const handleDateClick = (day: number) => {
    if (selectedCalendarDay === day) {
      setSelectedCalendarDay(null);
    } else {
      setSelectedCalendarDay(day);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start w-full max-w-[280px] space-y-4 shrink-0">
      {/* Interactive Monoline Calendar Box */}
      <div className="w-full bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-black bg-black text-white text-center font-pixel text-[11px] py-1.5 font-bold tracking-wider">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Date Cells Grid */}
        <div className="grid grid-cols-7 text-center font-serif text-sm">
          {/* Row 1: Leading empty cells + 1, 2 */}
          <div className="border-r border-b border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-b border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-b border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-b border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-b border-black p-1.5 min-h-[30px]" />
          
          <button
            onClick={() => handleDateClick(1)}
            className={`border-r border-b border-black p-1.5 min-h-[30px] flex flex-col items-center justify-center font-serif transition-colors cursor-pointer ${
              selectedCalendarDay === 1
                ? 'bg-black text-white font-bold'
                : 'hover:bg-slate-100 text-black'
            }`}
          >
            <span>1</span>
            {daysWithTasks.has(1) && selectedCalendarDay !== 1 && (
              <span className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => handleDateClick(2)}
            className={`border-b border-black p-1.5 min-h-[30px] flex flex-col items-center justify-center font-serif transition-colors cursor-pointer ${
              selectedCalendarDay === 2
                ? 'bg-black text-white font-bold'
                : 'hover:bg-slate-100 text-black'
            }`}
          >
            <span>2</span>
            {daysWithTasks.has(2) && selectedCalendarDay !== 2 && (
              <span className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>

          {/* Days 3 to 30 */}
          {Array.from({ length: 28 }, (_, i) => i + 3).map((day, idx) => {
            const isRightEdge = (idx + 2) % 7 === 6;
            const isSelected = selectedCalendarDay === day;
            const hasTask = daysWithTasks.has(day);

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`border-b border-black p-1.5 min-h-[30px] flex flex-col items-center justify-center font-serif transition-colors cursor-pointer ${
                  !isRightEdge ? 'border-r' : ''
                } ${
                  isSelected
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-slate-100 text-black'
                }`}
              >
                <span>{day}</span>
                {hasTask && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
                )}
              </button>
            );
          })}

          {/* Row 6: 31 + trailing empty cells */}
          <button
            onClick={() => handleDateClick(31)}
            className={`border-r border-black p-1.5 min-h-[30px] flex flex-col items-center justify-center font-serif transition-colors cursor-pointer ${
              selectedCalendarDay === 31
                ? 'bg-black text-white font-bold'
                : 'hover:bg-slate-100 text-black'
            }`}
          >
            <span>31</span>
            {daysWithTasks.has(31) && selectedCalendarDay !== 31 && (
              <span className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
          <div className="border-r border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-black p-1.5 min-h-[30px]" />
          <div className="border-r border-black p-1.5 min-h-[30px]" />
          <div className="p-1.5 min-h-[30px]" />
        </div>
      </div>

      {/* Selected Day Status */}
      {selectedCalendarDay !== null && (
        <div className="w-full flex items-center justify-between text-xs bg-slate-100 border-2 border-black px-2.5 py-1.5 font-pixel text-black">
          <span>DAY {selectedCalendarDay} FILTER</span>
          <button
            onClick={() => setSelectedCalendarDay(null)}
            className="text-red-600 hover:underline cursor-pointer"
          >
            CLEAR [X]
          </button>
        </div>
      )}

      {/* Navigation Buttons (Solid Black with White Pixel Text) */}
      <div className="w-full flex flex-col gap-2.5 pt-1">
        <button
          onClick={() => setCurrentScreen('attendance')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          ATTENDANCE TRACKER
        </button>

        <button
          onClick={() => setCurrentScreen('individual_search')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          INDIVIDUAL TASKS
        </button>

        <button
          onClick={() => setCurrentScreen('party_calendar')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          PARTY CALENDAR
        </button>
      </div>
    </div>
  );
};
