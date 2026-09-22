// קובץ זה אחראי על חלונות וטפסים משותפים.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { EmployeePickerComponent } from "../employee-picker/employee-picker.component";
/** חלונות קופצים: טפסים להוספת פרויקט, משימה, עובד והתראה ותצוגת פרטים */
@Component({
  selector: "app-modals",
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeePickerComponent],
  templateUrl: "./modals.component.html",
  styleUrl: "./modals.component.scss",
})
export class ModalsComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
