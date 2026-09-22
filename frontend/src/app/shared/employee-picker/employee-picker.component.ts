// קובץ זה אחראי על חיפוש ובחירת עובדים.
import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";

interface PickerEmployee {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "employee";
  status: "active" | "blocked";
  active: number;
  limit: number;
  rate: number;
}

@Component({
  selector: "app-employee-picker",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./employee-picker.component.html",
  styleUrl: "./employee-picker.component.scss",
})
export class EmployeePickerComponent {
  // הנתונים והאפשרויות מתקבלים מהמסך שמארח את בורר העובדים.
  @Input() employees: PickerEmployee[] = [];
  @Input() selectedId = 0;
  @Output() selectedIdChange = new EventEmitter<number>();
  @Input() placeholder = "חיפוש עובד";
  @Input() allowAll = false;
  @Input() disableAtLimit = false;

  open = false;
  search = "";

  // מאתר את העובד שנבחר כדי להציג את פרטיו על כפתור הבחירה.
  get selectedEmployee() {
    return this.employees.find(
      (employee) =>
        employee.role === "employee" &&
        employee.status === "active" &&
        employee.id === +this.selectedId,
    );
  }

  // מציג רק עובדים פעילים, מסנן לפי החיפוש ומציג קודם את העובדים הפנויים יותר.
  get filteredEmployees() {
    const query = this.search.trim().toLowerCase();

    return this.employees
      .filter(
        (employee) =>
          employee.role === "employee" && employee.status === "active",
      )
      .filter((employee) => {
        if (!query) return true;

        return (
          employee.name.toLowerCase().includes(query) ||
          employee.email.toLowerCase().includes(query) ||
          (employee.phone || "").toLowerCase().includes(query) ||
          String(employee.id).includes(query)
        );
      })
      .sort(
        (first, second) =>
          first.active - second.active ||
          first.name.localeCompare(second.name, "he"),
      );
  }

  // מונע בחירה רק כאשר המסך דורש בדיקת מגבלה והעובד הגיע אליה.
  unavailable(employee: PickerEmployee) {
    return this.disableAtLimit && employee.active >= employee.limit;
  }

  // מחזיר למסך המארח את מזהה העובד שנבחר וסוגר את הרשימה.
  choose(id: number) {
    this.selectedId = id;
    this.selectedIdChange.emit(id);
    this.open = false;
    this.search = "";
  }
}
