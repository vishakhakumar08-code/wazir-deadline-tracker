import { Task } from '@/types/task';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'wazir-task-1',
    title: 'Independence Day Special Newsletter Release',
    description: 'Finalize editorial layout, club President address, and op-ed graphics for the national edition.',
    vertical: 'Editorial',
    assignees: [], // Starts unassigned
    status: 'Review',
    priority: 'Urgent',
    deadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-1', title: 'Proofread draft articles & op-eds', completed: true },
      { id: 'sub-2', title: 'Design Figma graphics & banner', completed: true },
      { id: 'sub-3', title: 'Mailchimp template test blast', completed: false },
    ],
    resources: ['https://figma.com/wazir-editorial', 'https://docs.google.com/document/d/wazir-newsletter'],
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-2',
    title: 'Casebook 2026 - FinTech & Payments Market Deck',
    description: 'Compile secondary research, market sizing, unit economics, and Porter 5 forces for digital banking.',
    vertical: 'Casebook',
    assignees: [], // Starts unassigned
    status: 'In Progress',
    priority: 'High',
    deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-4', title: 'Compile secondary research on UPI 2.0', completed: true },
      { id: 'sub-5', title: 'Build valuation & market size exhibits', completed: false },
      { id: 'sub-6', title: 'Draft 3 case interview practice scenarios', completed: false },
    ],
    resources: ['https://docs.google.com/presentation/d/casebook-fintech'],
    created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-3',
    title: 'Apex Strategy Case Competition Rulebook & Case Release',
    description: 'Draft problem statement with consulting partner firm and publish evaluation rubric on Unstop.',
    vertical: 'Apex',
    assignees: [], // Starts unassigned
    status: 'In Progress',
    priority: 'Urgent',
    deadline: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-7', title: 'Finalize problem statement with knowledge partner', completed: true },
      { id: 'sub-8', title: 'Configure submission portal & deadlines', completed: false },
      { id: 'sub-9', title: 'Send judge briefing invites', completed: false },
    ],
    resources: ['https://unstop.com/wazir-apex-2026'],
    created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-4',
    title: 'LinkedIn Campaign: "Consultant of the Month" Spotlight',
    description: 'Design carousel post highlighting alumni placement at MBB and boutique consulting practices.',
    vertical: 'Public Relations',
    assignees: [], // Starts unassigned
    status: 'To Do',
    priority: 'Medium',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-10', title: 'Collect alumni quote and bio', completed: false },
      { id: 'sub-11', title: 'Canva layout adhering to club brand guide', completed: false },
      { id: 'sub-12', title: 'Draft caption and hashtag strategy', completed: false },
    ],
    resources: ['https://linkedin.com/company/wazir-consulting'],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-5',
    title: 'Tier-1 Corporate Sponsorship Pitch Deck for Annual Conclave',
    description: 'Outreach deck targeting strategy consulting firms, venture funds, and FMCG corporate strategy teams.',
    vertical: 'External Relations',
    assignees: [], // Starts unassigned
    status: 'In Progress',
    priority: 'High',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-13', title: 'Update past footprint & reach statistics', completed: true },
      { id: 'sub-14', title: 'Structure tiered sponsorship packages', completed: true },
      { id: 'sub-15', title: 'Cold outreach list of 40 VP/Director contacts', completed: false },
    ],
    resources: ['https://docs.google.com/spreadsheets/d/wazir-er-leads'],
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-6',
    title: 'Consulting Workshop: Guesstimates & Market Sizing 101',
    description: 'Speaker invitation and campus amphitheatre booking for the upcoming junior cohort boot camp.',
    vertical: 'Events',
    assignees: [], // Starts unassigned
    status: 'Completed',
    priority: 'Medium',
    deadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-16', title: 'Book Auditorium B with Admin', completed: true },
      { id: 'sub-17', title: 'Print practice workbook sheets', completed: true },
      { id: 'sub-18', title: 'Confirm Senior Consultant speaker travel', completed: true },
    ],
    resources: [],
    created_at: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wazir-task-7',
    title: 'M&A Valuation Case Study Archive Curation',
    description: 'Collate and sanitize real-world restructuring and buyout case notes from senior club alumni.',
    vertical: 'Casebook',
    assignees: [], // Starts unassigned
    status: 'To Do',
    priority: 'Low',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    subtasks: [
      { id: 'sub-19', title: 'Review 5 candidate case submissions', completed: false },
      { id: 'sub-20', title: 'Format financial exhibits & appendices', completed: false },
    ],
    resources: [],
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
