// קובץ זה אחראי על ניהול עובדים.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

/** ניהול עובדים: מציג עובדים ומאפשר חיפוש, הוספה, חסימה ושינוי תפקיד */
@Component({
  selector: "app-employees",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./employees.component.html",
  styleUrl: "./employees.component.scss",
})
export class EmployeesComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
