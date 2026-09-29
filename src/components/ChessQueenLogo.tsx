'use client';

import React from 'react';
import { useTaskContext } from '@/context/TaskContext';

export const ChessQueenLogo: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { setCurrentScreen } = useTaskContext();

  return (
    <button
      type="button"
      onClick={() => setCurrentScreen('home')}
      title="WAZIR - Back to Home Board"
      className={`group w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 z-30 ${className}`}
      aria-label="Return to Home"
    >
      <svg
        className="w-8 h-8 sm:w-9 sm:h-9 fill-white drop-shadow"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crisp Chess Queen Silhouette */}
        <path d="M5 20h14v2H5v-2zm13-3.8l1.6-8.2-4.1 4.5-3.5-7.5-3.5 7.5L4.4 8l1.6 8.2h12zm-6-9.7l2.3 4.9 3.2-3.5-1.1 5.8H7.6l-1.1-5.8 3.2 3.5 2.3-4.9zM12 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-7 3a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm14 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
      </svg>
    </button>
  );
};
