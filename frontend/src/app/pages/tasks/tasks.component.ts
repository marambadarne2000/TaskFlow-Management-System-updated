// קובץ זה אחראי על ניהול והקצאת משימות.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { Task } from "../../core/models/taskflow.models";

/** מסך משימות: מציג משימות, סטטוס, עובד אחראי, מועדים וסימון איחורים */
@Component({
  selector: "app-tasks",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./tasks.component.html",
  styleUrl: "./tasks.component.scss",
})
export class TasksComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
  columns: { id: Task["status"]; label: string; hint: string }[] = [
    { id: "todo", label: "לביצוע", hint: "משימות שממתינות להתחלה" },
    { id: "in_progress", label: "בתהליך", hint: "העבודה הפעילה של הצוות" },
    { id: "done", label: "הושלמו", hint: "משימות שנמסרו בהצלחה" },
  ];
  searchText = "";
  draggedTask?: Task;
  dropTarget?: Task["status"];
  movingTaskId?: number;

  get riskTasks() { return this.vm.smartDisplayedTasks.filter((task) => this.vm.taskHealth(task) < 60).length; }
  get blockedTasks() { return this.vm.smartDisplayedTasks.filter((task) => this.vm.taskBlocked(task)).length; }
  get trackedHours() { return this.vm.smartDisplayedTasks.reduce((sum, task) => sum + (task.actualMinutes || 0), 0) / 60; }

  // מסלול הביצוע מפריד בין משימות שמוכנות עכשיו לבין משימות שממתינות לתלות
  get readyTasks() {
    return this.vm.smartDisplayedTasks.filter((task) => task.status !== "done" && !this.vm.taskBlocked(task));
  }

  get nextBestTask() {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    return [...this.readyTasks].sort((a, b) =>
      priorityScore[b.priority] - priorityScore[a.priority] ||
      this.vm.daysUntil(a.due) - this.vm.daysUntil(b.due),
    )[0];
  }

  get flowMessage() {
    if (!this.vm.smartDisplayedTasks.length) return "אין כרגע משימות במסלול";
    if (!this.nextBestTask && this.blockedTasks) return "כל המשימות הפתוחות ממתינות להשלמת שלב קודם";
    if (!this.nextBestTask) return "כל המשימות הושלמו";
    return `הצעד המומלץ עכשיו: ${this.nextBestTask.title}`;
  }

  // מגבלת העבודה בתהליך מונעת מהצוות לפתוח יותר מדי משימות במקביל
  get workInProgressLimit() {
    const activeEmployees = this.vm.employees.filter((employee) => employee.role === "employee" && employee.status === "active").length;
    return Math.max(3, activeEmployees * 2);
  }

  get workInProgressCount() {
    return this.tasksForColumn("in_progress").length;
  }

  get workInProgressPercent() {
    return Math.min(100, Math.round((this.workInProgressCount / this.workInProgressLimit) * 100));
  }

  // מסנן בכל עמודה לפי שם משימה, פרויקט או עובד
  tasksForColumn(status: Task["status"]) {
    const query = this.searchText.trim().toLowerCase();
    return this.vm.tasksByStatus(status).filter((task) => {
      if (!query) return true;
      const searchableText = `${task.title} ${this.vm.projectName(task.projectId)} ${this.vm.name(task.workerId)}`.toLowerCase();
      return searchableText.includes(query);
    });
  }

  startDrag(task: Task) {
    this.draggedTask = task;
  }

  allowDrop(event: DragEvent, status: Task["status"]) {
    event.preventDefault();
    this.dropTarget = status;
  }

  leaveColumn(status: Task["status"]) {
    if (this.dropTarget === status) this.dropTarget = undefined;
  }

  // מעביר משימה לעמודה החדשה דרך השרת כדי לעדכן גם את הפרויקט והדשבורד
  async dropTask(event: DragEvent, status: Task["status"]) {
    event.preventDefault();
    const task = this.draggedTask;
    this.dropTarget = undefined;
    this.draggedTask = undefined;
    if (!task || task.status === status || this.movingTaskId) return;
    if (status === "in_progress" && this.workInProgressCount >= this.workInProgressLimit) {
      alert("מגבלת העבודה בתהליך מלאה. יש להשלים משימה לפני פתיחת משימה נוספת");
      return;
    }
    this.movingTaskId = task.id;
    await this.vm.changeTask(task, status);
    this.movingTaskId = undefined;
  }

  cancelDrag() {
    this.draggedTask = undefined;
    this.dropTarget = undefined;
  }
}
