import { Vertical, Assignee, TaskStatus, TaskPriority, AttendanceStatus } from '@/types/task';

export const VERTICALS: {
  id: Vertical;
  label: string;
  color: string;
  bgLight: string;
  border: string;
  badge: string;
  description: string;
}[] = [
  {
    id: 'Editorial',
    label: 'Editorial',
    color: '#38bdf8',
    bgLight: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    border: 'border-sky-500/40',
    badge: 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
    description: 'Newsletters, op-eds, research articles & publications',
  },
  {
    id: 'Public Relations',
    label: 'Public Relations',
    color: '#ec4899',
    bgLight: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    border: 'border-pink-500/40',
    badge: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
    description: 'Social media, branding, LinkedIn campaigns & press',
  },
  {
    id: 'Events',
    label: 'Events',
    color: '#8b5cf6',
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    border: 'border-purple-500/40',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    description: 'Workshops, guest speaker sessions, campus conclaves',
  },
  {
    id: 'Casebook',
    label: 'Casebook',
    color: '#10b981',
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    border: 'border-emerald-500/40',
    badge: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    description: 'Annual casebook curation, sector decks & interview prep',
  },
  {
    id: 'Apex',
    label: 'Apex',
    color: '#f59e0b',
    bgLight: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    border: 'border-amber-500/40',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    description: 'Flagship national consulting case competition',
  },
  {
    id: 'External Relations',
    label: 'External Relations',
    color: '#6366f1',
    bgLight: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    border: 'border-indigo-500/40',
    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    description: 'Corporate partnerships, sponsorships & alumni network',
  },
];

export const ASSIGNEES: {
  name: Assignee;
  avatarBg: string;
  textColor: string;
  initials: string;
}[] = [
  { name: 'Avi', avatarBg: 'bg-amber-500/20', textColor: 'text-amber-300', initials: 'AV' },
  { name: 'Ishika', avatarBg: 'bg-rose-500/20', textColor: 'text-rose-300', initials: 'IS' },
  { name: 'Nandini', avatarBg: 'bg-emerald-500/20', textColor: 'text-emerald-300', initials: 'NA' },
  { name: 'Simar', avatarBg: 'bg-purple-500/20', textColor: 'text-purple-300', initials: 'SI' },
  { name: 'Harshvardhan', avatarBg: 'bg-blue-500/20', textColor: 'text-blue-300', initials: 'HV' },
  { name: 'Animesh', avatarBg: 'bg-cyan-500/20', textColor: 'text-cyan-300', initials: 'AN' },
  { name: 'Vishakha', avatarBg: 'bg-sky-500/20', textColor: 'text-sky-300', initials: 'VK' },
  { name: 'Devanshi', avatarBg: 'bg-pink-500/20', textColor: 'text-pink-300', initials: 'DV' },
  { name: 'Somansha', avatarBg: 'bg-teal-500/20', textColor: 'text-teal-300', initials: 'SO' },
  { name: 'Akruti', avatarBg: 'bg-indigo-500/20', textColor: 'text-indigo-300', initials: 'AK' },
];

export const STATUSES: {
  id: TaskStatus;
  label: string;
  color: string;
  dotColor: string;
  headerBg: string;
  borderAccent: string;
}[] = [
  {
    id: 'To Do',
    label: 'To Do',
    color: 'text-slate-400',
    dotColor: 'bg-slate-400',
    headerBg: 'bg-slate-800/60',
    borderAccent: 'border-slate-700',
  },
  {
    id: 'In Progress',
    label: 'In Progress',
    color: 'text-sky-400',
    dotColor: 'bg-sky-400',
    headerBg: 'bg-sky-950/40',
    borderAccent: 'border-sky-500/40',
  },
  {
    id: 'Review',
    label: 'Review',
    color: 'text-amber-400',
    dotColor: 'bg-amber-400',
    headerBg: 'bg-amber-950/40',
    borderAccent: 'border-amber-500/40',
  },
  {
    id: 'Completed',
    label: 'Completed',
    color: 'text-emerald-400',
    dotColor: 'bg-emerald-400',
    headerBg: 'bg-emerald-950/40',
    borderAccent: 'border-emerald-500/40',
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
    color: 'text-red-400',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    iconName: 'Flame',
  },
  {
    id: 'High',
    label: 'High',
    color: 'text-orange-400',
    badge: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
    iconName: 'AlertTriangle',
  },
  {
    id: 'Medium',
    label: 'Medium',
    color: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    iconName: 'Clock',
  },
  {
    id: 'Low',
    label: 'Low',
    color: 'text-slate-400',
    badge: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
    iconName: 'Minus',
  },
];

export const ATTENDANCE_STATUSES: {
  id: AttendanceStatus;
  label: string;
  badge: string;
  buttonActive: string;
  dotColor: string;
  description: string;
}[] = [
  {
    id: 'Present',
    label: 'Present',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    buttonActive: 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border-emerald-500',
    dotColor: 'bg-emerald-400',
    description: 'Present and on time',
  },
  {
    id: 'Tardy',
    label: 'Tardy',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    buttonActive: 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border-amber-500',
    dotColor: 'bg-amber-400',
    description: 'Arrived late without prior intimation',
  },
  {
    id: 'Excused Tardy',
    label: 'Excused Tardy',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    buttonActive: 'bg-sky-600 text-white shadow-md shadow-sky-600/30 border-sky-500',
    dotColor: 'bg-sky-400',
    description: 'Late arrival with pre-approved notice',
  },
  {
    id: 'Absent',
    label: 'Absent',
    badge: 'bg-red-500/20 text-red-400 border-red-500/40',
    buttonActive: 'bg-red-600 text-white shadow-md shadow-red-600/30 border-red-500',
    dotColor: 'bg-red-400',
    description: 'Unexcused absence',
  },
  {
    id: 'Excused Absence',
    label: 'Excused Absence',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    buttonActive: 'bg-purple-600 text-white shadow-md shadow-purple-600/30 border-purple-500',
    dotColor: 'bg-purple-400',
    description: 'Pre-approved university/medical leave',
  },
];
