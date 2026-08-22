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
  isOverdueCard: boolean;
}

/**
 * Calculates real-time deadline status and styling for light mode
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
      timeRemainingText: 'completed',
      formattedDate,
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotClass: 'bg-emerald-500',
      cardBorderHighlight: 'border-slate-200 opacity-90',
      isOverdueCard: false,
    };
  }

  // 1. Overdue (< 0 ms) -> RED
  if (diffMs < 0) {
    const absMinutes = Math.abs(diffMinutes);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);

    let text = 'overdue';
    if (absMinutes < 60) {
      text = `overdue by ${absMinutes}m`;
    } else if (absHours < 24) {
      text = `overdue by ${absHours}h`;
    } else if (absDays > 0) {
      text = `overdue by ${absDays}d`;
    }

    return {
      urgency: 'overdue',
      isOverdue: true,
      isDueSoon: false,
      isUpcoming: false,
      isCompleted: false,
      timeRemainingText: text,
      formattedDate,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-medium',
      dotClass: 'bg-red-500',
      cardBorderHighlight: 'bg-red-50/80 border-red-200',
      isOverdueCard: true,
    };
  }

  // 2. Due in <= 24 hours -> AMBER
  if (diffMs <= 24 * 60 * 60 * 1000) {
    let text = 'due today';
    if (diffHours === 0) {
      text = `due in ${Math.max(1, diffMinutes)}m`;
    } else if (diffHours < 24) {
      text = `due in ${diffHours}h`;
    }

    return {
      urgency: 'due_soon',
      isOverdue: false,
      isDueSoon: true,
      isUpcoming: false,
      isCompleted: false,
      timeRemainingText: text,
      formattedDate,
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-medium',
      dotClass: 'bg-amber-500',
      cardBorderHighlight: 'border-amber-200',
      isOverdueCard: false,
    };
  }

  // 3. Due Later (> 24 hours) -> GREEN / NEUTRAL
  let text = `due in ${diffDays} days`;
  if (diffDays === 1) {
    text = 'due tomorrow';
  } else if (diffDays <= 0) {
    text = 'due today';
  }

  return {
    urgency: 'upcoming',
    isOverdue: false,
    isDueSoon: false,
    isUpcoming: true,
    isCompleted: false,
    timeRemainingText: text,
    formattedDate,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    dotClass: 'bg-slate-400',
    cardBorderHighlight: 'border-slate-200/90',
    isOverdueCard: false,
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

/**
 * Sorts tasks in ascending order by deadline (earliest / closest upcoming first).
 * Tasks without a deadline are placed cleanly at the bottom of the list.
 */
export function sortTasksByDeadline<T extends { deadline?: string }>(tasks: T[]): T[] {
  return [...tasks].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}
