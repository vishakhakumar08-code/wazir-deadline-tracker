import { Vertical, Assignee, TaskStatus, TaskPriority, AttendanceStatus } from '@/types/task';

export const VERTICALS: {
  id: Vertical;
  label: string;
  tag: string;
  color: string;
  pillBg: string;
  pillText: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'Editorial',
    label: 'Editorial',
    tag: 'editorial',
    color: '#059669',
    pillBg: 'bg-[#DCFCE7]',
    pillText: 'text-emerald-900',
    badge: 'bg-[#DCFCE7] text-emerald-900 border border-[#BBF7D0]',
    description: 'Newsletters, op-eds, research articles & publications',
  },
  {
    id: 'Public Relations',
    label: 'Public Relations',
    tag: 'pr',
    color: '#7c3aed',
    pillBg: 'bg-[#F3E8FF]',
    pillText: 'text-purple-900',
    badge: 'bg-[#F3E8FF] text-purple-900 border border-[#E9D5FF]',
    description: 'Social media, branding, LinkedIn campaigns & press',
  },
  {
    id: 'Events',
    label: 'Events',
    tag: 'events',
    color: '#d97706',
    pillBg: 'bg-[#FFEDD5]',
    pillText: 'text-amber-900',
    badge: 'bg-[#FFEDD5] text-amber-900 border border-[#FED7AA]',
    description: 'Workshops, guest speaker sessions, campus conclaves',
  },
  {
    id: 'Apex',
    label: 'Apex',
    tag: 'apex',
    color: '#0284c7',
    pillBg: 'bg-[#E0F2FE]',
    pillText: 'text-sky-900',
    badge: 'bg-[#E0F2FE] text-sky-900 border border-[#BAE6FD]',
    description: 'Flagship national consulting case competition',
  },
  {
    id: 'Casebook',
    label: 'Casebook',
    tag: 'casebook',
    color: '#db2777',
    pillBg: 'bg-[#FCE7F3]',
    pillText: 'text-pink-900',
    badge: 'bg-[#FCE7F3] text-pink-900 border border-[#FBCFE8]',
    description: 'Annual casebook curation, sector decks & interview prep',
  },
  {
    id: 'External Relations',
    label: 'External Relations',
    tag: 'er',
    color: '#ca8a04',
    pillBg: 'bg-[#FEF9C3]',
    pillText: 'text-yellow-900',
    badge: 'bg-[#FEF9C3] text-yellow-900 border border-[#FEF08A]',
    description: 'Corporate partnerships, sponsorships & alumni network',
  },
];

export interface VerticalBadgeInfo {
  tag: string;
  className: string;
  pillBg: string;
  pillText: string;
}

export const getVerticalBadgeInfo = (verticalName?: string): VerticalBadgeInfo => {
  if (!verticalName) {
    return {
      tag: 'editorial',
      className: 'bg-[#DCFCE7] text-emerald-900 border border-[#BBF7D0]',
      pillBg: 'bg-[#DCFCE7]',
      pillText: 'text-emerald-900',
    };
  }

  const normalized = verticalName.trim().toLowerCase();

  switch (normalized) {
    case 'editorial':
      return {
        tag: 'editorial',
        className: 'bg-[#DCFCE7] text-emerald-900 border border-[#BBF7D0]',
        pillBg: 'bg-[#DCFCE7]',
        pillText: 'text-emerald-900',
      };
    case 'pr':
    case 'public relations':
      return {
        tag: 'pr',
        className: 'bg-[#F3E8FF] text-purple-900 border border-[#E9D5FF]',
        pillBg: 'bg-[#F3E8FF]',
        pillText: 'text-purple-900',
      };
    case 'events':
      return {
        tag: 'events',
        className: 'bg-[#FFEDD5] text-amber-900 border border-[#FED7AA]',
        pillBg: 'bg-[#FFEDD5]',
        pillText: 'text-amber-900',
      };
    case 'apex':
      return {
        tag: 'apex',
        className: 'bg-[#E0F2FE] text-sky-900 border border-[#BAE6FD]',
        pillBg: 'bg-[#E0F2FE]',
        pillText: 'text-sky-900',
      };
    case 'casebook':
      return {
        tag: 'casebook',
        className: 'bg-[#FCE7F3] text-pink-900 border border-[#FBCFE8]',
        pillBg: 'bg-[#FCE7F3]',
        pillText: 'text-pink-900',
      };
    case 'er':
    case 'external relations':
      return {
        tag: 'er',
        className: 'bg-[#FEF9C3] text-yellow-900 border border-[#FEF08A]',
        pillBg: 'bg-[#FEF9C3]',
        pillText: 'text-yellow-900',
      };
    default:
      return {
        tag: normalized,
        className: 'bg-slate-100 text-slate-800 border border-slate-300',
        pillBg: 'bg-slate-100',
        pillText: 'text-slate-800',
      };
  }
};

export const ASSIGNEES: {
  name: Assignee;
  avatarBg: string;
  textColor: string;
  initials: string;
}[] = [
  { name: 'Akruti', avatarBg: 'bg-indigo-100', textColor: 'text-indigo-800', initials: 'AK' },
  { name: 'Animesh', avatarBg: 'bg-cyan-100', textColor: 'text-cyan-800', initials: 'AN' },
  { name: 'Avi', avatarBg: 'bg-amber-100', textColor: 'text-amber-800', initials: 'AV' },
  { name: 'Devanshi', avatarBg: 'bg-pink-100', textColor: 'text-pink-800', initials: 'DV' },
  { name: 'Harshvardhan', avatarBg: 'bg-blue-100', textColor: 'text-blue-800', initials: 'HV' },
  { name: 'Ishika', avatarBg: 'bg-rose-100', textColor: 'text-rose-800', initials: 'IS' },
  { name: 'Nandini', avatarBg: 'bg-emerald-100', textColor: 'text-emerald-800', initials: 'NA' },
  { name: 'Simar', avatarBg: 'bg-purple-100', textColor: 'text-purple-800', initials: 'SI' },
  { name: 'Somansha', avatarBg: 'bg-teal-100', textColor: 'text-teal-800', initials: 'SO' },
  { name: 'Vishakha', avatarBg: 'bg-sky-100', textColor: 'text-sky-800', initials: 'VK' },
];

export const STATUSES: {
  id: TaskStatus;
  label: string;
  color: string;
  dotColor: string;
  headerBg: string;
  headerText: string;
  borderAccent: string;
}[] = [
  {
    id: 'To Do',
    label: 'TO DO',
    color: '#0284c7',
    dotColor: 'bg-sky-500',
    headerBg: 'bg-[#38BDF8]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
  {
    id: 'In Progress',
    label: 'IN PROGRESS',
    color: '#eab308',
    dotColor: 'bg-amber-500',
    headerBg: 'bg-[#FACC15]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
  {
    id: 'Review',
    label: 'REVIEW',
    color: '#a855f7',
    dotColor: 'bg-purple-500',
    headerBg: 'bg-[#C084FC]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
  {
    id: 'Completed',
    label: 'COMPLETE',
    color: '#22c55e',
    dotColor: 'bg-emerald-500',
    headerBg: 'bg-[#4ADE80]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
];

export const PRIORITIES: {
  id: TaskPriority;
  label: string;
  color: string;
  badge: string;
  iconName: string;
}[] = [
  {
    id: 'Urgent',
    label: 'Urgent',
    color: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border border-red-300 font-semibold',
    iconName: 'Flame',
  },
  {
    id: 'High',
    label: 'High',
    color: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
    iconName: 'AlertTriangle',
  },
  {
    id: 'Medium',
    label: 'Medium',
    color: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
    iconName: 'Clock',
  },
  {
    id: 'Low',
    label: 'Low',
    color: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold',
    iconName: 'Minus',
  },
];

export const ATTENDANCE_STATUSES: {
  id: AttendanceStatus;
  label: string;
  activeBg: string;
  activeText: string;
  activeBorder: string;
  description: string;
}[] = [
  {
    id: 'Present',
    label: 'PRESENT',
    activeBg: 'bg-[#16A34A]',
    activeText: 'text-white',
    activeBorder: 'border-black',
    description: 'Present and on time',
  },
  {
    id: 'Tardy',
    label: 'TARDY',
    activeBg: 'bg-[#FACC15]',
    activeText: 'text-black',
    activeBorder: 'border-black',
    description: 'Arrived late without prior notice',
  },
  {
    id: 'Excused Tardy',
    label: 'EXCUSED TARDY',
    activeBg: 'bg-[#86EFAC]',
    activeText: 'text-black',
    activeBorder: 'border-black',
    description: 'Late arrival with pre-approved notice',
  },
  {
    id: 'Absent',
    label: 'ABSENCE',
    activeBg: 'bg-[#DC2626]',
    activeText: 'text-white',
    activeBorder: 'border-black',
    description: 'Unexcused absence',
  },
  {
    id: 'Excused Absence',
    label: 'EXCUSED ABSENCE',
    activeBg: 'bg-[#FB923C]',
    activeText: 'text-black',
    activeBorder: 'border-black',
    description: 'Pre-approved leave',
  },
];
