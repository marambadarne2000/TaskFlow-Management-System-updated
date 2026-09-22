import { Injectable } from "@angular/core";
import {
  Activity,
  Attendance,
  ChatMessage,
  Employee,
  EmployeeRequest,
  Notice,
  Page,
  Payslip,
  Project,
  ProjectMilestone,
  Role,
  Task,
  WeeklyTarget,
} from "../models/taskflow.models";
import { ApiClientService } from "./api-client.service";

@Injectable({ providedIn: "root" })
export class TaskflowStoreService {
  loggedIn = false;
  role: Role = "admin";
  currentUserId = 1;
  page: Page = "dashboard";
  loginEmail = "admin@taskflow.local";
  loginPassword = "123456";
  loginError = "";
  authMode: "login" | "forgot" | "reset" = "login";
  resetToken = "";
  newPassword = "";
  confirmPassword = "";
  resetLink = "";
  authMessage = "";
  modal:
    | ""
    | "project"
    | "projectView"
    | "task"
    | "employee"
    | "team"
    | "profile"
    | "notice" = "";
  selectedProject?: Project;
  selectedEmployee?: Employee;
  showNotices = false;
  chatProjectId = 1;
  chatManagerId = 1;
  chatText = "";
  chatFile: File | null = null;
  requests: EmployeeRequest[] = [];
  requestComments: Record<number, string> = {};
  requestForm = {
    managerId: 1,
    type: "vacation" as EmployeeRequest["type"],
    taskId: 0,
    swapTaskId: 0,
    startDate: "",
    endDate: "",
    requestedDueDate: "",
    reason: "",
  };
  projectForm = { name: "", description: "", startDate: "", due: "", budget: 0, plannedHours: 0, priority: "medium" as Project["priority"], tags: "", externalLink: "" };
  projectViewMode: "list" | "kanban" | "calendar" | "gantt" = "list";
  showArchivedProjects = false;
  milestoneForm = { title: "", dueDate: "" };
  projectMilestones: ProjectMilestone[] = [];
  editingProjectId: number | null = null;
  taskForm = {
    title: "",
    projectId: 1,
    workerId: 0,
    status: "todo" as Task["status"],
    priority: "medium" as Task["priority"],
    due: "",
    estimatedHours: 0,
    dependencyTaskId: 0,
    labels: "",
  };
  taskViewMode: "board" | "table" = "board";
  taskFocusOnly = false;
  editingTaskId: number | null = null;
  employeeForm = {
    name: "",
    email: "",
    password: "",
    phone: "",
    rate: 40,
    limit: 5,
    role: "employee" as Role,
  };
  noticeText = "";
  noticeUserId = 0;
  payrollEmployeeId = 0;
  payrollMonth = "2026-07";
  payslipYear = "";
  payslipMonthNumber = "";
  payslipMonths = [
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "10",
    "11",
    "12",
  ];
  projectYear = "";
  projectDate = "";
  projectStateFilter: "" | Project["status"] | "overdue" | "attention" = "";
  taskYear = "";
  taskDate = "";
  taskStateFilter: "" | Task["status"] | "overdue" | "soon" = "";
  projectSelectionMode = false;
  taskSelectionMode = false;
  selectedProjectIds = new Set<number>();
  selectedTaskIds = new Set<number>();
  employeeSearch = "";
  selectedCv: File | null = null;
  attendanceWeekStart = this.startOfCurrentWeek();
  attendanceView: "summary" | "details" = "summary";
  attendanceEmployeeId = 0;
  attendanceYear = "";
  attendanceMonth = "";
  weeklyTargetInputs: Record<number, number | undefined> = {};
  weeklyTargets: WeeklyTarget[] = [];

  employees: Employee[] = [
    {
      id: 1,
      name: "מנהלת המערכת",
      email: "admin@taskflow.local",
      role: "admin",
      status: "active",
      active: 0,
      limit: 10,
      rate: 70,
      createdAt: "04/08/2026 08:00",
      phone: "050-1000000",
    },
    {
      id: 2,
      name: "מרים חורי",
      email: "employee@taskflow.local",
      role: "employee",
      status: "active",
      active: 2,
      limit: 5,
      rate: 42,
      createdAt: "01/08/2026 09:15",
      phone: "050-2222222",
      cv: "maram-cv.pdf",
    },
    {
      id: 3,
      name: "אחמד עלי",
      email: "ahmad@taskflow.local",
      role: "employee",
      status: "active",
      active: 3,
      limit: 3,
      rate: 45,
      createdAt: "02/08/2026 10:30",
      phone: "050-3333333",
    },
    {
      id: 4,
      name: "סארה חנא",
      email: "sara@taskflow.local",
      role: "employee",
      status: "active",
      active: 1,
      limit: 4,
      rate: 40,
      createdAt: "03/08/2026 11:00",
      phone: "050-4444444",
    },
  ];
  projects: Project[] = [
    {
      id: 1,
      name: "אתר חנות מקוונת",
      description: "בניית חנות מוצרים פשוטה",
      due: "2026-08-20",
      createdAt: "2026-08-01",
      managerId: 1,
      status: "in_progress",
    },
    {
      id: 2,
      name: "מערכת הזמנת תורים",
      description: "מערכת לניהול תורים",
      due: "2026-08-12",
      createdAt: "2026-07-20",
      managerId: 1,
      status: "completed",
      completedAt: "04/08/2026 12:20",
    },
    {
      id: 3,
      name: "אפליקציית מלאי",
      description: "מעקב מלאי לעסק קטן",
      due: "2026-08-30",
      createdAt: "2025-12-18",
      managerId: 1,
      status: "planned",
    },
  ];
  tasks: Task[] = [
    {
      id: 1,
      title: "עיצוב מסך התחברות",
      projectId: 1,
      workerId: 2,
      status: "in_progress",
      priority: "high",
      due: "2026-08-10",
      createdAt: "2026-08-02",
    },
    {
      id: 2,
      title: "יצירת טבלת מוצרים",
      projectId: 1,
      workerId: 3,
      status: "todo",
      priority: "medium",
      due: "2026-08-14",
      createdAt: "2026-08-03",
    },
    {
      id: 3,
      title: "בדיקת טופס תורים",
      projectId: 2,
      workerId: 4,
      status: "done",
      priority: "low",
      due: "2026-08-08",
      createdAt: "2026-07-25",
    },
    {
      id: 4,
      title: "בניית API לתורים",
      projectId: 2,
      workerId: 3,
      status: "done",
      priority: "high",
      due: "2026-08-09",
      createdAt: "2025-12-22",
    },
  ];
  notifications: Notice[] = [
    {
      id: 1,
      userId: 2,
      text: 'המשימה "עיצוב מסך התחברות" הוקצתה אלייך',
      read: false,
      createdAt: "04/08/2026 13:15",
    },
  ];
  attendance: Attendance[] = [
    {
      id: 1,
      userId: 2,
      clockIn: "2026-08-03T08:00:00",
      clockOut: "2026-08-03T16:30:00",
    },
    {
      id: 11,
      userId: 2,
      clockIn: "2026-06-01T08:00:00",
      clockOut: "2026-06-01T16:30:00",
    },
    {
      id: 12,
      userId: 2,
      clockIn: "2026-06-02T08:10:00",
      clockOut: "2026-06-02T16:40:00",
    },
    {
      id: 13,
      userId: 2,
      clockIn: "2026-06-03T07:55:00",
      clockOut: "2026-06-03T16:25:00",
    },
    {
      id: 14,
      userId: 2,
      clockIn: "2026-06-04T08:05:00",
      clockOut: "2026-06-04T16:35:00",
    },
    {
      id: 15,
      userId: 2,
      clockIn: "2026-06-05T08:00:00",
      clockOut: "2026-06-05T16:30:00",
    },
  ];
  messages: ChatMessage[] = [
    {
      id: 1,
      projectId: 1,
      managerId: 1,
      userId: 1,
      text: "בוקר טוב, עדכנו כאן על התקדמות הפרויקט.",
      createdAt: "04/08/2026 09:00",
    },
  ];
  payslips: Payslip[] = [
    {
      id: 1,
      userId: 2,
      month: "2026-06",
      hours: 42.5,
      rate: 42,
      total: 1785,
      availableFrom: "2026-07-09",
    },
  ];
  activities: Activity[] = [];

  // בעת יצירת השירות נטענים נתונים שמורים ונבדק אם קיים קישור לאיפוס סיסמה
  constructor(private readonly apiClient: ApiClientService) {
    this.load();
    this.recount();
    const token = new URLSearchParams(location.search).get("reset_token");
    if (token) {
      this.resetToken = token;
      this.authMode = "reset";
    }
  }
  // מחזיר את המשתמש שמחובר כרגע
  get currentUser() {
    return (
      this.employees.find((e) => e.id === this.currentUserId) ||
      this.employees[0]
    );
  }
  // מחזיר את הכותרת המתאימה לעמוד שנבחר בתפריט.
  get pageTitle() {
    if (this.page === "dashboard") return "שלום, " + this.currentUser.name;
    const titles: Record<Page, string> = {
      dashboard: "",
      projects: "פרויקטים",
      tasks: "משימות",
      employees: "ניהול עובדים",
      notifications: "שליחת התראות",
      attendance: this.role === "admin" ? "נוכחות עובדים" : "הנוכחות שלי",
      payroll: this.role === "admin" ? "ניהול שכר" : "התלושים שלי",
      chat: "צ׳אט פרויקטים",
      requests: this.role === "admin" ? "בקשות עובדים" : "הבקשות שלי",
      insights: "תובנות ותחזיות",
      reports: "מרכז דוחות",
      automations: "מרכז אוטומציות",
      planner: "תכנון ספרינט",
      calendar: "יומן ארגוני",
      risks: "מרכז סיכונים",
      quality: "בקרת איכות",
      "action-center": "מרכז פעולה חכם",
    };
    return titles[this.page];
  }
  // מנהל רואה את כל המשימות; עובד רואה רק משימות שהוקצו אליו
  get visibleTasks() {
    return this.role === "admin"
      ? this.tasks
      : this.tasks.filter((t) => t.workerId === this.currentUserId);
  }
  // עובד רואה רק פרויקטים שבהם הוקצתה אליו לפחות משימה אחת
  get visibleProjects() {
    return this.role === "admin"
      ? this.projects
      : this.projects.filter((p) =>
          this.tasks.some(
            (t) => t.projectId === p.id && t.workerId === this.currentUserId,
          ),
        );
  }
  // מחזיר למנהל את כל הפרויקטים ולעובד רק פרויקטים שמותר לו לראות.
  get dashboardProjects() {
    return this.role === "admin" ? this.projects : this.visibleProjects;
  }
  // מחזיר את המשימות שיוצגו בדשבורד בהתאם להרשאת המשתמש.
  get dashboardTasks() {
    return this.role === "admin" ? this.tasks : this.visibleTasks;
  }
  // מסנן פרויקטים לפי השנה או התאריך שנבחרו במסך
  get displayedProjects() {
    return this.visibleProjects.filter(
      (p) =>
        (!!p.archived === this.showArchivedProjects) &&
        (!this.projectYear ||
          (p.createdAt || "").startsWith(this.projectYear)) &&
        (!this.projectDate || p.createdAt === this.projectDate) &&
        (!this.projectStateFilter ||
          (this.projectStateFilter === "overdue"
            ? p.status !== "completed" && this.daysUntil(p.due) < 0
            : this.projectStateFilter === "attention"
              ? this.projectNeedsAttention(p)
              : p.status === this.projectStateFilter)),
    );
  }
  // מסנן משימות לפי השנה או התאריך שנבחרו במסך
  get displayedTasks() {
    return this.visibleTasks.filter(
      (t) =>
        (!this.taskYear || (t.createdAt || "").startsWith(this.taskYear)) &&
        (!this.taskDate || t.createdAt === this.taskDate) &&
        (!this.taskStateFilter ||
          (this.taskStateFilter === "overdue"
            ? this.deadlineState(t) === "overdue"
            : this.taskStateFilter === "soon"
              ? this.deadlineState(t) === "soon"
              : t.status === this.taskStateFilter)),
    );
  }
  // חיפוש עובד לפי שם, אימייל או מספר טלפון
  get filteredEmployees() {
    const q = this.employeeSearch.trim().toLowerCase();
    return !q
      ? this.employees
      : this.employees.filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.email.toLowerCase().includes(q) ||
            e.phone.replace(/[-\s]/g, "").includes(q.replace(/[-\s]/g, "")),
        );
  }

  // יוצר רשימת שנים ייחודית לצורך סינון הפרויקטים.
  get projectYears() {
    return [
      ...new Set(
        this.projects
          .map((p) => (p.createdAt || "").slice(0, 4))
          .filter(Boolean),
      ),
    ]
      .sort()
      .reverse();
  }
  // יוצר רשימת שנים ייחודית לצורך סינון המשימות.
  get taskYears() {
    return [
      ...new Set(
        this.tasks.map((t) => (t.createdAt || "").slice(0, 4)).filter(Boolean),
      ),
    ]
      .sort()
      .reverse();
  }
  // מנהל יכול להשתמש בצ'אט; עובד חייב להיות משויך לפרויקט
  get canUseChat() {
    
    return this.role === "admin" || this.visibleProjects.length > 0;
  }
  // מחזיר את המנהלים הזמינים לשיחת הפרויקט שנבחר.
  get chatManagers() {
    return this.employees.filter(
      (e) => e.role === "admin" && e.status === "active",
    );
  }
  // מחזיר את חברי הצוות שרשאים להשתתף בחדר הצ׳אט.
  get chatTeam() {
    const project = this.projects.find((p) => p.id === +this.chatProjectId);
    if (!project) return [];
    const members = this.team(project);
    const manager = this.employees.find((e) => e.id === +this.chatManagerId);
    return manager && !members.some((e) => e.id === manager.id)
      ? [manager, ...members]
      : members;
  }
  // מחזיר מנהלים פעילים שאליהם עובד יכול לשלוח בקשה.
  get requestManagers() {
    return this.employees.filter(
      (employee) => employee.role === "admin" && employee.status === "active",
    );
  }
  // מחזיר לעובד את המשימות שלו שניתן לצרף לבקשה.
  get myRequestTasks() {
    return this.tasks.filter(
      (task) =>
        task.workerId === this.currentUserId && task.status !== "done",
    );
  }
  // מחזיר משימות של חברי צוות שניתן לבקש להחליף איתם.
  get swapRequestTasks() {
    const selectedTask = this.tasks.find(
      (task) => task.id === +this.requestForm.taskId,
    );
    if (!selectedTask) return [];
    return this.tasks.filter(
      (task) =>
        task.projectId === selectedTask.projectId &&
        task.workerId !== this.currentUserId &&
        task.status !== "done",
    );
  }
  // מתרגם את סוג הבקשה לשם ברור בעברית.
  requestTypeName(type: EmployeeRequest["type"]) {
    return {
      vacation: "חופשה",
      task_swap: "החלפת משימות",
      deadline: "הארכת מועד משימה",
      late_arrival: "הגעה באיחור",
      general: "בקשה כללית",
    }[type];
  }
  // מתרגם את סטטוס הבקשה לטקסט שמוצג למשתמש.
  requestStatusName(status: EmployeeRequest["status"]) {
    return {
      pending: "ממתינה",
      approved: "אושרה",
      rejected: "נדחתה",
    }[status];
  }
  // מחזיר רק התראות חדשות של המשתמש המחובר
  get unread() {
    return this.notifications.filter(
      (n) => n.userId === this.currentUserId && !n.read,
    );
  }
  // מאתר משמרת פתוחה של המשתמש המחובר שעדיין לא הסתיימה.
  get activeAttendance() {
    return this.attendance.find(
      (a) => a.userId === this.currentUserId && !a.clockOut,
    );
  }
  // מסכם את שעות העבודה של המשתמש בחודש הנוכחי.
  get monthHours() {
    return this.attendance
      .filter((a) => a.userId === this.currentUserId && a.clockOut)
      .reduce(
        (s, a) =>
          s +
          (new Date(a.clockOut!).getTime() - new Date(a.clockIn).getTime()) /
            3600000,
        0,
      );
  }
  // מחזיר לעובד המחובר רק את תלושי השכר האישיים שלו.
  get employeePayslips() {
    return this.payslips
      .filter((p) => p.userId === this.currentUserId)
      .sort((a, b) => b.month.localeCompare(a.month));
  }

  // השנים שבהן המנהל הפיק לעובד לפחות תלוש אחד
  get employeePayslipYears() {
    return [...new Set(this.employeePayslips.map((p) => p.month.slice(0, 4)))]
      .sort()
      .reverse();
  }

  // מסנן את תלושי העובד לפי השנה ומספר החודש שנבחרו
  get filteredEmployeePayslips() {
    return this.employeePayslips.filter(
      (p) =>
        (!this.payslipYear || p.month.startsWith(this.payslipYear)) &&
        (!this.payslipMonthNumber ||
          p.month.slice(5, 7) === this.payslipMonthNumber),
    );
  }

  // מחזיר את מסנני התלושים למצב של הצגת הכל
  clearPayslipFilters() {
    this.payslipYear = "";
    this.payslipMonthNumber = "";
  }
  // מאתר את התלוש שנבחר להצגה לפי עובד וחודש.
  get payrollPreview() {
    return this.payslips.find(
      (p) =>
        p.userId === +this.payrollEmployeeId && p.month === this.payrollMonth,
    );
  }
  // ממיר מזהה משתמש לשם העובד או המנהל שמוצג במסך.
  name(id: number) {
    return this.employees.find((e) => e.id === id)?.name || "לא הוקצה";
  }
  // מחזיר את פרטי העובד המלאים לצורך הצגה בתלוש השכר.
  employee(id: number) {
    return this.employees.find((e) => e.id === id);
  }
  // ממיר מזהה פרויקט לשם הפרויקט שמוצג בטבלאות.
  projectName(id: number) {
    return this.projects.find((p) => p.id === id)?.name || "";
  }
  // מסנן את מערך המשימות ומחזיר רק משימות של פרויקט מסוים.
  projectTasks(id: number) {
    return this.tasks.filter((t) => t.projectId === id);
  }
  // מחזיר רק משימות במצב מסוים עבור לוח Kanban
  tasksByStatus(status: Task["status"]) {
    return this.smartDisplayedTasks.filter((task) => task.status === status);
  }
  // מצב מיקוד מציג רק משימות פעילות של המשתמש או משימות דחופות למנהל
  get smartDisplayedTasks() {
    if (!this.taskFocusOnly) return this.displayedTasks;
    return this.displayedTasks.filter((task) => this.role === "employee" ? task.workerId === this.currentUserId && task.status !== "done" : task.status !== "done" && (task.priority === "high" || this.daysUntil(task.due) <= 3));
  }
  // בודק אם משימה חסומה בגלל תלות במשימה שטרם הושלמה
  taskBlocked(task: Task) {
    if (!task.dependencyTaskId) return false;
    return this.tasks.find((item) => item.id === task.dependencyTaskId)?.status !== "done";
  }
  // ציון בריאות משלב מועד, עדיפות, תלות וחריגה מהערכת הזמן
  taskHealth(task: Task) {
    let score = 100;
    if (this.deadlineState(task) === "overdue") score -= 45;
    else if (this.deadlineState(task) === "soon") score -= 20;
    if (task.priority === "high") score -= 10;
    if (this.taskBlocked(task)) score -= 25;
    if ((task.estimatedHours || 0) > 0 && (task.actualMinutes || 0) / 60 > (task.estimatedHours || 0)) score -= 20;
    return Math.max(0, score);
  }
  // מחזיר את שם המשימה שעליה המשימה הנוכחית תלויה
  dependencyName(task: Task) {
    return this.tasks.find((item) => item.id === task.dependencyTaskId)?.title || "";
  }
  // מחשב את אחוז ההתקדמות לפי מספר המשימות שהושלמו
  progress(p: Project) {
    const a = this.projectTasks(p.id);
    return a.length
      ? Math.round(
          (a.filter((t) => t.status === "done").length / a.length) * 100,
        )
      : 0;
  }
  // מחשב ציון סיכון לפי איחורים, זמן שעבר מול ההתקדמות ועדיפות הפרויקט
  projectRiskScore(project: Project) {
    if (project.status === "completed") return 0;
    const overdue = this.projectTasks(project.id).filter((task) => this.deadlineState(task) === "overdue").length;
    const start = new Date(project.startDate || project.createdAt).getTime();
    const end = new Date(project.due).getTime();
    const expected = end > start ? Math.max(0, Math.min(100, ((Date.now() - start) / (end - start)) * 100)) : 100;
    const progressGap = Math.max(0, expected - this.progress(project));
    const priorityBonus = project.priority === "critical" ? 20 : project.priority === "high" ? 10 : 0;
    return Math.min(100, Math.round(progressGap * 0.55 + overdue * 18 + priorityBonus));
  }
  // מתרגם את ציון הסיכון לרמה שקל להבין במסך
  projectRisk(project: Project) {
    const score = this.projectRiskScore(project);
    return score >= 70 ? "גבוה" : score >= 35 ? "בינוני" : "נמוך";
  }
  // מחזיר את אבני הדרך של פרויקט מסוים לפי סדר התאריך
  milestonesFor(projectId: number) {
    return this.projectMilestones.filter((item) => item.projectId === projectId);
  }
  // מחשב מיקום ורוחב של פרויקט בציר הזמן לתצוגת Gantt
  ganttStyle(project: Project) {
    const dates = this.displayedProjects.flatMap((item) => [new Date(item.startDate || item.createdAt).getTime(), new Date(item.due).getTime()]);
    const min = Math.min(...dates);
    const max = Math.max(...dates);
    const span = Math.max(86400000, max - min);
    const left = ((new Date(project.startDate || project.createdAt).getTime() - min) / span) * 100;
    const width = Math.max(4, ((new Date(project.due).getTime() - new Date(project.startDate || project.createdAt).getTime()) / span) * 100);
    return { right: `${Math.max(0, left)}%`, width: `${Math.min(100 - left, width)}%` };
  }
  // צוות הפרויקט מורכב מכל העובדים שהוקצו למשימות בפרויקט
  team(p: Project) {
    const ids = [...new Set(this.projectTasks(p.id).map((t) => t.workerId))];
    return this.employees.filter((e) => ids.includes(e.id));
  }
  // מתרגם ערכי סטטוס ועדיפות פנימיים לטקסט עברי ברור.
  statusText(v: string) {
    return (
      (
        {
          planned: "בתכנון",
          in_progress: "בתהליך",
          completed: "הסתיים",
          todo: "לביצוע",
          done: "הושלמה",
          active: "פעיל",
          blocked: "חסום",
          low: "נמוכה",
          medium: "בינונית",
          high: "גבוהה",
        } as any
      )[v] || v
    );
  }
  // סופר פרויקטים בדשבורד לפי הסטטוס המבוקש.
  projectsCount(status: Project["status"]) {
    return this.dashboardProjects.filter((p) => p.status === status).length;
  }
  // סופרת את העובדים הפעילים כדי להציג בדשבורד את מספר העובדים הזמינים במערכת.
  activeEmployees() {
    return this.employees.filter((e) => e.status === "active").length;
  }
  // סופר משימות לפי הסטטוס המבוקש.
  taskCount(status: Task["status"]) {

    return this.dashboardTasks.filter((t) => t.status === status).length;
  }
  // מחשב את אחוז המשימות בסטטוס מסוים מתוך כלל המשימות.
  taskPercent(status: Task["status"]) {
    return this.dashboardTasks.length
      ? Math.round((this.taskCount(status) / this.dashboardTasks.length) * 100)
      : 0;
  }
  // יוצר את צבעי הגרף המעגלי לפי מצבי המשימות
  donutStyle() {
    const total = this.dashboardTasks.length;
    if (!total) return "conic-gradient(#263653 0 100%)";
    const todo = (this.taskCount("todo") / total) * 100;
    const doing = todo + (this.taskCount("in_progress") / total) * 100;
    return `conic-gradient(#25d3e6 0 ${todo}%, #250eac ${todo}% ${doing}%, #36d7a4 ${doing}% 100%)`;
  }

  // מחשב כמה ימים נשארו עד מועד המשימה
  daysUntil(due: string) {
    const today = new Date();
    //האפס מציג את התאריך הנוכחי ללא השעה כדי שהחישוב יהיה מדויק גם אם השעה כבר עברה
    today.setHours(0, 0, 0, 0);
    //המשתנה כאן מכיל את תאריך היעד של המשימה, גם הוא ללא השעה כדי שהחישוב יהיה מדויק
    const dueDate = new Date(due + "T00:00:00");
    //ה-Math.ceil מחזיר את מספר הימים שלמים שנותרו עד מועד הסיום, כולל היום הנוכחי אם הוא עדיין לא עבר
    //החישוב מתבצע על ידי חיסור התאריך הנוכחי מהתאריך של המשימה, והחלקת התוצאה למעלה כדי לקבל את מספר הימים השלם
  
    return Math.ceil((dueDate.getTime() - today.getTime()) / 86400000);
  }

  // מחזיר מצב תאריך: איחור, מועד קרוב או מצב רגיל
  deadlineState(task: Task) {
    if (task.status === "done") return "normal";
    const days = this.daysUntil(task.due);
    if (days < 0) return "overdue";
    if (days <= 3) return "soon";
    return "normal";
  }

  // מחזיר משימות פעילות שמועד הסיום שלהן כבר עבר.
  get overdueTasks() {
    return this.dashboardTasks.filter(
      (task) => this.deadlineState(task) === "overdue",
    );
  }

  // מחזיר משימות פעילות שמסתיימות בשלושת הימים הקרובים.
  get dueSoonTasks() {
    return this.dashboardTasks.filter(
      (task) => this.deadlineState(task) === "soon",
    );
  }

  // פרויקט דורש טיפול אם קיימת בו לפחות משימה אחת באיחור
  projectNeedsAttention(project: Project) {
    return this.projectTasks(project.id).some(
      (task) => this.deadlineState(task) === "overdue",
    );
  }
  // סופר כמה משימות העובד כבר השלים.
  doneTasks() {
    return this.visibleTasks.filter((t) => t.status === "done").length;
  }
  // סופר כמה משימות של העובד עדיין פעילות.
  openTasks() {
    return this.visibleTasks.filter((t) => t.status !== "done").length;
  }
  // מחשב את משך המשמרת בשעות לפי זמני הכניסה והיציאה.
  attendanceHours(a: Attendance) {
    return a.clockOut
      ? (new Date(a.clockOut).getTime() - new Date(a.clockIn).getTime()) /
          3600000
      : 0;
  }

 // מחזיר את יום ראשון של השבוע הנוכחי בפורמט שמתאים לשדה תאריך ול-מסד הנתונים
  private startOfCurrentWeek() {
    const date = new Date();
    date.setDate(date.getDate() - date.getDay());
    return this.localDate(date);
  }

 // הופך תאריך מקומי ל-שנה־חודש־יום בלי שינוי בגלל אזור זמן
  private localDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // מחזיר את מכסת העובד בשבוע שנבחר אם לא נקבעה מכסה, ברירת המחדל היא 40 שעות
  weeklyTargetHours(userId: number) {
    return (
      this.weeklyTargets.find(
        (target) =>
          target.userId === userId &&
          target.weekStart === this.attendanceWeekStart,
      )?.targetHours ?? 40
    );
  }

  // מסכם את שעות העבודה של עובד רק בתוך השבוע שנבחר
  weeklyWorkedHours(userId: number) {
    const start = new Date(this.attendanceWeekStart + "T00:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return this.attendance
      .filter((item) => {
        const clockIn = new Date(item.clockIn.replace(" ", "T"));
        return item.userId === userId && clockIn >= start && clockIn < end;
      })
      .reduce((sum, item) => sum + this.attendanceHours(item), 0);
  }

  // קובע את צבע השורה: פחות מהמכסה אדום, מעל המכסה צהוב ושווה למכסה ירוק
  weeklyAttendanceState(userId: number) {
    const difference =
      this.weeklyWorkedHours(userId) - this.weeklyTargetHours(userId);
    if (difference < -0.01) return "under";
    if (difference > 0.01) return "over";
    return "complete";
  }

  // מחזיר תיאור של מצב העמידה במכסת השעות השבועית.
  weeklyAttendanceText(userId: number) {
    const state = this.weeklyAttendanceState(userId);
    if (state === "under") return "חסרות שעות";
    if (state === "over") return "עבודה מעל המכסה";
    return "המכסה הושלמה";
  }

  // מחשב את ההפרש בין שעות העבודה בפועל למכסה השבועית.
  weeklyDifference(userId: number) {
    return this.weeklyWorkedHours(userId) - this.weeklyTargetHours(userId);
  }

  // מסכם את שעות הנוכחות שנשארו לאחר הפעלת הסינונים.
  filteredAttendanceHours() {
    return this.filteredAttendance.reduce(
      (sum, item) => sum + this.attendanceHours(item),
      0,
    );
  }

  // מחזיר את שם היום בעברית לפי תאריך הכניסה
  attendanceDay(clockIn: string) {
    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    return days[new Date(clockIn.replace(" ", "T")).getDay()];
  }

 // שומר ב-מסד הנתונים את מכסת השעות שהמנהל הזין לעובד בשבוע שנבחר
  async saveWeeklyTarget(userId: number) {
    const targetHours = Number(
      this.weeklyTargetInputs[userId] ?? this.weeklyTargetHours(userId),
    );
    try {
      await this.apiClient.request("weekly-target-save", "POST", {
        user_id: userId,
        week_start: this.attendanceWeekStart,
        target_hours: targetHours,
      });
      const old = this.weeklyTargets.find(
        (item) =>
          item.userId === userId && item.weekStart === this.attendanceWeekStart,
      );
      if (old) old.targetHours = targetHours;
      else
        this.weeklyTargets.push({
          id: Date.now(),
          userId,
          weekStart: this.attendanceWeekStart,
          targetHours,
        });
      alert("מכסת השעות נשמרה בהצלחה");
    } catch (error: any) {
      alert(error.message);
    }
  }

  // פותח את דף הנוכחות המפורט של העובד שנבחר
  openAttendanceDetails(userId: number) {
    this.attendanceEmployeeId = userId;
    this.attendanceYear = "";
    this.attendanceMonth = "";
    this.attendanceView = "details";
  }

  // מחזיר את רשימת השנים שבהן קיימת נוכחות לעובד שנבחר
  get attendanceYears() {
    return [
      ...new Set(
        this.attendance
          .filter((item) => item.userId === this.attendanceEmployeeId)
          .map((item) => item.clockIn.slice(0, 4)),
      ),
    ]
      .sort()
      .reverse();
  }

  // מסנן את הכניסות והיציאות לפי העובד, השנה והחודש שנבחרו
  get filteredAttendance() {
    return this.attendance.filter(
      (item) =>
        item.userId === this.attendanceEmployeeId &&
        (!this.attendanceYear ||
          item.clockIn.startsWith(this.attendanceYear)) &&
        (!this.attendanceMonth ||
          item.clockIn.slice(5, 7) === this.attendanceMonth),
    );
  }

  // מאפס את סינוני הנוכחות ומחזיר את כל הרשומות.
  clearAttendanceFilters() {
    this.attendanceYear = "";
    this.attendanceMonth = "";
  }
  // מחזיר את המשמרות שעליהן מבוסס תלוש השכר.
  payslipDays(p: Payslip) {
    return this.attendance.filter(
      (a) =>
        a.userId === p.userId && a.clockOut && a.clockIn.startsWith(p.month),
    );
  }
  // מחשב את ניכוי הפנסיה מתוך השכר ברוטו.
  pension(p: Payslip) {
    return p.total * 0.06;
  }
  // מחשב את ניכוי הביטוח מתוך השכר ברוטו.
  insurance(p: Payslip) {
    return p.total * 0.035;
  }
  // מס הכנסה נשאר אפס כל עוד לא נשמרו במערכת נקודות זיכוי ונתוני מס אישיים.
  incomeTax(_p: Payslip) {
    return 0;
  }
  // מחשב את סך הניכויים שנגרעים בפועל מהשכר ברוטו במערכת.
  totalDeductions(p: Payslip) {
    return this.pension(p) + this.insurance(p) + this.incomeTax(p);
  }
  // מחשב הפרשת מעסיק לפנסיה לצורך הצגה ואינו מפחית אותה מהנטו.
  employerPension(p: Payslip) {
    return p.total * 0.065;
  }
  // מחשב הפרשת מעסיק לפיצויים לצורך הצגה בתלוש.
  employerSeverance(p: Payslip) {
    return p.total * 0.06;
  }
  // מחשב שכר נטו לאחר הפחתת הניכויים.
  netSalary(p: Payslip) {
    return p.total - this.totalDeductions(p);
  }

 // שולח את פרטי הכניסה לצד השרת ומסנכרן נתונים ממסד הנתונים ופותח את הדשבורד המתאים
  async login() {
    try {
      const r = await this.apiClient.request("login", "POST", {
        email: this.loginEmail,
        password: this.loginPassword,
      });
      this.role = r.user.role;
      this.currentUserId = +r.user.id;

      let user = this.employees.find((e) => e.id === this.currentUserId);
      if (!user) {
        user = {
          id: this.currentUserId,
          name: r.user.full_name || r.user.name || r.user.email,
          email: r.user.email,
          role: r.user.role,
          status: "active",
          active: 0,
          limit: +r.user.max_active_tasks || 5,
          rate: +r.user.hourly_rate || 40,
          createdAt: r.user.created_at || new Date().toLocaleString("he-IL"),
          phone: r.user.phone || "",
        };
        this.employees.push(user);
      } else {
        user.role = r.user.role;
        user.name = r.user.full_name || r.user.name || user.name;
        user.email = r.user.email || user.email;
      }

      await this.refreshData();
      this.loggedIn = true;
      this.loginError = "";
      this.persist();
      const first = this.visibleProjects[0];
      if (first) this.chatProjectId = first.id;
      this.chatManagerId =
        this.role === "admin" ? this.currentUserId : first?.managerId || 1;
    } catch (e: any) {
      this.loginError = e.message || "לא ניתן להתחבר לשרת";
    }
  }
 // סוגר את ה-נתוני ההתחברות השמורים בשרת בשרת ומאפס את מצב המשתמש בממשק.
  async logout() {
    try {
      await this.apiClient.request("logout", "POST");
    } catch {
    }
    this.loggedIn = false;
    this.page = "dashboard";
    this.showNotices = false;
  }
  // פותח טופס ריק ליצירת פרויקט חדש.
  openProject() {
    this.editingProjectId = null;
    this.projectForm = { name: "", description: "", startDate: new Date().toISOString().slice(0, 10), due: "", budget: 0, plannedHours: 0, priority: "medium", tags: "", externalLink: "" };
    this.modal = "project";
  }
  // מעתיק את נתוני הפרויקט לטופס כדי לאפשר עריכה.
  editProject(p: Project) {
    this.editingProjectId = p.id;
    this.projectForm = {
      name: p.name,
      description: p.description || "",
      startDate: p.startDate || p.createdAt,
      due: p.due,
      budget: p.budget || 0,
      plannedHours: p.plannedHours || 0,
      priority: p.priority || "medium",
      tags: (p.tags || []).join(", "),
      externalLink: p.externalLink || "",
    };
    this.modal = "project";
  }
  // שומר פרויקט חדש בבסיס הנתונים ומוסיף אותו מיד למסך
  async saveProject() {
    if (!this.projectForm.name || !this.projectForm.due) return;
    try {
      if (this.editingProjectId !== null) {
        await this.apiClient.request("project-update", "POST", {
          id: this.editingProjectId,
          name: this.projectForm.name,
          description: this.projectForm.description,
          start_date: this.projectForm.startDate,
          due_date: this.projectForm.due,
          budget: this.projectForm.budget,
          planned_hours: this.projectForm.plannedHours,
          priority: this.projectForm.priority,
          tags: this.projectForm.tags,
          external_link: this.projectForm.externalLink,
        });
        const project = this.projects.find((p) => p.id === this.editingProjectId);
        if (project) Object.assign(project, this.projectForm, { tags: this.projectForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean) });
        this.editingProjectId = null;
        this.modal = "";
        this.persist();
        return;
      }
      const r = await this.apiClient.request("project-create", "POST", {
        name: this.projectForm.name,
        description: this.projectForm.description,
        start_date: this.projectForm.startDate,
        due_date: this.projectForm.due,
        budget: this.projectForm.budget,
        planned_hours: this.projectForm.plannedHours,
        priority: this.projectForm.priority,
        tags: this.projectForm.tags,
        external_link: this.projectForm.externalLink,
      });
      this.projects.push({
        id: +r.id,
        ...this.projectForm,
        createdAt: new Date().toISOString().slice(0, 10),
        managerId: this.currentUserId,
        status: "planned",
        startDate: this.projectForm.startDate,
        tags: this.projectForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      this.modal = "";
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מעביר פרויקט לארכיון או משחזר אותו ושומר את כל המידע
  async archiveProject(project: Project) {
    const archived = !project.archived;
    if (!confirm(archived ? `להעביר את "${project.name}" לארכיון?` : `לשחזר את "${project.name}"?`)) return;
    await this.apiClient.request("project-archive", "POST", { id: project.id, archived });
    await this.refreshData();
  }
  // יוצר עותק חדש של הפרויקט ושל המשימות כבסיס לעבודה חדשה
  async cloneProject(project: Project) {
    if (!confirm(`ליצור עותק חדש של "${project.name}"?`)) return;
    await this.apiClient.request("project-clone", "POST", { id: project.id });
    await this.refreshData();
  }
  // מוסיף אבן דרך חדשה לפרויקט שנבחר
  async addMilestone(project: Project) {
    if (!this.milestoneForm.title.trim() || !this.milestoneForm.dueDate) return;
    await this.apiClient.request("milestone-save", "POST", { project_id: project.id, title: this.milestoneForm.title, due_date: this.milestoneForm.dueDate });
    this.milestoneForm = { title: "", dueDate: "" };
    await this.refreshData();
  }
  // מסמן אבן דרך כהושלמה או מחזיר אותה לביצוע
  async toggleMilestone(item: ProjectMilestone) {
    await this.apiClient.request("milestone-save", "POST", { ...item, project_id: item.projectId, due_date: item.dueDate, status: item.status === "completed" ? "pending" : "completed" });
    await this.refreshData();
  }
  // מוחק פרויקט לאחר אישור ומסיר גם את המשימות הקשורות אליו.
  async deleteProject(p: Project) {
    const taskCount = this.projectTasks(p.id).length;
    const warning = taskCount
      ? `למחוק את הפרויקט "${p.name}" ואת ${taskCount} המשימות שלו?`
      : `למחוק את הפרויקט "${p.name}"?`;
    if (!confirm(warning)) return;
    try {
      await this.apiClient.request("project-delete", "POST", { ids: [p.id] });
      if (this.selectedProject?.id === p.id) this.selectedProject = undefined;
      await this.refreshData();
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מפעיל מצב בחירה בפרויקטים ומנקה בחירה ישנה כאשר יוצאים ממנו.
  toggleProjectSelectionMode() {
    this.projectSelectionMode = !this.projectSelectionMode;
    if (!this.projectSelectionMode) this.selectedProjectIds.clear();
  }
  // מוסיף או מסיר פרויקט מרשימת הפריטים שנבחרו למחיקה.
  toggleProjectSelection(id: number, selected: boolean) {
    selected ? this.selectedProjectIds.add(id) : this.selectedProjectIds.delete(id);
  }
  // בוחר או מבטל את כל הפרויקטים שמוצגים כעת לאחר הסינון.
  toggleAllDisplayedProjects(selected: boolean) {
    this.displayedProjects.forEach((project) =>
      selected ? this.selectedProjectIds.add(project.id) : this.selectedProjectIds.delete(project.id),
    );
  }
  // מוחק יחד את הפרויקטים שנבחרו ואת הנתונים המקושרים אליהם רק לאחר אישור מפורש.
  async deleteSelectedProjects() {
    const ids = [...this.selectedProjectIds];
    if (!ids.length) return alert("יש לבחור לפחות פרויקט אחד");
    const taskCount = this.tasks.filter((task) => ids.includes(task.projectId)).length;
    if (!confirm(`למחוק ${ids.length} פרויקטים שנבחרו ואת ${taskCount} המשימות המקושרות אליהם?`)) return;
    try {
      await this.apiClient.request("project-delete", "POST", { ids });
      this.selectedProjectIds.clear();
      this.projectSelectionMode = false;
      await this.refreshData();
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // פותח טופס חדש למשימה ומאפשר לקשר אותה לפרויקט מסוים.
  openTask(projectId?: number) {
    this.editingTaskId = null;
    this.taskForm = {
      title: "",
      projectId: projectId || this.projects[0].id,
      workerId: 0,
      status: "todo",
      priority: "medium",
      due: "",
      estimatedHours: 0,
      dependencyTaskId: 0,
      labels: "",
    };
    this.modal = "task";
  }
  // טוען משימה קיימת לטופס לצורך עריכה.
  editTask(t: Task) {
    this.editingTaskId = t.id;
    this.taskForm = {
      title: t.title,
      projectId: t.projectId,
      workerId: t.workerId,
      status: t.status,
      priority: t.priority,
      due: t.due,
      estimatedHours: t.estimatedHours || 0,
      dependencyTaskId: t.dependencyTaskId || 0,
      labels: (t.labels || []).join(", "),
    };
    this.modal = "task";
  }
  // בודק את מגבלת העובד, יוצר משימה ושולח לעובד התראה
  async saveTask() {
    const worker = this.employees.find((e) => e.id === +this.taskForm.workerId);
    if (!worker || worker.role !== "employee") {
      alert("יש לבחור עובד למשימה");
      return;
    }
    if (worker.status === "blocked") {
      alert("לא ניתן להקצות משימה לעובד חסום");
      return;
    }
    const editedTask = this.editingTaskId === null
      ? undefined
      : this.tasks.find((task) => task.id === this.editingTaskId);
    const activeWithoutEditedTask = worker.active -
      (editedTask && editedTask.workerId === worker.id && editedTask.status !== "done" ? 1 : 0);
    if (activeWithoutEditedTask >= worker.limit) {
      alert(`${worker.name} הגיע/ה למגבלת ${worker.limit} משימות פעילות`);
      return;
    }
    if (!this.taskForm.title || !this.taskForm.due) return;
    try {
      if (this.editingTaskId !== null) {
        const previousProjectId = editedTask?.projectId;
        await this.apiClient.request("task-update", "POST", {
          id: this.editingTaskId,
          project_id: +this.taskForm.projectId,
          assignee_id: +this.taskForm.workerId,
          title: this.taskForm.title,
          priority: this.taskForm.priority,
          due_date: this.taskForm.due,
          estimated_hours: this.taskForm.estimatedHours,
          dependency_task_id: +this.taskForm.dependencyTaskId || null,
          labels: this.taskForm.labels,
        });
        if (editedTask) {
          Object.assign(editedTask, {
            ...this.taskForm,
            projectId: +this.taskForm.projectId,
            workerId: +this.taskForm.workerId,
            estimatedHours: +this.taskForm.estimatedHours || 0,
            dependencyTaskId: +this.taskForm.dependencyTaskId || undefined,
            labels: this.taskForm.labels.split(",").map((label) => label.trim()).filter(Boolean),
          });
        }
        this.editingTaskId = null;
        this.modal = "";
        this.recount();
        if (previousProjectId) this.updateProject(previousProjectId);
        this.updateProject(+this.taskForm.projectId);
        this.persist();
        return;
      }
      const r = await this.apiClient.request("task-create", "POST", {
        project_id: +this.taskForm.projectId,
        assignee_id: +this.taskForm.workerId,
        title: this.taskForm.title,
        priority: this.taskForm.priority,
        due_date: this.taskForm.due,
        estimated_hours: this.taskForm.estimatedHours,
        dependency_task_id: +this.taskForm.dependencyTaskId || null,
        labels: this.taskForm.labels,
      });
      this.tasks.push({
        id: +r.id,
        ...this.taskForm,
        projectId: +this.taskForm.projectId,
        workerId: +this.taskForm.workerId,
        createdAt: new Date().toISOString().slice(0, 10),
        estimatedHours: +this.taskForm.estimatedHours || 0,
        dependencyTaskId: +this.taskForm.dependencyTaskId || undefined,
        labels: this.taskForm.labels.split(",").map((label) => label.trim()).filter(Boolean),
      });
      this.notifications.push({
        id: Date.now() + 1,
        userId: +this.taskForm.workerId,
        text: `משימה חדשה הוקצתה אליך: ${this.taskForm.title}`,
        read: false,
        createdAt: new Date().toLocaleString("he-IL"),
      });
      this.modal = "";
      this.recount();
      this.updateProject(+this.taskForm.projectId);
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מוחק משימה ומחשב מחדש את עומס העובד ומצב הפרויקט.
  async deleteTask(t: Task) {
    if (!confirm(`למחוק את המשימה "${t.title}"?`)) return;
    try {
      await this.apiClient.request("task-delete", "POST", { ids: [t.id] });
      await this.refreshData();
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מפעיל מצב בחירה במשימות ומנקה בחירה ישנה כאשר יוצאים ממנו.
  toggleTaskSelectionMode() {
    this.taskSelectionMode = !this.taskSelectionMode;
    if (!this.taskSelectionMode) this.selectedTaskIds.clear();
  }
  // מוסיף או מסיר משימה מרשימת הפריטים שנבחרו למחיקה.
  toggleTaskSelection(id: number, selected: boolean) {
    selected ? this.selectedTaskIds.add(id) : this.selectedTaskIds.delete(id);
  }
  // בוחר או מבטל את כל המשימות שמוצגות כעת לאחר הסינון.
  toggleAllDisplayedTasks(selected: boolean) {
    this.displayedTasks.forEach((task) =>
      selected ? this.selectedTaskIds.add(task.id) : this.selectedTaskIds.delete(task.id),
    );
  }
  // מוחק יחד את המשימות שנבחרו ומרענן את עומסי העובדים ומצבי הפרויקטים מהשרת.
  async deleteSelectedTasks() {
    const ids = [...this.selectedTaskIds];
    if (!ids.length) return alert("יש לבחור לפחות משימה אחת");
    if (!confirm(`למחוק ${ids.length} משימות שנבחרו?`)) return;
    try {
      await this.apiClient.request("task-delete", "POST", { ids });
      this.selectedTaskIds.clear();
      this.taskSelectionMode = false;
      await this.refreshData();
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מאפס את כל מסנני רשימת הפרויקטים.
  clearProjectFilters() {
    this.projectYear = "";
    this.projectDate = "";
    this.projectStateFilter = "";
  }
  // מאפס את כל מסנני רשימת המשימות.
  clearTaskFilters() {
    this.taskYear = "";
    this.taskDate = "";
    this.taskStateFilter = "";
  }
  // מעדכן מצב משימה ולאחר מכן מחשב מחדש את מצב הפרויקט
  async changeTask(t: Task, status: Task["status"]) {
    let result: { unlocked_tasks?: { id: number; title: string }[] } = {};
    try {
      result = await this.apiClient.request("task-status", "POST", { id: t.id, status });
    } catch (error: any) {
      alert(error.message || "לא ניתן לעדכן את המשימה");
      return;
    }
    t.status = status;
    if (status === "done") {
      const unlocked = result.unlocked_tasks || [];
      alert(unlocked.length
        ? `המשימה הושלמה ונפתח השלב הבא: ${unlocked.map((item) => item.title).join(", ")}`
        : "המשימה הושלמה בהצלחה");
      await this.refreshData();
    }
    this.recount();
    this.updateProject(t.projectId);
    this.persist();
  }
  // מוסיף דיווח זמן קצר למשימה ומרענן את הנתונים מהשרת
  async logTaskTime(task: Task) {
    const hoursText = prompt("כמה שעות עבדת על המשימה?", "1");
    if (hoursText === null) return;
    const hours = Number(hoursText);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return alert("יש להכניס מספר שעות בין 0 ל-24");
    const note = prompt("הערה קצרה על העבודה שבוצעה", "") || "";
    await this.apiClient.request("task-log-time", "POST", { task_id: task.id, minutes: Math.round(hours * 60), note });
    await this.refreshData();
  }
  // אם כל משימות הפרויקט הושלמו, הפרויקט מסומן אוטומטית כהסתיים
  updateProject(id: number) {
    const p = this.projects.find((x) => x.id === id);
    if (!p) return;
    const list = this.projectTasks(id);
    if (list.length && list.every((t) => t.status === "done")) {
      p.status = "completed";
      p.completedAt = new Date().toLocaleString("he-IL");
    } else if (list.length) p.status = "in_progress";
    else p.status = "planned";
  }
  // פותח חלון המציג את חברי הצוות של הפרויקט.
  openTeam(p: Project) {
    this.selectedProject = p;
    this.modal = "team";
  }
  // פותח חלון המציג את פרטי הפרויקט המלאים.
  openProjectView(p: Project) {
    this.selectedProject = p;
    this.modal = "projectView";
  }
  // פותח את הכרטיס האישי של העובד שנבחר.
  openProfile(e: Employee) {
    this.selectedEmployee = e;
    this.modal = "profile";
  }
  // פותח טופס ריק להוספת עובד חדש.
  openEmployee() {
    this.employeeForm = {
      name: "",
      email: "",
      password: "",
      phone: "",
      rate: 40,
      limit: 5,
      role: "employee",
    };
    this.selectedCv = null;
    this.modal = "employee";
  }
  // שומר את קובץ קורות החיים שנבחר עד לשליחתו לשרת.
  onCvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedCv = input.files?.[0] || null;
  }
  // יוצר עובד עם סיסמה ראשונית ומעלה קורות חיים אם נבחר קובץ
  async saveEmployee() {
    if (
      !this.employeeForm.name ||
      !this.employeeForm.email ||
      !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(this.employeeForm.password)
    ) {
      alert("יש להזין שם, אימייל וסיסמה של 8 תווים לפחות הכוללת אות ומספר");
      return;
    }
    try {
      const r = await this.apiClient.request("user-create", "POST", {
        full_name: this.employeeForm.name,
        email: this.employeeForm.email,
        password: this.employeeForm.password,
        phone: this.employeeForm.phone,
        role: this.employeeForm.role,
        hourly_rate: this.employeeForm.rate,
        max_active_tasks: this.employeeForm.limit,
      });
      let cvName = "";
      if (this.selectedCv) {
        const form = new FormData();
        form.append("user_id", String(r.id));
        form.append("cv", this.selectedCv);
        const result = await this.apiClient.upload(
          "user-upload-cv",
          form,
        );
        cvName = result.file;
      }
      const { password, ...safe } = this.employeeForm;
      this.employees.push({
        id: +r.id,
        ...safe,
        cv: cvName,
        status: "active",
        active: 0,
        createdAt: new Date().toLocaleString("he-IL"),
      });
      this.modal = "";
      this.persist();
      alert("העובד נוסף ויכול להתחבר עם האימייל והסיסמה שנקבעו");
    } catch (e: any) {
      alert(e.message);
    }
  }
 // חוסם או מפעיל עובד ושומר את השינוי ב-מסד הנתונים
  async toggleEmployee(e: Employee) {
    const next = e.status === "active" ? "blocked" : "active";
    try {
      await this.apiClient.request("user-status", "POST", { user_id: e.id, status: next });
      e.status = next;
      e.blockedAt =
        e.status === "blocked" ? new Date().toLocaleString("he-IL") : undefined;
      this.persist();
    } catch (error: any) {
      alert(error.message);
    }
  }
  // משנה תפקיד בין עובד למנהל רק מנהל רשאי לבצע פעולה זו
  async toggleRole(e: Employee) {
    const next: Role = e.role === "admin" ? "employee" : "admin";
    try {
      await this.apiClient.request("user-role", "POST", { user_id: e.id, role: next });
      e.role = next;
      this.persist();
      alert(
        `התפקיד של ${e.name} שונה ל${next === "admin" ? "מנהל/ת" : "עובד/ת"}. השינוי יופיע בכניסה הבאה.`,
      );
    } catch (error: any) {
      alert(error.message);
    }
  }
  // שולח התראה לעובד אחד או לכל המשתמשים הפעילים
  async sendNotice() {
    if (!this.noticeText) return;
    try {
      const r = await this.apiClient.request("notification-send", "POST", {
        user_id: +this.noticeUserId,
        title: "הודעה מהמנהל",
        message: this.noticeText,
      });
      const now = new Date().toLocaleString("he-IL");
      if (+this.noticeUserId === 0) {
        this.employees
          .filter((e) => e.role === "employee" && e.status === "active")
          .forEach((e, index) =>
            this.notifications.push({
              id: Date.now() + index,
              userId: e.id,
              text: this.noticeText,
              read: false,
              createdAt: now,
            }),
          );
      } else {
        this.notifications.push({
          id: +r.id,
          userId: +this.noticeUserId,
          text: this.noticeText,
          read: false,
          createdAt: now,
        });
      }
      const count = r.sent_to || 1;
      this.noticeText = "";
      this.modal = "";
      this.persist();
      alert(`ההתראה נשלחה בהצלחה ל־${count} משתמשים`);
    } catch (e: any) {
      alert(e.message);
    }
  }
  // מסמן התראה כנקראה גם בשרת וגם בממשק
  async markRead(n: Notice) {
    try {
      await this.apiClient.request("notification-read", "POST", { id: n.id });
    } catch {}
    n.read = true;
    this.persist();
  }
  // פותח משמרת חדשה ושומר את שעת הכניסה
  async clockIn() {
    if (this.activeAttendance) return;
    try {
      await this.apiClient.request("clock-in", "POST", {});
    } catch (e: any) {
      alert(e.message);
      return;
    }
    this.attendance.push({
      id: Date.now(),
      userId: this.currentUserId,
      clockIn: new Date().toISOString(),
    });
    this.persist();
  }
  // סוגר את המשמרת הפעילה ושומר את שעת היציאה
  async clockOut() {
    const a = this.activeAttendance;
    if (!a) return;
    try {
      await this.apiClient.request("clock-out", "POST", {});
    } catch (e: any) {
      alert(e.message);
      return;
    }
    a.clockOut = new Date().toISOString();
    this.persist();
  }
  // פותח צ'אט רק אם למשתמש קיימת הרשאה לפרויקט
  openChat() {
    if (!this.canUseChat) {
      alert("אין לך פרויקט פעיל ולכן אין לך גישה לצ׳אט");
      return;
    }
    const first = this.visibleProjects[0];
    if (
      first &&
      !this.visibleProjects.some((p) => p.id === +this.chatProjectId)
    )
      this.chatProjectId = first.id;
    this.chatManagerId =
      this.role === "admin" ? this.currentUserId : first?.managerId || 1;
    this.page = "chat";
    void this.loadChat();
  }
  // טוען מהשרת את הודעות חדר הפרויקט הנבחר.
  async loadChat() {
    if (!this.chatProjectId || !this.chatManagerId) return;
    try {
      const result = await this.apiClient.request(
        `chat-list&project_id=${+this.chatProjectId}&manager_id=${+this.chatManagerId}`,
      );
      const managerId =
        this.role === "admin" ? this.currentUserId : +this.chatManagerId;
      this.messages = this.messages.filter(
        (message) =>
          message.projectId !== +this.chatProjectId ||
          message.managerId !== managerId,
      );
      this.messages.push(
        ...result.items.map((message: any) => ({
          id: +message.id,
          projectId: +message.project_id,
          managerId: +message.manager_id,
          userId: +message.user_id,
          text: message.message,
          fileName: message.file_name || undefined,
          createdAt: message.created_at,
        })),
      );
    } catch (error: any) {
      alert(error.message);
    }
  }
  // שולח הודעה לחדר שמזוהה לפי פרויקט ולפי מנהל
  async sendChat() {
    const allowed =
      this.role === "admin" ||
      this.tasks.some(
        (t) =>
          t.projectId === +this.chatProjectId &&
          t.workerId === this.currentUserId,
      );
    if (!allowed) {
      alert("אין לך הרשאה לשיחה של הפרויקט הזה");
      return;
    }
    if (!this.chatText.trim()) return;
    const text = this.chatText.trim();
    const managerId =
      this.role === "admin" ? this.currentUserId : +this.chatManagerId;
    try {
      const r = await this.apiClient.request("chat-send", "POST", {
        project_id: +this.chatProjectId,
        manager_id: managerId,
        message: text,
      });
      this.messages.push({
        id: +r.id,
        projectId: +this.chatProjectId,
        managerId,
        userId: this.currentUserId,
        text,
        createdAt: new Date().toLocaleString("he-IL"),
      });
      this.chatText = "";
      this.persist();
    } catch (e: any) {
      alert(e.message);
    }
  }
  // שומר את הקובץ שנבחר לצירוף בצ׳אט.
  selectChatFile(event: Event) {
    const input = event.target as HTMLInputElement;
    this.chatFile = input.files?.[0] || null;
  }
  // בודק את הקובץ ומעלה אותו לחדר הצ׳אט בשרת.
  async uploadChatFile() {
    if (!this.chatFile) return;
    const form = new FormData();
    form.append("file", this.chatFile);
    form.append("project_id", String(+this.chatProjectId));
    form.append(
      "manager_id",
      String(this.role === "admin" ? this.currentUserId : +this.chatManagerId),
    );
    try {
      await this.apiClient.upload("chat-upload", form);
      this.chatFile = null;
      await this.loadChat();
    } catch (error: any) {
      alert(error.message);
    }
  }
  // בונה כתובת להורדת קובץ שצורף להודעת צ׳אט.
  chatFileUrl(message: ChatMessage, preview = false) {
    return this.apiClient.fileUrl("chat-file", { id: message.id, preview: preview ? 1 : 0 });
  }
  // מאמת את הטופס ושולח בקשת עובד חדשה למנהל.
  async createRequest() {
    if (!this.requestForm.managerId || !this.requestForm.reason.trim()) return;
    try {
      await this.apiClient.request("request-create", "POST", {
        manager_id: +this.requestForm.managerId,
        request_type: this.requestForm.type,
        task_id: +this.requestForm.taskId || null,
        swap_task_id: +this.requestForm.swapTaskId || null,
        start_date: this.requestForm.startDate || null,
        end_date: this.requestForm.endDate || null,
        requested_due_date: this.requestForm.requestedDueDate || null,
        reason: this.requestForm.reason,
      });
      this.requestForm = {
        managerId: this.requestManagers[0]?.id || 0,
        type: "vacation",
        taskId: 0,
        swapTaskId: 0,
        startDate: "",
        endDate: "",
        requestedDueDate: "",
        reason: "",
      };
      await this.loadRequests();
      alert("הבקשה נשלחה למנהל");
    } catch (error: any) {
      alert(error.message);
    }
  }
  // מאשר או דוחה בקשה ומעדכן את העובד בתוצאה.
  async answerRequest(request: EmployeeRequest, status: "approved" | "rejected") {
    try {
      await this.apiClient.request("request-answer", "POST", {
        id: request.id,
        status,
        manager_comment: this.requestComments[request.id] || "",
      });
      await Promise.all([this.loadRequests(), this.refreshData()]);
    } catch (error: any) {
      alert(error.message);
    }
  }
  // טוענת מהשרת את בקשות העובדים וממירה אותן למבנה הנתונים שמוצג בממשק.
  private async loadRequests() {
    const result = await this.apiClient.request("request-list");
    this.requests = result.items.map((request: any) => ({
      id: +request.id,
      employeeId: +request.employee_id,
      employeeName: request.employee_name,
      managerId: +request.manager_id,
      managerName: request.manager_name,
      type: request.request_type,
      taskId: request.task_id ? +request.task_id : undefined,
      taskTitle: request.task_title || undefined,
      swapTaskId: request.swap_task_id ? +request.swap_task_id : undefined,
      swapTaskTitle: request.swap_task_title || undefined,
      startDate: request.start_date || undefined,
      endDate: request.end_date || undefined,
      requestedDueDate: request.requested_due_date || undefined,
      reason: request.reason,
      status: request.status,
      managerComment: request.manager_comment || undefined,
      createdAt: request.created_at,
    }));
  }
  // מסמן תלוש יחיד ומדפיס רק אותו במקום את כל מסך השכר.
  printPayslip(id: number) {
    const slips = document.querySelectorAll<HTMLElement>(".payslip.official");
    slips.forEach((slip) =>
      slip.classList.toggle("print-target", slip.dataset["payslipId"] === String(id)),
    );
    window.addEventListener(
      "afterprint",
      () => slips.forEach((slip) => slip.classList.remove("print-target")),
      { once: true },
    );
    window.print();
  }
  // מבקש מהשרת קישור זמני לאיפוס הסיסמה
  async forgotPassword() {
    this.loginError = "";
    this.authMessage = "";
    this.resetLink = "";
    try {
      const r = await this.apiClient.request("forgot-password", "POST", {
        email: this.loginEmail,
      });
      this.authMessage = r.message;
      this.resetLink = r.reset_link || "";
    } catch (e: any) {
      this.loginError = e.message;
    }
  }
  // בודק את הסיסמאות ושולח לשרת את הסיסמה החדשה עם האסימון
  async resetPassword() {
    this.loginError = "";
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(this.newPassword)) {
      this.loginError = "הסיסמה חייבת להכיל לפחות 8 תווים, אות ומספר";
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.loginError = "הסיסמאות אינן זהות";
      return;
    }
    try {
      const r = await this.apiClient.request("reset-password", "POST", {
        token: this.resetToken,
        password: this.newPassword,
      });
      this.authMessage = r.message;
      history.replaceState({}, "", location.pathname);
      setTimeout(() => {
        this.authMode = "login";
        this.loginPassword = "";
        this.loginError = "";
      }, 1200);
    } catch (e: any) {
      this.loginError = e.message;
    }
  }
  // מחשב שעות עבודה, מפיק תלוש ושולח לעובד התראה
  async generatePayroll() {
    const employee = this.employees.find(
      (e) => e.id === +this.payrollEmployeeId,
    );
    if (!employee || employee.role !== "employee") {
      alert("יש לבחור עובד להפקת התלוש");
      return;
    }
    const hours = this.attendance
      .filter(
        (a) =>
          a.userId === employee.id &&
          a.clockOut &&
          a.clockIn.startsWith(this.payrollMonth),
      )
      .reduce((sum, a) => sum + this.attendanceHours(a), 0);
    const release = this.nextMonthNinth(this.payrollMonth);
    try {
      await this.apiClient.request("payroll-generate", "POST", {
        user_id: employee.id,
        pay_month: this.payrollMonth,
      });
    } catch (e: any) {
      alert(e.message);
      return;
    }
    const old = this.payslips.find(
      (p) => p.userId === employee.id && p.month === this.payrollMonth,
    );
    const item = {
      id: old?.id || Date.now(),
      userId: employee.id,
      month: this.payrollMonth,
      hours,
      rate: employee.rate,
      total: hours * employee.rate,
      availableFrom: release,
    };
    if (old) Object.assign(old, item);
    else this.payslips.push(item);
    this.notifications.push({
      id: Date.now() + 1,
      userId: employee.id,
      text: `תלוש ${this.payrollMonth} הופק ויהיה זמין בתאריך ${release}`,
      read: false,
      createdAt: new Date().toLocaleString("he-IL"),
    });
    this.persist();
    alert("התלוש הופק בהצלחה ונשלחה התראה לעובד");
  }
  // מחשב את התשעה בחודש הבא כתאריך זמינות התלוש.
  nextMonthNinth(month: string) {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m, 9);
    return d.toISOString().slice(0, 10);
  }
 // טוען את כל הנתונים האמיתיים מממשק השרת לאחר התחברות מוצלחת
  private async refreshData() {
    const [
      projectsResult,
      tasksResult,
      noticesResult,
      attendanceResult,
      payrollResult,
      weeklyTargetsResult,
    ] = await Promise.all([
      this.apiClient.request("projects"),
      this.apiClient.request("tasks"),
      this.apiClient.request("notifications"),
      this.apiClient.request("attendance-list"),
      this.apiClient.request("payroll-list"),
      this.apiClient.request("weekly-target-list"),
    ]);

    this.projects = projectsResult.items.map((p: any) => ({
      id: +p.id,
      name: p.name,
      description: p.description || "",
      due: p.due_date,
      createdAt: (p.created_at || p.start_date || "").slice(0, 10),
      managerId: +p.created_by,
      status: p.status,
      completedAt: p.completed_at || undefined,
      startDate: p.start_date || (p.created_at || "").slice(0, 10),
      budget: +p.budget || 0,
      plannedHours: +p.planned_hours || 0,
      priority: p.priority || "medium",
      tags: (p.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean),
      externalLink: p.external_link || undefined,
      archived: !!p.archived_at,
      updatedAt: p.updated_at || undefined,
    }));
    this.projectMilestones = (projectsResult.milestones || []).map((item: any) => ({
      id: +item.id,
      projectId: +item.project_id,
      title: item.title,
      dueDate: item.due_date,
      status: item.status,
    }));
    this.tasks = tasksResult.items.map((t: any) => ({
      id: +t.id,
      title: t.title,
      projectId: +t.project_id,
      workerId: +t.assignee_id,
      status: t.status,
      priority: t.priority,
      due: t.due_date,
      createdAt: (t.created_at || "").slice(0, 10),
      estimatedHours: +t.estimated_hours || 0,
      actualMinutes: +t.actual_minutes || 0,
      dependencyTaskId: t.dependency_task_id ? +t.dependency_task_id : undefined,
      labels: (t.labels || "").split(",").map((label: string) => label.trim()).filter(Boolean),
    }));
    this.notifications = noticesResult.items.map((n: any) => ({
      id: +n.id,
      userId: +n.user_id,
      text: n.message,
      read: +n.is_read === 1,
      createdAt: n.created_at,
    }));
    this.attendance = attendanceResult.items.map((a: any) => ({
      id: +a.id,
      userId: +a.user_id,
      clockIn: a.clock_in,
      clockOut: a.clock_out || undefined,
    }));
    this.payslips = payrollResult.items.map((p: any) => ({
      id: +p.id,
      userId: +p.user_id,
      month: p.pay_month,
      hours: +p.total_hours,
      rate: +p.hourly_rate,
      total: +p.total_salary,
      availableFrom: this.nextMonthNinth(p.pay_month),
    }));
    this.weeklyTargets = weeklyTargetsResult.items.map((target: any) => ({
      id: +target.id,
      userId: +target.user_id,
      weekStart: target.week_start,
      targetHours: +target.target_hours,
    }));

    const usersResult = await this.apiClient.request("users");
    this.employees = usersResult.items.map((e: any) => ({
      id: +e.id,
      name: e.full_name,
      email: e.email,
      role: e.role,
      status: e.status,
      active: +e.active_tasks,
      limit: +e.max_active_tasks,
      rate: +e.hourly_rate,
      createdAt: e.created_at,
      blockedAt: e.blocked_at || undefined,
      phone: e.phone || "",
      cv: e.cv_file || undefined,
    }));
    if (!this.requestForm.managerId || !this.requestManagers.some((manager) => manager.id === +this.requestForm.managerId)) {
      this.requestForm.managerId = this.requestManagers[0]?.id || 0;
    }
    await this.loadRequests();

    this.attendanceEmployeeId =
      this.role === "employee" ? this.currentUserId : 0;
    this.attendanceView = this.role === "employee" ? "details" : "summary";

    if (this.role === "admin") {
      const activityResult = await this.apiClient.request("activity-list");
      this.activities = activityResult.items.map((item: any) => ({
        id: +item.id,
        userId: +item.user_id,
        userName: item.full_name,
        action: item.action_name,
        details: item.details,
        createdAt: item.created_at,
      }));
    } else {
      this.activities = [];
    }
    this.recount();
  }

  // מאפשר למסכים עצמאיים לרענן נתוני פרויקטים ומשימות אחרי פעולה שמשפיעה עליהם
  async refreshWorkspace() {
    await this.refreshData();
  }

  // מאפשר לדשבורד לרענן נתונים אמיתיים בלי לבצע טעינה מחדש של כל הדפדפן
  async refreshDashboardData() {
    await this.refreshData();
  }
  // סופר מחדש כמה משימות פעילות יש לכל עובד
  private recount() {
    this.employees.forEach(
      (e) =>
        (e.active = this.tasks.filter(
          (t) => t.workerId === e.id && t.status !== "done",
        ).length),
    );
  }
  // שומר עותק מקומי כדי שהמסך לא יתרוקן ברענון הדפדפן
  private persist() {
    localStorage.setItem(
      "taskflow-data-v3",
      JSON.stringify({
        employees: this.employees,
        projects: this.projects,
        tasks: this.tasks,
        notifications: this.notifications,
        attendance: this.attendance,
        messages: this.messages,
        payslips: this.payslips,
      }),
    );
  }
  // טוען את העותק המקומי ובודק שכל הנתונים הם מערכים תקינים
  private load() {
    const raw = localStorage.getItem("taskflow-data-v3");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      const keys = [
        "employees",
        "projects",
        "tasks",
        "notifications",
        "attendance",
        "messages",
        "payslips",
      ];
      for (const key of keys) {
        if (Array.isArray(saved[key])) (this as any)[key] = saved[key];
      }
      this.projects.forEach((p) => {
        p.createdAt = p.createdAt || p.due;
        p.managerId = p.managerId || 1;
      });
      this.tasks.forEach((t) => (t.createdAt = t.createdAt || t.due));
      this.messages.forEach((m) => (m.managerId = m.managerId || 1));
    } catch {
      localStorage.removeItem("taskflow-data-v3");
    }
  }
}

