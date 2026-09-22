import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Employee, Project, Task } from "../../core/models/taskflow.models";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { ApiClientService } from "../../core/services/api-client.service";

type RiskType = "project" | "task" | "employee";
type RiskLevel = "critical" | "high" | "medium" | "low";

interface RiskItem {
  id: string;
  entityId: number;
  type: RiskType;
  title: string;
  subtitle: string;
  score: number;
  level: RiskLevel;
  reasons: string[];
  recommendation: string;
}

/** מרכז סיכונים שמחשב חריגות מתוך נתוני העבודה הקיימים ומסביר כל ציון */
@Component({
  selector: "app-risks",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./risks.component.html",
  styleUrl: "./risks.component.scss",
})
export class RisksComponent implements OnInit {
  typeFilter: "" | RiskType = "";
  levelFilter: "" | RiskLevel = "";
  searchText = "";
  acknowledged = new Set<string>();

  treatments=new Map<string,any>();
  constructor(public vm: TaskflowStoreService,private api:ApiClientService) {}
  async ngOnInit(){const result=await this.api.request<{items:any[]}>("risk-treatment-list");this.treatments=new Map(result.items.map(item=>[item.risk_key,item]));this.acknowledged=new Set(this.treatments.keys())}

  get risks() {
    return [
      ...this.vm.projects.filter((project) => !project.archived).map((project) => this.projectRisk(project)),
      ...this.vm.tasks.filter((task) => task.status !== "done").map((task) => this.taskRisk(task)),
      ...this.vm.employees.filter((employee) => employee.role === "employee").map((employee) => this.employeeRisk(employee)),
    ].filter((risk) => risk.score > 0).sort((a, b) => b.score - a.score);
  }

  get filteredRisks() {
    const query = this.searchText.trim().toLowerCase();
    return this.risks.filter((risk) =>
      (!this.typeFilter || risk.type === this.typeFilter) &&
      (!this.levelFilter || risk.level === this.levelFilter) &&
      (!query || `${risk.title} ${risk.subtitle} ${risk.reasons.join(" ")}`.toLowerCase().includes(query)),
    );
  }

  get criticalCount() { return this.risks.filter((risk) => risk.level === "critical").length; }
  get highCount() { return this.risks.filter((risk) => risk.level === "high").length; }
  get averageScore() { return this.risks.length ? Math.round(this.risks.reduce((sum, risk) => sum + risk.score, 0) / this.risks.length) : 0; }
  get openCount() { return this.risks.filter((risk) => !this.acknowledged.has(risk.id)).length; }
  get topRisks() { return this.risks.slice(0, 3); }

  private projectRisk(project: Project): RiskItem {
    const score = this.vm.projectRiskScore(project);
    const overdueTasks = this.vm.projectTasks(project.id).filter((task) => this.vm.deadlineState(task) === "overdue").length;
    const reasons: string[] = [];
    if (this.vm.daysUntil(project.due) < 0 && project.status !== "completed") reasons.push(`הפרויקט באיחור של ${Math.abs(this.vm.daysUntil(project.due))} ימים`);
    if (overdueTasks) reasons.push(`${overdueTasks} משימות באיחור`);
    if (this.vm.progress(project) < 50 && this.vm.daysUntil(project.due) <= 14) reasons.push("התקדמות נמוכה ביחס למועד המסירה");
    if (!this.vm.team(project).length) reasons.push("לא הוגדר צוות פעיל לפרויקט");
    return this.createRisk(`project-${project.id}`, project.id, "project", project.name, `${this.vm.progress(project)}% התקדמות · יעד ${project.due}`, Math.max(score, reasons.length ? 20 : 0), reasons, "בדיקת תוכנית העבודה, המועדים והקצאת הצוות");
  }

  private taskRisk(task: Task): RiskItem {
    let score = 100 - this.vm.taskHealth(task);
    const reasons: string[] = [];
    const days = this.vm.daysUntil(task.due);
    if (days < 0) reasons.push(`המשימה באיחור של ${Math.abs(days)} ימים`);
    else if (days <= 3) reasons.push(`נותרו ${Math.max(0, days)} ימים לסיום`);
    if (this.vm.taskBlocked(task)) reasons.push(`חסומה על ידי ${this.vm.dependencyName(task)}`);
    if (!task.workerId) { reasons.push("המשימה טרם הוקצתה לעובד"); score += 20; }
    if ((task.actualMinutes || 0) > (task.estimatedHours || 0) * 60 && (task.estimatedHours || 0) > 0) reasons.push("חריגה מהערכת הזמן");
    return this.createRisk(`task-${task.id}`, task.id, "task", task.title, `${this.vm.projectName(task.projectId)} · ${this.vm.name(task.workerId)}`, Math.min(100, score), reasons, this.vm.taskBlocked(task) ? "השלמת המשימה התלויה לפני המשך העבודה" : "בדיקת מועד, אחראי והערכת זמן");
  }

  private employeeRisk(employee: Employee): RiskItem {
    const activeTasks = this.vm.tasks.filter((task) => task.workerId === employee.id && task.status !== "done");
    const overdue = activeTasks.filter((task) => this.vm.deadlineState(task) === "overdue").length;
    const loadPercent = employee.limit ? Math.round((activeTasks.length / employee.limit) * 100) : 100;
    let score = Math.min(60, Math.max(0, loadPercent - 60));
    const reasons: string[] = [];
    if (employee.status === "blocked") { score += 60; reasons.push("חשבון העובד חסום"); }
    if (activeTasks.length >= employee.limit) { score += 30; reasons.push(`הגיע למגבלת ${employee.limit} משימות פעילות`); }
    if (overdue) { score += Math.min(40, overdue * 20); reasons.push(`${overdue} משימות פעילות באיחור`); }
    return this.createRisk(`employee-${employee.id}`, employee.id, "employee", employee.name, `${activeTasks.length}/${employee.limit} משימות · עומס ${loadPercent}%`, Math.min(100, score), reasons, "איזון עומס, שינוי הקצאה או עדכון מגבלת המשימות");
  }

  private createRisk(id: string, entityId: number, type: RiskType, title: string, subtitle: string, score: number, reasons: string[], recommendation: string): RiskItem {
    const normalizedScore = Math.max(0, Math.round(score));
    return { id, entityId, type, title, subtitle, score: normalizedScore, level: this.level(normalizedScore), reasons: reasons.length ? reasons : ["נדרש מעקב שוטף"], recommendation };
  }

  private level(score: number): RiskLevel {
    if (score >= 75) return "critical";
    if (score >= 55) return "high";
    if (score >= 30) return "medium";
    return "low";
  }

  levelName(level: RiskLevel) { return { critical: "קריטי", high: "גבוה", medium: "בינוני", low: "נמוך" }[level]; }
  typeName(type: RiskType) { return { project: "פרויקט", task: "משימה", employee: "עובד" }[type]; }
  typeIcon(type: RiskType) { return { project: "view_kanban", task: "task_alt", employee: "person" }[type]; }

  async toggleAcknowledged(risk: RiskItem) {
    const active=!this.acknowledged.has(risk.id);
    const note=active?(prompt("הערת טיפול קצרה",risk.recommendation)||risk.recommendation):"";
    await this.api.request("risk-treatment-save","POST",{risk_key:risk.id,active,status:"acknowledged",note});
    active?this.acknowledged.add(risk.id):this.acknowledged.delete(risk.id);
  }

  openRisk(risk: RiskItem) {
    if (risk.type === "project") { this.vm.projectStateFilter = "attention"; this.vm.page = "projects"; }
    if (risk.type === "task") { this.vm.taskFocusOnly = true; this.vm.page = "tasks"; }
    if (risk.type === "employee") this.vm.page = "employees";
  }
}
