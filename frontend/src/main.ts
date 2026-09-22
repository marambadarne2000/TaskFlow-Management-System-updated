// קובץ זה אחראי על אתחול אפליקציית הממשק.
import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";

bootstrapApplication(AppComponent).catch(console.error);
