import { TaskStatus, DeadlineUrgency } from '@/types/task';

export interface DeadlineInfo {
  urgency: DeadlineUrgency;
  isOverdue: boolean;
  isDueSoon: boolean; // within 24 hours
  isUpcoming: boolean;
  isCompleted: boolean;
  timeRemainingText: string;
  formattedDate: string;
  badgeClass: string;
  dotClass: string;
  cardBorderHighlight: string;
}

/**
 * Calculates real-time deadline status and styling
 * Overdue = Red
 * Due in 24 hrs = Amber
 * Later = Green
 * Completed = Slate / Muted
 */
export function getDeadlineInfo(deadlineStr: string, status: TaskStatus): DeadlineInfo {
  const isCompleted = status === 'Completed';
  const deadlineDate = new Date(deadlineStr);
  const now = new Date();

  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const formattedDate = deadlineDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  if (isCompleted) {
    return {
      urgency: 'completed',
      isOverdue: false,
      isDueSoon: false,
      isUpcoming: false,
      isCompleted: true,
      timeRemainingText: 'Completed',
      formattedDate,
      badgeClass: 'bg-emerald-950/40 text-emerald-400/80 border-emerald-800/40',
      dotClass: 'bg-emerald-400',
      cardBorderHighlight: 'hover:border-emerald-500/30',
    };
  }

  // 1. Overdue (< 0 ms) -> RED
  if (diffMs < 0) {
    const absMinutes = Math.abs(diffMinutes);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);

    let text = 'Overdue';
    if (absMinutes < 60) {
      text = `Overdue by ${absMinutes}m`;
    } else if (absHours < 24) {
      text = `Overdue by ${absHours}h`;
    } else {
      text = `Overdue by ${absDays}d`;
    }

    return {
      urgency: 'overdue',
      isOverdue: true,
      isDueSoon: false,
      isUpcoming: false,
      isCompleted: false,
      timeRemainingText: text,
      formattedDate,
      badgeClass: 'bg-red-500/20 text-red-400 border-red-500/40 font-medium animate-pulse-slow',
      dotClass: 'bg-red-500 animate-ping-slow',
      cardBorderHighlight: 'border-l-4 border-l-red-500 border-red-500/30',
    };
  }

  // 2. Due in <= 24 hours -> AMBER
  if (diffMs <= 24 * 60 * 60 * 1000) {
    let text = 'Due today';
    if (diffHours === 0) {
      text = `Due in ${Math.max(1, diffMinutes)}m`;
    } else if (diffHours < 24) {
      const remainingMinutes = diffMinutes % 60;
      text = remainingMinutes > 0 ? `Due in ${diffHours}h ${remainingMinutes}m` : `Due in ${diffHours}h`;
    }

    return {
      urgency: 'due_soon',
      isOverdue: false,
      isDueSoon: true,
      isUpcoming: false,
      isCompleted: false,
      timeRemainingText: text,
      formattedDate,
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium',
      dotClass: 'bg-amber-400 animate-pulse',
      cardBorderHighlight: 'border-l-4 border-l-amber-500 border-amber-500/30',
    };
  }

  // 3. Due Later (> 24 hours) -> GREEN
  let text = `${diffDays} days left`;
  if (diffDays === 1) {
    text = 'Tomorrow';
  }

  return {
    urgency: 'upcoming',
    isOverdue: false,
    isDueSoon: false,
    isUpcoming: true,
    isCompleted: false,
    timeRemainingText: text,
    formattedDate,
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    cardBorderHighlight: 'border-l-4 border-l-emerald-500/40 hover:border-emerald-500/50',
  };
}

/**
 * Format a Date object into 'YYYY-MM-DDTHH:mm' for datetime-local input
 */
export function toDatetimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}
