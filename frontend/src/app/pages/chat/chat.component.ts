// קובץ זה אחראי על תקשורת בין חברי פרויקט.
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ChatMessage } from "../../core/models/taskflow.models";
import { TaskflowStoreService } from "../../core/services/taskflow-store.service";

/** צאט פרויקט: מציג רק את המנהל וחברי הצוות ששייכים לפרויקט הנבחר */
@Component({
  selector: "app-chat",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./chat.component.html",
  styleUrl: "./chat.component.scss",
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild("messageList") messageList?: ElementRef<HTMLElement>;
  searchText = "";
  filesOnly = false;
  showFiles = false;
  uploading = false;
  previewFile?: ChatMessage;
  signalFilter: "all" | "decision" | "question" | "risk" = "all";
  private refreshTimer?: ReturnType<typeof setInterval>;

  // מזריק את השירות המרכזי ואת מנגנון האבטחה לכתובות תצוגה מקדימה
  constructor(public vm: TaskflowStoreService, private sanitizer: DomSanitizer) {}

  // מרענן את חדר הפרויקט בזמן שהוא פתוח כדי שהודעות חדשות יופיעו ללא רענון הדף
  ngOnInit() {
    void this.vm.loadChat().then(() => setTimeout(() => this.scrollToLatest()));
    this.refreshTimer = setInterval(() => void this.vm.loadChat(), 15000);
  }

  ngOnDestroy() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  }

  get roomMessages() {
    return this.vm.messages.filter((message) => message.projectId === +this.vm.chatProjectId && message.managerId === +this.vm.chatManagerId);
  }

  get filteredMessages() {
    const query = this.searchText.trim().toLowerCase();
    return this.roomMessages.filter((message) =>
      (!this.filesOnly || !!message.fileName) &&
      (this.signalFilter === "all" || this.messageSignal(message) === this.signalFilter) &&
      (!query || `${message.text} ${message.fileName || ""} ${this.vm.name(message.userId)}`.toLowerCase().includes(query)),
    );
  }

  // מסווג מסרים חשובים לפי התוכן כדי להפוך שיחה ארוכה לתמונה ניהולית קצרה
  messageSignal(message: ChatMessage): "decision" | "question" | "risk" | "message" {
    const text = message.text.toLowerCase();
    if (/[?؟]|האם|איך|למה|מתי/.test(text)) return "question";
    if (/סיכון|תקלה|חסום|עיכוב|איחור|דחוף/.test(text)) return "risk";
    if (/החלטנו|סוכם|מאושר|נבחר|לבצע|החלטה/.test(text)) return "decision";
    return "message";
  }

  signalCount(signal: "decision" | "question" | "risk") {
    return this.roomMessages.filter((message) => this.messageSignal(message) === signal).length;
  }

  signalName(message: ChatMessage) {
    return ({ decision: "החלטה", question: "שאלה", risk: "סיכון", message: "עדכון" } as const)[this.messageSignal(message)];
  }

  get roomFiles() {
    return this.roomMessages.filter((message) => !!message.fileName).reverse();
  }

  fileExtension(message: ChatMessage) {
    return (message.fileName?.split(".").pop() || "FILE").toUpperCase();
  }

  fileIcon(message: ChatMessage) {
    const extension = this.fileExtension(message).toLowerCase();
    if (["png", "jpg", "jpeg"].includes(extension)) return "image";
    if (extension === "pdf") return "picture_as_pdf";
    if (["doc", "docx"].includes(extension)) return "description";
    if (extension === "zip") return "folder_zip";
    return "draft";
  }

  canPreview(message: ChatMessage) {
    return ["png", "jpg", "jpeg", "pdf", "txt"].includes(this.fileExtension(message).toLowerCase());
  }

  isImage(message: ChatMessage) {
    return ["png", "jpg", "jpeg"].includes(this.fileExtension(message).toLowerCase());
  }

  safePreviewUrl(message: ChatMessage) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.vm.chatFileUrl(message, true));
  }

  async sendMessage() {
    await this.vm.sendChat();
    setTimeout(() => this.scrollToLatest());
  }

  async uploadFile() {
    if (!this.vm.chatFile || this.uploading) return;
    this.uploading = true;
    await this.vm.uploadChatFile();
    this.uploading = false;
    setTimeout(() => this.scrollToLatest());
  }

  async changeRoom() {
    this.searchText = "";
    this.previewFile = undefined;
    await this.vm.loadChat();
    setTimeout(() => this.scrollToLatest());
  }

  scrollToLatest() {
    const element = this.messageList?.nativeElement;
    if (element) element.scrollTop = element.scrollHeight;
  }
}
