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
    color: '#0284c7',
    pillBg: 'bg-[#E0F2FE]',
    pillText: 'text-[#0369A1]',
    badge: 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]',
    description: 'Newsletters, op-eds, research articles & publications',
  },
  {
    id: 'Public Relations',
    label: 'Public Relations',
    tag: 'pr',
    color: '#f59e0b',
    pillBg: 'bg-[#FEF3C7]',
    pillText: 'text-[#B45309]',
    badge: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
    description: 'Social media, branding, LinkedIn campaigns & press',
  },
  {
    id: 'Events',
    label: 'Events',
    tag: 'events',
    color: '#16a34a',
    pillBg: 'bg-[#DCFCE7]',
    pillText: 'text-[#15803D]',
    badge: 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]',
    description: 'Workshops, guest speaker sessions, campus conclaves',
  },
  {
    id: 'Casebook',
    label: 'Casebook',
    tag: 'casebook',
    color: '#e11d48',
    pillBg: 'bg-[#FFE4E6]',
    pillText: 'text-[#BE123C]',
    badge: 'bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3]',
    description: 'Annual casebook curation, sector decks & interview prep',
  },
  {
    id: 'Apex',
    label: 'Apex',
    tag: 'apex',
    color: '#9333ea',
    pillBg: 'bg-[#F3E8FF]',
    pillText: 'text-[#7E22CE]',
    badge: 'bg-[#F3E8FF] text-[#7E22CE] border border-[#E9D5FF]',
    description: 'Flagship national consulting case competition',
  },
  {
    id: 'External Relations',
    label: 'External Relations',
    tag: 'er',
    color: '#ea580c',
    pillBg: 'bg-[#FFEDD5]',
    pillText: 'text-[#C2410C]',
    badge: 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]',
    description: 'Corporate partnerships, sponsorships & alumni network',
  },
];

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
  headerBg: string;
  headerText: string;
  borderAccent: string;
}[] = [
  {
    id: 'To Do',
    label: 'TO DO',
    color: '#0284c7',
    headerBg: 'bg-[#38BDF8]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
  {
    id: 'In Progress',
    label: 'IN PROGRESS',
    color: '#eab308',
    headerBg: 'bg-[#FACC15]',
    headerText: 'text-black',
    borderAccent: 'border-black',
  },
  {
    id: 'Completed',
    label: 'COMPLETE',
    color: '#22c55e',
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
