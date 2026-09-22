// קובץ זה אחראי על שליחה וקריאה של התראות.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";
import { EmployeePickerComponent } from "../../shared/employee-picker/employee-picker.component";

/** ניהול התראות: מאפשר למנהל לשלוח הודעה לעובד אחד או לכל העובדים */
@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [CommonModule, FormsModule, EmployeePickerComponent],
  templateUrl: "./notifications.component.html",
  styleUrl: "./notifications.component.scss",
})
export class NotificationsComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
