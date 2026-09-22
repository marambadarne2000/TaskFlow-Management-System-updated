// קובץ זה אחראי על רכיב השורש של המערכת.
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TaskflowStoreService } from "./core/services/taskflow-store.service";
import { AuthComponent } from "./pages/auth/auth.component";
import { ShellComponent } from "./layout/shell/shell.component";
import { ModalsComponent } from "./shared/modals/modals.component";

/** קומפוננטת השורש: מחליטה אם להציג את מסך הכניסה או את מעטפת המערכת */
@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule, AuthComponent, ShellComponent, ModalsComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.scss",
})
export class AppComponent {
  // מזריק לרכיב את השירות המרכזי שמספק נתונים ופעולות.
  constructor(public vm: TaskflowStoreService) {}
}
