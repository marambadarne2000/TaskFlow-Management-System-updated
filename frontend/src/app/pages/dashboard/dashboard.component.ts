import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
);

type DashboardPanel =
  | "projects"
  | "status"
  | "workload"
  | "progress"
  | "trend"
  | "alerts"
  | "activity";

interface DashboardPreferences {
  projects: boolean;
  status: boolean;
  workload: boolean;
  progress: boolean;
  trend: boolean;
  alerts: boolean;
  activity: boolean;
}

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild("statusCanvas") statusCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild("workloadCanvas") workloadCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild("progressCanvas") progressCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild("trendCanvas") trendCanvas?: ElementRef<HTMLCanvasElement>;

  dateFrom = "";
  dateTo = "";
  loading = false;
  preferencesOpen = false;
  lastUpdated = new Date();
  preferences: DashboardPreferences = {
    projects: true,
    status: true,
    workload: true,
    progress: true,
    trend: true,
    alerts: true,
    activity: true,
  };

  readonly panelLabels: Array<{ key: DashboardPanel; label: string }> = [
    { key: "projects", label: "רשימת פרויקטים" },
    { key: "status", label: "מצב משימות" },
    { key: "workload", label: "עומס עובדים" },
    { key: "progress", label: "התקדמות פרויקטים" },
    { key: "trend", label: "מגמה חודשית" },
    { key: "alerts", label: "התראות חכמות" },
    { key: "activity", label: "היסטוריית פעילות" },
  ];

  private charts: Chart[] = [];
  private refreshTimer?: ReturnType<typeof setInterval>;

  constructor(public vm: TaskflowStoreService) {
    this.loadPreferences();
  }

  ngAfterViewInit() {
    setTimeout(() => this.renderCharts());
    this.refreshTimer = setInterval(() => this.refresh(false), 30000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.destroyCharts();
  }

  get filteredTasks() {
    return this.vm.dashboardTasks.filter((task) =>
      this.inRange(task.createdAt || task.due),
    );
  }

  get filteredProjects() {
    return this.vm.dashboardProjects.filter((project) =>
      this.inRange(project.createdAt || project.due),
    );
  }

  get completedProjects() {
    return this.filteredProjects.filter((project) => project.status === "completed").length;
  }

  get activeProjects() {
    return this.filteredProjects.filter((project) => project.status === "in_progress").length;
  }

  get overdueCount() {
    return this.filteredTasks.filter((task) => this.vm.deadlineState(task) === "overdue").length;
  }

  get dueSoonCount() {
    return this.filteredTasks.filter((task) => this.vm.deadlineState(task) === "soon").length;
  }

  taskCount(status: "todo" | "in_progress" | "done") {
    return this.filteredTasks.filter((task) => task.status === status).length;
  }

  taskPercent(status: "todo" | "in_progress" | "done") {
    return this.filteredTasks.length
      ? Math.round((this.taskCount(status) / this.filteredTasks.length) * 100)
      : 0;
  }

  applyDateFilter() {
    if (this.dateFrom && this.dateTo && this.dateFrom > this.dateTo) {
      [this.dateFrom, this.dateTo] = [this.dateTo, this.dateFrom];
    }
    this.renderCharts();
  }

  clearDateFilter() {
    this.dateFrom = "";
    this.dateTo = "";
    this.renderCharts();
  }

  async refresh(showLoading = true) {
    if (this.loading || !this.vm.loggedIn || this.vm.page !== "dashboard") return;
    if (showLoading) this.loading = true;

    try {
      await this.vm.refreshDashboardData();
      this.lastUpdated = new Date();
      this.renderCharts();
    } finally {
      this.loading = false;
    }
  }

  togglePanel(key: DashboardPanel) {
    this.preferences[key] = !this.preferences[key];
    localStorage.setItem(this.preferenceKey, JSON.stringify(this.preferences));
    setTimeout(() => this.renderCharts());
  }

  isVisible(key: DashboardPanel) {
    return this.preferences[key];
  }

  openTaskStatus(status: "todo" | "in_progress" | "done") {
    this.vm.taskStateFilter = status;
    this.vm.page = "tasks";
  }

  openEmployee(employeeId: number) {
    const employee = this.vm.employee(employeeId);
    this.vm.employeeSearch = employee?.name || "";
    this.vm.page = "employees";
  }

  private get preferenceKey() {
    return `taskflow-dashboard-${this.vm.currentUserId}`;
  }

  private loadPreferences() {
    const saved = localStorage.getItem(this.preferenceKey);
    if (!saved) return;
    try {
      this.preferences = { ...this.preferences, ...JSON.parse(saved) };
    } catch {
      localStorage.removeItem(this.preferenceKey);
    }
  }

  private inRange(value: string) {
    const date = (value || "").slice(0, 10);
    return (!this.dateFrom || date >= this.dateFrom) && (!this.dateTo || date <= this.dateTo);
  }

  private renderCharts() {
    this.destroyCharts();
    this.renderStatusChart();
    this.renderWorkloadChart();
    this.renderProgressChart();
    this.renderTrendChart();
  }

  private renderStatusChart() {
    if (!this.statusCanvas || !this.isVisible("status")) return;
    const statuses = ["todo", "in_progress", "done"] as const;
    this.charts.push(
      new Chart(this.statusCanvas.nativeElement, {
        type: "doughnut",
        data: {
          labels: ["לביצוע", "בתהליך", "הושלמו"],
          datasets: [{
            data: statuses.map((status) => this.taskCount(status)),
            backgroundColor: ["#35c8e6", "#7357e8", "#35d39a"],
            borderWidth: 0,
            hoverOffset: 8,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          plugins: { legend: { display: false } },
          onClick: (_, elements) => {
            if (elements[0]) this.openTaskStatus(statuses[elements[0].index]);
          },
        },
      }),
    );
  }

  private renderWorkloadChart() {
    if (!this.workloadCanvas || !this.isVisible("workload") || this.vm.role !== "admin") return;
    const employees = this.vm.employees
      .filter((employee) => employee.role === "employee" && employee.status === "active")
      .sort((a, b) => b.active - a.active)
      .slice(0, 8);

    this.charts.push(
      new Chart(this.workloadCanvas.nativeElement, {
        type: "bar",
        data: {
          labels: employees.map((employee) => employee.name),
          datasets: [
            {
              label: "משימות פעילות",
              data: employees.map((employee) => employee.active),
              backgroundColor: employees.map((employee) =>
                employee.active >= employee.limit ? "#ef5c72" : "#7357e8",
              ),
              borderRadius: 9,
            },
            {
              label: "מגבלה אישית",
              data: employees.map((employee) => employee.limit),
              backgroundColor: "#dfe4f4",
              borderRadius: 9,
            },
          ],
        },
        options: {
          ...this.cartesianOptions(),
          onClick: (_, elements) => {
            if (elements[0]) this.openEmployee(employees[elements[0].index].id);
          },
        },
      }),
    );
  }

  private renderProgressChart() {
    if (!this.progressCanvas || !this.isVisible("progress")) return;
    const projects = [...this.filteredProjects]
      .sort((a, b) => this.vm.progress(b) - this.vm.progress(a))
      .slice(0, 8);

    this.charts.push(
      new Chart(this.progressCanvas.nativeElement, {
        type: "bar",
        data: {
          labels: projects.map((project) => project.name),
          datasets: [{
            label: "אחוז התקדמות",
            data: projects.map((project) => this.vm.progress(project)),
            backgroundColor: "#25c8c7",
            borderRadius: 9,
          }],
        },
        options: {
          ...this.cartesianOptions(),
          indexAxis: "y",
          scales: {
            x: { beginAtZero: true, max: 100, grid: { color: "#edf0f7" } },
            y: { grid: { display: false } },
          },
          onClick: () => (this.vm.page = "projects"),
        },
      }),
    );
  }

  private renderTrendChart() {
    if (!this.trendCanvas || !this.isVisible("trend")) return;
    const months = this.lastSixMonths();
    const due = months.map((month) =>
      this.vm.dashboardTasks.filter((task) => task.due.startsWith(month.key)).length,
    );
    const overdue = months.map((month) =>
      this.vm.dashboardTasks.filter(
        (task) => task.due.startsWith(month.key) && this.vm.deadlineState(task) === "overdue",
      ).length,
    );

    this.charts.push(
      new Chart(this.trendCanvas.nativeElement, {
        type: "line",
        data: {
          labels: months.map((month) => month.label),
          datasets: [
            {
              label: "משימות למועד",
              data: due,
              borderColor: "#7357e8",
              backgroundColor: "rgba(115,87,232,.12)",
              fill: true,
              tension: 0.35,
            },
            {
              label: "באיחור",
              data: overdue,
              borderColor: "#ef5c72",
              backgroundColor: "rgba(239,92,114,.08)",
              tension: 0.35,
            },
          ],
        },
        options: this.cartesianOptions(),
      }),
    );
  }

  private cartesianOptions(): ChartConfiguration["options"] {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#edf0f7" } },
      },
    };
  }

  private lastSixMonths() {
    const formatter = new Intl.DateTimeFormat("he-IL", { month: "short" });
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: formatter.format(date),
      };
    });
  }

  private destroyCharts() {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }
}
