// קובץ זה אחראי על מעטפת המערכת ותפריט הניווט.
import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Page } from "../../core/models/taskflow.models";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { DashboardComponent } from "../../pages/dashboard/dashboard.component";
import { ProjectsComponent } from "../../pages/projects/projects.component";
import { TasksComponent } from "../../pages/tasks/tasks.component";
import { EmployeesComponent } from "../../pages/employees/employees.component";
import { NotificationsComponent } from "../../pages/notifications/notifications.component";
import { AttendanceComponent } from "../../pages/attendance/attendance.component";
import { PayrollComponent } from "../../pages/payroll/payroll.component";
import { ChatComponent } from "../../pages/chat/chat.component";
import { RequestsComponent } from "../../pages/requests/requests.component";
import { InsightsComponent } from "../../pages/insights/insights.component";
import { ReportsComponent } from "../../pages/reports/reports.component";
import { AutomationsComponent } from "../../pages/automations/automations.component";
import { PlannerComponent } from "../../pages/planner/planner.component";
import { CalendarComponent } from "../../pages/calendar/calendar.component";
import { RisksComponent } from "../../pages/risks/risks.component";
import { QualityComponent } from "../../pages/quality/quality.component";
import { ActionCenterComponent } from "../../pages/action-center/action-center.component";

/** מעטפת המערכת: מציגה תפריט ניווט, כותרת, משתמש מחובר ופעמון התראות */
@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DashboardComponent,
    ProjectsComponent,
    TasksComponent,
    EmployeesComponent,
    NotificationsComponent,
    AttendanceComponent,
    PayrollComponent,
    ChatComponent,
    RequestsComponent,
    InsightsComponent,
    ReportsComponent,
    AutomationsComponent,
    PlannerComponent,
    CalendarComponent,
    RisksComponent,
    QualityComponent,
    ActionCenterComponent,
  ],
  templateUrl: "./shell.component.html",
  styleUrl: "./shell.component.scss",
})
export class ShellComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
  commandOpen = false;
  commandQuery = "";

  // קיצור Ctrl+K פותח חיפוש גלובלי מכל מקום במערכת
  @HostListener("document:keydown", ["$event"])
  handleShortcut(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      this.commandOpen = !this.commandOpen;
      if (!this.commandOpen) this.commandQuery = "";
    }
    if (event.key === "Escape") this.closeCommand();
  }

  // מאחד תוצאות מפרויקטים, משימות ועובדים לרשימת חיפוש אחת
  get commandResults() {
    const query = this.commandQuery.trim().toLowerCase();
    if (!query) return [];
    const projects = this.vm.visibleProjects.map((item) => ({ type: "פרויקט", icon: "view_kanban", title: item.name, subtitle: `${this.vm.progress(item)}% התקדמות`, page: "projects" as Page }));
    const tasks = this.vm.visibleTasks.map((item) => ({ type: "משימה", icon: "task_alt", title: item.title, subtitle: this.vm.projectName(item.projectId), page: "tasks" as Page }));
    const employees = (this.vm.role === "admin" ? this.vm.employees : []).map((item) => ({ type: "עובד", icon: "person", title: item.name, subtitle: item.email, page: "employees" as Page }));
    return [...projects, ...tasks, ...employees].filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query)).slice(0, 10);
  }

  openCommand() { this.commandOpen = true; setTimeout(() => document.querySelector<HTMLInputElement>(".command-input")?.focus()); }
  closeCommand() { this.commandOpen = false; this.commandQuery = ""; }
  chooseResult(page: Page) { this.vm.page = page; this.closeCommand(); }
}
