'use client';

import React, { useState, useMemo } from 'react';
import { useTaskContext } from '@/context/TaskContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export const InteractiveCalendar: React.FC = () => {
  const {
    tasks,
    selectedCalendarDay,
    setSelectedCalendarDay,
    setCurrentScreen,
  } = useTaskContext();

  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 = Jan, 8 = Sep, 9 = Oct
  const monthName = MONTH_NAMES[month];

  // Dynamic calculations for the active month
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate(); // 30, 31, 28/29

  // Calculate total grid cells (multiple of 7)
  const totalCells = Math.ceil((firstDayOfWeek + totalDaysInMonth) / 7) * 7;

  // Real-time task mapping for the active month and year
  const daysWithTasks = useMemo(() => {
    const set = new Set<number>();
    tasks.forEach((t) => {
      const d = new Date(t.deadline);
      if (!isNaN(d.getTime())) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          set.add(d.getDate());
        }
      }
    });
    return set;
  }, [tasks, month, year]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedCalendarDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedCalendarDay(null);
  };

  const handleDateClick = (day: number) => {
    if (selectedCalendarDay === day) {
      setSelectedCalendarDay(null);
    } else {
      setSelectedCalendarDay(day);
    }
  };

  const realToday = new Date();
  const isCurrentMonthReal =
    realToday.getMonth() === month && realToday.getFullYear() === year;
  const realTodayDate = realToday.getDate();

  return (
    <div className="flex flex-col items-center sm:items-start w-full max-w-[280px] space-y-4 shrink-0">
      {/* Interactive Monoline Calendar Box */}
      <div className="w-full bg-white border-2 border-black shadow-[3px_3px_0px_0px_#000000]">
        {/* Month & Navigation Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-black text-white font-pixel text-xs border-b-2 border-black">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 hover:bg-slate-800 text-white cursor-pointer transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="tracking-wider uppercase font-bold text-[11px] select-none">
            {monthName} {year}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-slate-800 text-white cursor-pointer transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b-2 border-black bg-slate-100 text-black text-center font-pixel text-[11px] py-1 font-bold tracking-wider">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Dynamic Date Cells Grid */}
        <div className="grid grid-cols-7 text-center font-serif text-sm">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const isLeadingEmpty = idx < firstDayOfWeek;
            const isTrailingEmpty = idx >= firstDayOfWeek + totalDaysInMonth;
            const isRightEdge = idx % 7 === 6;
            const isLastRow = idx >= totalCells - 7;

            const borderClasses = `${!isRightEdge ? 'border-r' : ''} ${
              !isLastRow ? 'border-b' : ''
            } border-black`;

            if (isLeadingEmpty || isTrailingEmpty) {
              return (
                <div
                  key={`empty-${idx}`}
                  className={`${borderClasses} p-1.5 min-h-[32px] bg-slate-50/50`}
                />
              );
            }

            const dayNumber = idx - firstDayOfWeek + 1;
            const isSelected = selectedCalendarDay === dayNumber;
            const hasTask = daysWithTasks.has(dayNumber);
            const isToday = isCurrentMonthReal && dayNumber === realTodayDate;

            return (
              <button
                key={`day-${dayNumber}`}
                type="button"
                onClick={() => handleDateClick(dayNumber)}
                className={`${borderClasses} p-1.5 min-h-[32px] flex flex-col items-center justify-center font-serif transition-colors cursor-pointer relative ${
                  isSelected
                    ? 'bg-black text-white font-bold'
                    : isToday
                    ? 'bg-blue-50 font-bold text-blue-900 hover:bg-blue-100'
                    : 'hover:bg-slate-100 text-black'
                }`}
              >
                <span className="leading-none text-xs sm:text-sm">{dayNumber}</span>
                {hasTask && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />
                )}
                {isToday && !isSelected && !hasTask && (
                  <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Status Bar */}
      {selectedCalendarDay !== null && (
        <div className="w-full flex items-center justify-between text-xs bg-slate-100 border-2 border-black px-2.5 py-1.5 font-pixel text-black">
          <span>{monthName.slice(0, 3)} {selectedCalendarDay} FILTER</span>
          <button
            type="button"
            onClick={() => setSelectedCalendarDay(null)}
            className="text-red-600 hover:underline cursor-pointer font-bold"
          >
            CLEAR [X]
          </button>
        </div>
      )}

      {/* Navigation Buttons (Solid Black with White Pixel Text) */}
      <div className="w-full flex flex-col gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => setCurrentScreen('attendance')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          ATTENDANCE TRACKER
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('individual_search')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          INDIVIDUAL TASKS
        </button>

        <button
          type="button"
          onClick={() => setCurrentScreen('party_calendar')}
          className="w-full bg-black text-white font-pixel text-xs py-3 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:bg-slate-800 active:translate-x-0.5 active:translate-y-0.5 transition-all text-center cursor-pointer tracking-wider"
        >
          PARTY CALENDAR
        </button>
      </div>
    </div>
  );
};
