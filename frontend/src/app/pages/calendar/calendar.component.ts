import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

type CalendarEventType = "task" | "project" | "vacation";

interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  date: string;
  title: string;
  subtitle: string;
  endDate?: string;
}

interface CalendarDay {
  date: Date;
  key: string;
  dayNumber: number;
  currentMonth: boolean;
  today: boolean;
  events: CalendarEvent[];
}

/** יומן ארגוני שמאחד מועדי משימות, פרויקטים וחופשות מאושרות */
@Component({
  selector: "app-calendar",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./calendar.component.html",
  styleUrl: "./calendar.component.scss",
})
export class CalendarComponent {
  viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  selectedDate = this.dateKey(new Date());
  showTasks = true;
  showProjects = true;
  showVacations = true;
  weekDays = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

  constructor(public vm: TaskflowStoreService) {}

  get monthTitle() {
    return new Intl.DateTimeFormat("he-IL", { month: "long", year: "numeric" }).format(this.viewDate);
  }

  get allEvents(): CalendarEvent[] {
    const tasks: CalendarEvent[] = this.vm.visibleTasks.map((task) => ({
      id: `task-${task.id}`,
      type: "task",
      date: task.due,
      title: task.title,
      subtitle: `${this.vm.projectName(task.projectId)} · ${this.vm.statusText(task.status)}`,
    }));
    const projects: CalendarEvent[] = this.vm.visibleProjects.map((project) => ({
      id: `project-${project.id}`,
      type: "project",
      date: project.due,
      title: project.name,
      subtitle: `מועד מסירת פרויקט · ${this.vm.statusText(project.status)}`,
    }));
    const vacations: CalendarEvent[] = this.vm.requests
      .filter((request) => request.type === "vacation" && request.status === "approved")
      .filter((request) => this.vm.role === "admin" || request.employeeId === this.vm.currentUserId)
      .map((request) => ({
        id: `vacation-${request.id}`,
        type: "vacation",
        date: request.startDate || "",
        endDate: request.endDate || request.startDate,
        title: `חופשה · ${request.employeeName}`,
        subtitle: request.reason,
      }));
    return [...tasks, ...projects, ...vacations].filter((event) => event.date);
  }

  get filteredEvents() {
    return this.allEvents.filter((event) =>
      (event.type === "task" && this.showTasks) ||
      (event.type === "project" && this.showProjects) ||
      (event.type === "vacation" && this.showVacations),
    );
  }

  get days(): CalendarDay[] {
    const firstDay = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const key = this.dateKey(date);
      return {
        date,
        key,
        dayNumber: date.getDate(),
        currentMonth: date.getMonth() === this.viewDate.getMonth(),
        today: key === this.dateKey(new Date()),
        events: this.eventsForDate(key),
      };
    });
  }

  get selectedEvents() {
    return this.eventsForDate(this.selectedDate);
  }

  get monthEvents() {
    const prefix = `${this.viewDate.getFullYear()}-${String(this.viewDate.getMonth() + 1).padStart(2, "0")}`;
    return this.filteredEvents.filter((event) => event.date.startsWith(prefix) || (event.endDate || "").startsWith(prefix));
  }

  get busyDays() {
    return this.days.filter((day) => day.currentMonth && day.events.length >= 3).length;
  }

  countMonthEvents(type: CalendarEventType) {
    return this.monthEvents.filter((event) => event.type === type).length;
  }

  eventsForDate(date: string) {
    return this.filteredEvents.filter((event) => date >= event.date && date <= (event.endDate || event.date));
  }

  previousMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
  }

  nextMonth() {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
  }

  goToday() {
    const today = new Date();
    this.viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDate = this.dateKey(today);
  }

  selectDay(day: CalendarDay) {
    this.selectedDate = day.key;
    if (!day.currentMonth) this.viewDate = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
  }

  eventName(type: CalendarEventType) {
    return { task: "משימה", project: "פרויקט", vacation: "חופשה" }[type];
  }

  trackDay(_: number, day: CalendarDay) {
    return day.key;
  }

  private dateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
