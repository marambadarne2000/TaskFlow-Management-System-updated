import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { exportCsvFile } from "../../core/utils/csv-export";

/** מרכז דוחות ניהולי שמחשב מדדים מהנתונים הקיימים במערכת */
@Component({
  selector: "app-reports",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reports.component.html",
  styleUrl: "./reports.component.scss",
})
export class ReportsComponent {
  year = "";
  month = "";
  constructor(public vm: TaskflowStoreService) {}

  get years() {
    return [...new Set(this.vm.tasks.map((task) => new Date(task.createdAt || task.due).getFullYear()))].sort((a, b) => b - a);
  }

  get tasks() {
    return this.vm.tasks.filter((task) => {
      const date = new Date(task.createdAt || task.due);
      return (!this.year || date.getFullYear() === +this.year) && (!this.month || date.getMonth() + 1 === +this.month);
    });
  }

  get completed() { return this.tasks.filter((task) => task.status === "done").length; }
  get overdue() { return this.tasks.filter((task) => task.status !== "done" && this.vm.daysUntil(task.due) < 0).length; }
  get completionRate() { return this.tasks.length ? Math.round(this.completed / this.tasks.length * 100) : 0; }
  get activeProjects() { return this.vm.projects.filter((project) => !project.archived && project.status !== "completed"); }
  get projectRows() { return [...this.vm.projects].filter((project) => !project.archived).sort((a, b) => this.vm.projectRiskScore(b) - this.vm.projectRiskScore(a)); }
  get employeeRows() { return this.vm.employees.filter((employee) => employee.role === "employee" && employee.status === "active").sort((a, b) => b.active - a.active); }

  exportCsv() {
    const rows = [["Project", "Manager", "Progress", "Risk", "Due"], ...this.projectRows.map((project) => [project.name, this.vm.name(project.managerId), `${this.vm.progress(project)}%`, this.vm.projectRiskScore(project), project.due])];
    exportCsvFile(`taskflow-management-report-${new Date().toISOString().slice(0,10)}.csv`,rows);
  }
}
