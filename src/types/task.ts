export type Vertical =
  | 'Editorial'
  | 'Public Relations'
  | 'Events'
  | 'Casebook'
  | 'Apex'
  | 'External Relations';

export type Assignee =
  | 'Avi'
  | 'Ishika'
  | 'Nandini'
  | 'Simar'
  | 'Harshvardhan'
  | 'Animesh'
  | 'Vishakha'
  | 'Devanshi'
  | 'Somansha'
  | 'Akruti';

export type TaskStatus = 'Backlog' | 'In Progress' | 'Review' | 'Completed';

export type TaskPriority = 'Urgent' | 'High' | 'Medium' | 'Low';

export type DeadlineUrgency = 'overdue' | 'due_soon' | 'upcoming' | 'completed';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  vertical: Vertical;
  assignees: Assignee[];
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string; // ISO 8601 string
  subtasks: SubTask[];
  resources?: string[];
  created_at?: string;
  updated_at?: string;
}

export type ViewMode = 'kanban' | 'matrix' | 'list';

export interface TaskFilterState {
  vertical: Vertical | 'ALL';
  assignee: Assignee | 'ALL' | 'UNASSIGNED';
  priority: TaskPriority | 'ALL';
  status: TaskStatus | 'ALL';
  urgency: 'ALL' | 'overdue' | 'due_soon' | 'upcoming';
  searchQuery: string;
}

export interface MemberStats {
  member: Assignee;
  total: number;
  active: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
  dueSoon: number;
  workloadScore: number; // calculated load index
}
