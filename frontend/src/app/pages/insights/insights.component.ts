import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { exportCsvFile } from "../../core/utils/csv-export";

/** מרכז תובנות שמחשב תחזיות והמלצות מהנתונים שכבר קיימים במערכת */
@Component({
  selector: "app-insights",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./insights.component.html",
  styleUrl: "./insights.component.scss",
})
export class InsightsComponent {
  horizon = 30;
  extraHours = 0;
  constructor(public vm: TaskflowStoreService) {}

  get activeProjects() { return this.vm.projects.filter((project) => !project.archived && project.status !== "completed"); }
  get activeTasks() { return this.vm.tasks.filter((task) => task.status !== "done"); }
  get completionRate() { return this.vm.tasks.length ? Math.round(this.vm.tasks.filter((task) => task.status === "done").length / this.vm.tasks.length * 100) : 0; }
  get onTimeRate() { const done = this.vm.tasks.filter((task) => task.status === "done"); return done.length ? Math.round(done.filter((task) => this.vm.daysUntil(task.due) >= 0).length / done.length * 100) : 100; }
  get capacityRate() { const employees = this.vm.employees.filter((employee) => employee.role === "employee" && employee.status === "active"); const limit = employees.reduce((sum, employee) => sum + employee.limit, 0); const active = employees.reduce((sum, employee) => sum + employee.active, 0); return limit ? Math.max(0, Math.round((limit - active) / limit * 100)) : 0; }
  get forecastHealth() { const risk = this.activeProjects.reduce((sum, project) => sum + this.vm.projectRiskScore(project), 0); return this.activeProjects.length ? Math.max(0, Math.round(100 - risk / this.activeProjects.length + this.extraHours * .35)) : 100; }
  get dueInHorizon() { return this.activeTasks.filter((task) => { const days = this.vm.daysUntil(task.due); return days >= 0 && days <= this.horizon; }); }
  get riskProjects() { return [...this.activeProjects].sort((a, b) => this.vm.projectRiskScore(b) - this.vm.projectRiskScore(a)).slice(0, 5); }
  get teamCapacity() { return this.vm.employees.filter((employee) => employee.role === "employee" && employee.status === "active").map((employee) => ({ ...employee, percent: employee.limit ? Math.min(100, Math.round(employee.active / employee.limit * 100)) : 0 })).sort((a, b) => b.percent - a.percent); }
  get recommendations() {
    const items: { icon: string; title: string; text: string; action: string }[] = [];
    const overloaded = this.teamCapacity.filter((employee) => employee.percent >= 80);
    if (overloaded.length) items.push({ icon: "balance", title: "איזון עומסים", text: `${overloaded.length} עובדים נמצאים מעל 80% קיבולת`, action: "בדיקת הקצאות" });
    const risky = this.riskProjects.filter((project) => this.vm.projectRiskScore(project) >= 60);
    if (risky.length) items.push({ icon: "crisis_alert", title: "טיפול בסיכון", text: `${risky.length} פרויקטים דורשים החלטה ניהולית`, action: "פתיחת פרויקטים" });
    if (this.dueInHorizon.length) items.push({ icon: "event_upcoming", title: "חלון מסירה", text: `${this.dueInHorizon.length} משימות מסתיימות ב־${this.horizon} הימים הקרובים`, action: "בדיקת מועדים" });
    if (!items.length) items.push({ icon: "verified", title: "הפעילות מאוזנת", text: "לא זוהו כרגע חריגות שמצריכות טיפול", action: "המשך מעקב" });
    return items;
  }
  projectForecast(project: any) { return Math.max(0, 100 - this.vm.projectRiskScore(project) + Math.round(this.extraHours * .25)); }
  openRecommendation(action: string) { this.vm.page = action.includes("פרויקט") ? "projects" : action.includes("הקצא") ? "tasks" : "dashboard"; }
  exportReport() {
    const rows = [["Project", "Progress", "Risk", "Due date"], ...this.vm.projects.map((project) => [project.name, `${this.vm.progress(project)}%`, `${this.vm.projectRiskScore(project)}`, project.due])];
    exportCsvFile(`taskflow-insights-${new Date().toISOString().slice(0,10)}.csv`,rows);
  }
}
