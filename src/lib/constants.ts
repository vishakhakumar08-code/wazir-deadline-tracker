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
    color: '#2563eb',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-blue-200',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    description: 'Newsletters, op-eds, research articles & publications',
  },
  {
    id: 'Public Relations',
    label: 'Public Relations',
    color: '#be185d',
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200',
    border: 'border-pink-200',
    badge: 'bg-pink-50 text-pink-700 border border-pink-200 font-semibold',
    description: 'Social media, branding, LinkedIn campaigns & press',
  },
  {
    id: 'Events',
    label: 'Events',
    color: '#6d28d9',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
    border: 'border-purple-200',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold',
    description: 'Workshops, guest speaker sessions, campus conclaves',
  },
  {
    id: 'Casebook',
    label: 'Casebook',
    color: '#047857',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    border: 'border-emerald-200',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    description: 'Annual casebook curation, sector decks & interview prep',
  },
  {
    id: 'Apex',
    label: 'Apex',
    color: '#b45309',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-amber-200',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    description: 'Flagship national consulting case competition',
  },
  {
    id: 'External Relations',
    label: 'External Relations',
    color: '#4338ca',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    border: 'border-indigo-200',
    badge: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold',
    description: 'Corporate partnerships, sponsorships & alumni network',
  },
];

export const ASSIGNEES: {
  name: Assignee;
  avatarBg: string;
  textColor: string;
  initials: string;
}[] = [
  { name: 'Avi', avatarBg: 'bg-amber-100', textColor: 'text-amber-800', initials: 'AV' },
  { name: 'Ishika', avatarBg: 'bg-rose-100', textColor: 'text-rose-800', initials: 'IS' },
  { name: 'Nandini', avatarBg: 'bg-emerald-100', textColor: 'text-emerald-800', initials: 'NA' },
  { name: 'Simar', avatarBg: 'bg-purple-100', textColor: 'text-purple-800', initials: 'SI' },
  { name: 'Harshvardhan', avatarBg: 'bg-blue-100', textColor: 'text-blue-800', initials: 'HV' },
  { name: 'Animesh', avatarBg: 'bg-cyan-100', textColor: 'text-cyan-800', initials: 'AN' },
  { name: 'Vishakha', avatarBg: 'bg-sky-100', textColor: 'text-sky-800', initials: 'VK' },
  { name: 'Devanshi', avatarBg: 'bg-pink-100', textColor: 'text-pink-800', initials: 'DV' },
  { name: 'Somansha', avatarBg: 'bg-teal-100', textColor: 'text-teal-800', initials: 'SO' },
  { name: 'Akruti', avatarBg: 'bg-indigo-100', textColor: 'text-indigo-800', initials: 'AK' },
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
    label: 'To do',
    color: 'text-slate-900',
    dotColor: 'bg-slate-400',
    headerBg: 'bg-transparent',
    borderAccent: 'border-slate-200',
  },
  {
    id: 'In Progress',
    label: 'In progress',
    color: 'text-slate-900',
    dotColor: 'bg-blue-500',
    headerBg: 'bg-transparent',
    borderAccent: 'border-slate-200',
  },
  {
    id: 'Review',
    label: 'Review',
    color: 'text-slate-900',
    dotColor: 'bg-amber-700',
    headerBg: 'bg-transparent',
    borderAccent: 'border-slate-200',
  },
  {
    id: 'Completed',
    label: 'Completed',
    color: 'text-slate-900',
    dotColor: 'bg-emerald-600',
    headerBg: 'bg-transparent',
    borderAccent: 'border-slate-200',
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
    badge: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    iconName: 'Flame',
  },
  {
    id: 'High',
    label: 'High',
    color: 'text-rose-700',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
    iconName: 'AlertTriangle',
  },
  {
    id: 'Medium',
    label: 'Medium',
    color: 'text-amber-800',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    iconName: 'Clock',
  },
  {
    id: 'Low',
    label: 'Low',
    color: 'text-slate-700',
    badge: 'bg-slate-100 text-slate-700 border border-slate-200 font-semibold',
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
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    buttonActive: 'bg-emerald-600 text-white shadow-sm border-emerald-600',
    dotColor: 'bg-emerald-500',
    description: 'Present and on time',
  },
  {
    id: 'Tardy',
    label: 'Tardy',
    badge: 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold',
    buttonActive: 'bg-amber-600 text-white shadow-sm border-amber-600',
    dotColor: 'bg-amber-500',
    description: 'Arrived late without prior intimation',
  },
  {
    id: 'Excused Tardy',
    label: 'Excused Tardy',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    buttonActive: 'bg-blue-600 text-white shadow-sm border-blue-600',
    dotColor: 'bg-blue-500',
    description: 'Late arrival with pre-approved notice',
  },
  {
    id: 'Absent',
    label: 'Absent',
    badge: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    buttonActive: 'bg-red-600 text-white shadow-sm border-red-600',
    dotColor: 'bg-red-500',
    description: 'Unexcused absence',
  },
  {
    id: 'Excused Absence',
    label: 'Excused Absence',
    badge: 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold',
    buttonActive: 'bg-purple-600 text-white shadow-sm border-purple-600',
    dotColor: 'bg-purple-500',
    description: 'Pre-approved university/medical leave',
  },
];
