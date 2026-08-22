'use client';

import React, { useState } from 'react';
import { ASSIGNEES } from '@/lib/constants';
import { useTaskContext } from '@/context/TaskContext';

interface MemberAvatarProps {
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTooltip?: boolean;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  name,
  className = '',
  size = 'md',
  showTooltip = false,
}) => {
  const { getMemberAvatar } = useTaskContext();
  const [imgError, setImgError] = useState(false);

  const assignee = ASSIGNEES.find((a) => a.name === name);
  const avatarUrl = getMemberAvatar ? getMemberAvatar(name) : undefined;
  const initials = assignee?.initials || name.slice(0, 2).toUpperCase();
  const avatarBg = assignee?.avatarBg || 'bg-slate-100';
  const textColor = assignee?.textColor || 'text-slate-800';

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-xs sm:text-sm font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        title={showTooltip ? name : undefined}
        className={`${currentSizeClass} rounded-full object-cover border border-slate-200 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      title={showTooltip ? name : undefined}
      className={`${currentSizeClass} rounded-xl flex items-center justify-center font-black border border-slate-200 shadow-sm shrink-0 ${avatarBg} ${textColor} ${className}`}
    >
      {initials}
    </div>
  );
};
