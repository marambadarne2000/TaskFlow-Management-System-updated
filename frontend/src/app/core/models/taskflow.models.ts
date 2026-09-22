export type Role = "admin" | "employee";

export type Page =
  | "dashboard"
  | "projects"
  | "tasks"
  | "employees"
  | "notifications"
  | "attendance"
  | "payroll"
  | "chat"
  | "requests"
  | "insights"
  | "reports"
  | "automations"
  | "planner"
  | "calendar"
  | "risks"
  | "quality"
  | "action-center";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: "active" | "blocked";
  active: number;
  limit: number;
  rate: number;
  createdAt: string;
  blockedAt?: string;
  phone: string;
  cv?: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  due: string;
  createdAt: string;
  managerId: number;
  status: "planned" | "in_progress" | "completed";
  completedAt?: string;
  startDate?: string;
  budget?: number;
  plannedHours?: number;
  priority?: "low" | "medium" | "high" | "critical";
  tags?: string[];
  externalLink?: string;
  archived?: boolean;
  updatedAt?: string;
}

export interface ProjectMilestone {
  id: number;
  projectId: number;
  title: string;
  dueDate: string;
  status: "pending" | "completed";
}

export interface Task {
  id: number;
  title: string;
  projectId: number;
  workerId: number;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due: string;
  createdAt: string;
  estimatedHours?: number;
  actualMinutes?: number;
  dependencyTaskId?: number;
  labels?: string[];
}

export interface Notice {
  id: number;
  userId: number;
  text: string;
  read: boolean;
  createdAt: string;
}

export interface Attendance {
  id: number;
  userId: number;
  clockIn: string;
  clockOut?: string;
}

export interface WeeklyTarget {
  id: number;
  userId: number;
  weekStart: string;
  targetHours: number;
}

export interface ChatMessage {
  id: number;
  projectId: number;
  managerId: number;
  userId: number;
  text: string;
  fileName?: string;
  createdAt: string;
}

export interface EmployeeRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  managerId: number;
  managerName: string;
  type: "vacation" | "task_swap" | "deadline" | "late_arrival" | "general";
  taskId?: number;
  taskTitle?: string;
  swapTaskId?: number;
  swapTaskTitle?: string;
  startDate?: string;
  endDate?: string;
  requestedDueDate?: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  managerComment?: string;
  createdAt: string;
}

export interface Payslip {
  id: number;
  userId: number;
  month: string;
  hours: number;
  rate: number;
  total: number;
  availableFrom: string;
}

export interface Activity {
  id: number;
  userId: number;
  userName: string;
  action: string;
  details: string;
  createdAt: string;
}
