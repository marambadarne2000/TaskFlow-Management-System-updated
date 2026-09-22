// קובץ זה אחראי על אימות משתמשים ושחזור גישה.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

/** מסך אימות: מטפל בכניסה, שכחתי סיסמה וקביעת סיסמה חדשה */
@Component({
  selector: "app-auth",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./auth.component.html",
  styleUrl: "./auth.component.scss",
})
export class AuthComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
