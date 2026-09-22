import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

@Injectable({ providedIn: "root" })
export class ApiClientService {
  private csrfToken = sessionStorage.getItem("taskflow-csrf") || "";

  async request<T = any>(
    action: string,
    method: ApiMethod = "GET",
    body?: unknown,
  ): Promise<T> {
    return this.send<T>(action, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  async upload<T = any>(action: string, form: FormData): Promise<T> {
    return this.send<T>(action, {
      method: "POST",
      body: form,
    });
  }

  fileUrl(action: string, parameters: Record<string, string | number>): string {
    const query = new URLSearchParams({ action });
    Object.entries(parameters).forEach(([key, value]) => {
      query.set(key, String(value));
    });
    return `${environment.apiUrl}?${query.toString()}`;
  }

  private async send<T>(action: string, init: RequestInit): Promise<T> {
    let response: Response;

    const headers = new Headers(init.headers || {});
    if (this.csrfToken && init.method && init.method !== "GET") {
      headers.set("X-CSRF-Token", this.csrfToken);
    }

    try {
      // מפריד בין שם הפעולה לבין פרמטרים של GET כדי לא לקודד את כל השאילתה כשם פעולה אחד
      const [actionName, ...queryParts] = action.split("&");
      const query = new URLSearchParams(queryParts.join("&"));
      query.set("action", actionName);
      response = await fetch(
        `${environment.apiUrl}?${query.toString()}`,
        { ...init, headers, credentials: "include" },
      );
    } catch {
      throw new ApiError("לא ניתן להתחבר לשרת", 0);
    }

    const data = await this.readResponse(response);
    if (data?.csrf_token) {
      this.csrfToken = data.csrf_token;
      sessionStorage.setItem("taskflow-csrf", this.csrfToken);
    }
    if (!response.ok) {
      if (response.status === 401 || response.status === 419) {
        this.csrfToken = "";
        sessionStorage.removeItem("taskflow-csrf");
      }
      throw new ApiError(data?.error || "שגיאת שרת", response.status);
    }

    return data as T;
  }

  private async readResponse(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      throw new ApiError("השרת החזיר תשובה לא תקינה", response.status);
    }
  }
}
