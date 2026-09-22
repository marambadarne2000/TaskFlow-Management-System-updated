// קובץ זה אחראי על ניהול נוכחות ושעות עבודה.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

/** מסך נוכחות: שומר שעת כניסה, שעת יציאה ומחשב שעות עבודה */
@Component({
  selector: "app-attendance",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./attendance.component.html",
  styleUrl: "./attendance.component.scss",
})
export class AttendanceComponent {
  // הטקסט שהמנהל מקליד כדי לאתר עובד ברשימת הנוכחות.
  employeeSearch = "";

  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}

  // מחזיר רק עובדים ומתאים את הרשימה לחיפוש לפי שם, דואר, טלפון או מספר מזהה.
  get displayedEmployees() {
    const search = this.employeeSearch.trim().toLocaleLowerCase("he");

    return this.vm.employees.filter((employee) => {
      if (employee.role !== "employee") return false;
      if (!search) return true;

      return [employee.name, employee.email, employee.phone, employee.id]
        .filter((value) => value !== undefined && value !== null)
        .some((value) => String(value).toLocaleLowerCase("he").includes(search));
    });
  }
}
