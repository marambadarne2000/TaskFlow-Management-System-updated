// קובץ זה אחראי על חישוב שכר והפקת תלושים.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { EmployeePickerComponent } from "../../shared/employee-picker/employee-picker.component";

/** מסך שכר: המנהל מפיק תלושים והעובד מסנן וצופה בתלושים שלו */
@Component({
  selector: "app-payroll",
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeePickerComponent],
  templateUrl: "./payroll.component.html",
  styleUrl: "./payroll.component.scss",
})
export class PayrollComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
