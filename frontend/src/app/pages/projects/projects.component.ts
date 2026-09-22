// קובץ זה אחראי על ניהול פרויקטים.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { Project } from "../../core/models/taskflow.models";

/** מסך פרויקטים: מציג פרויקטים, מנהל, צוות, התקדמות וסינון לפי תאריך */
@Component({
  selector: "app-projects",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./projects.component.html",
  styleUrl: "./projects.component.scss",
})
export class ProjectsComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
  archiveOpen = false;
  views: { id: "list" | "kanban" | "calendar" | "gantt"; label: string; icon: string }[] = [
    { id: "list", label: "כרטיסים", icon: "grid_view" }, { id: "kanban", label: "Kanban", icon: "view_kanban" },
    { id: "calendar", label: "לוח שנה", icon: "calendar_month" }, { id: "gantt", label: "Gantt", icon: "waterfall_chart" },
  ];
  kanbanColumns: { id: Project["status"]; label: string }[] = [{ id: "planned", label: "בתכנון" }, { id: "in_progress", label: "בתהליך" }, { id: "completed", label: "הושלמו" }];
  get highRiskCount() { return this.vm.displayedProjects.filter((p) => this.vm.projectRiskScore(p) >= 70).length; }
  get averageProgress() { return this.vm.displayedProjects.length ? Math.round(this.vm.displayedProjects.reduce((sum, p) => sum + this.vm.progress(p), 0) / this.vm.displayedProjects.length) : 0; }
  get totalBudget() { return this.vm.displayedProjects.reduce((sum, p) => sum + (p.budget || 0), 0); }
  get projectsByDueDate() { return [...this.vm.displayedProjects].sort((a, b) => a.due.localeCompare(b.due)); }
  get archivedProjects() { return this.vm.visibleProjects.filter((project) => project.archived); }
  projectsByStatus(status: Project["status"]) { return this.vm.displayedProjects.filter((p) => p.status === status); }
  priorityText(priority: Project["priority"]) { return ({ low: "נמוכה", medium: "בינונית", high: "גבוהה", critical: "קריטית" } as const)[priority || "medium"]; }
}
