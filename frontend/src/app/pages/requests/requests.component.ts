// קובץ זה אחראי על טיפול בבקשות עובדים.
import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

/** עמוד פשוט לשליחת בקשות עובדים ולטיפול המנהל */
@Component({
  selector: "app-requests",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./requests.component.html",
  styleUrl: "./requests.component.scss",
})
export class RequestsComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
