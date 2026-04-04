const BASE = "http://localhost:3000";

// Change this to the logged-in user's ID when auth is added
export const USER_ID = 1;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Tasks ────────────────────────────────────────────────────

export interface Task {
  id: number;
  user_id: number;
  text: string;
  date: string;
  completed: boolean;
  category: "watering" | "sunlight" | "composting";
  sort_order: number;
  created_at: string;
}

export const tasksApi = {
  list: (category?: string) =>
    request<Task[]>(`/api/tasks?userId=${USER_ID}${category ? `&category=${category}` : ""}`),
  create: (data: { text: string; date?: string; category: string; sort_order?: number }) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify({ user_id: USER_ID, ...data }) }),
  update: (id: number, data: Partial<{ text: string; date: string; completed: boolean; sort_order: number }>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/tasks/${id}`, { method: "DELETE" }),
};

// ── Goals ────────────────────────────────────────────────────

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  description: string;
  target_date: string;
  achieved: boolean;
  created_at: string;
}

export const goalsApi = {
  list: () => request<Goal[]>(`/api/goals?userId=${USER_ID}`),
  create: (data: { title: string; description?: string; target_date?: string }) =>
    request<Goal>("/api/goals", { method: "POST", body: JSON.stringify({ user_id: USER_ID, ...data }) }),
  update: (id: number, data: Partial<{ title: string; description: string; target_date: string; achieved: boolean }>) =>
    request<Goal>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/goals/${id}`, { method: "DELETE" }),
};

// ── Backlog ──────────────────────────────────────────────────

export interface BacklogTask {
  id: number;
  user_id: number;
  text: string;
  note: string;
  created_at: string;
}

export const backlogApi = {
  list: () => request<BacklogTask[]>(`/api/backlog?userId=${USER_ID}`),
  create: (data: { text: string; note?: string }) =>
    request<BacklogTask>("/api/backlog", { method: "POST", body: JSON.stringify({ user_id: USER_ID, ...data }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/backlog/${id}`, { method: "DELETE" }),
};

// ── Journal ──────────────────────────────────────────────────

export interface JournalEntry {
  id: number;
  user_id: number;
  entry: string;
  created_at: string;
}

export const journalApi = {
  list: () => request<JournalEntry[]>(`/api/journal?userId=${USER_ID}`),
  create: (entry: string) =>
    request<JournalEntry>("/api/journal", { method: "POST", body: JSON.stringify({ user_id: USER_ID, entry }) }),
  update: (id: number, entry: string) =>
    request<JournalEntry>(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify({ entry }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/journal/${id}`, { method: "DELETE" }),
};

// ── Wins ─────────────────────────────────────────────────────

export interface Win {
  id: number;
  user_id: number;
  category: "physical" | "mental" | "spiritual";
  content: string;
  created_at: string;
}

export const winsApi = {
  list: (category?: string) =>
    request<Win[]>(`/api/wins?userId=${USER_ID}${category ? `&category=${category}` : ""}`),
  create: (data: { category: string; content: string }) =>
    request<Win>("/api/wins", { method: "POST", body: JSON.stringify({ user_id: USER_ID, ...data }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/wins/${id}`, { method: "DELETE" }),
};

// ── Time Blocking ─────────────────────────────────────────────

export interface TimeBlockingEvent {
  id: number;
  user_id: number;
  slot_id: string;
  event_date: string;
  title: string;
  description: string;
  color: string;
  created_at: string;
}

export const timeblockingApi = {
  list: (date?: string) =>
    request<TimeBlockingEvent[]>(`/api/timeblocking?userId=${USER_ID}${date ? `&date=${date}` : ""}`),
  create: (data: { slot_id: string; title: string; description?: string; color?: string; event_date?: string }) =>
    request<TimeBlockingEvent>("/api/timeblocking", { method: "POST", body: JSON.stringify({ user_id: USER_ID, ...data }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/timeblocking/${id}`, { method: "DELETE" }),
};

// ── Addictions ────────────────────────────────────────────────

export interface Checkin {
  id: number;
  user_id: number;
  stayed_clean: boolean;
  checked_at: string;
}

export const addictionsApi = {
  listCheckins: () => request<Checkin[]>(`/api/addictions/checkins?userId=${USER_ID}`),
  getStreak: () => request<{ streak: number; last_checkin: string | null }>(`/api/addictions/streak?userId=${USER_ID}`),
  checkIn: (stayed_clean: boolean) =>
    request<{ checkin: Checkin; streak: number }>("/api/addictions/checkins", {
      method: "POST",
      body: JSON.stringify({ user_id: USER_ID, stayed_clean }),
    }),
};
