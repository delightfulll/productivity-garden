export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:3000";

// ── Auth helpers ──────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("pg_token");
}

export function getUserId(): number {
  // Decode the JWT payload (no crypto verification needed client-side)
  const token = getToken();
  if (!token) return 0;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId ?? 0;
  } catch {
    return 0;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Users / Stats ─────────────────────────────────────────────

export interface UserStats {
  streak: number;
  tasks_done: number;
  wins: number;
  journal_count: number;
  garden_level: number;
  xp: number;
  xp_max: number;
}

export interface ActivityItem {
  type: "task" | "win" | "journal";
  content: string;
  category: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  bio: string;
  focus_areas: string[];
  created_at: string;
}

export const usersApi = {
  getProfile: (userId: number) =>
    request<UserProfile>(`/api/users/${userId}`),
  updateProfile: (userId: number, data: { name?: string; bio?: string; focus_areas?: string[] }) =>
    request<UserProfile>(`/api/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),
  getStats: (userId: number) =>
    request<UserStats>(`/api/users/${userId}/stats`),
  getActivity: (userId: number) =>
    request<ActivityItem[]>(`/api/users/${userId}/activity`),
};

// ── Tasks ─────────────────────────────────────────────────────

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
    request<Task[]>(`/api/tasks?userId=${getUserId()}${category ? `&category=${category}` : ""}`),
  create: (data: { text: string; date?: string; category: string; sort_order?: number }) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
  update: (id: number, data: Partial<{ text: string; date: string; completed: boolean; sort_order: number }>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/tasks/${id}`, { method: "DELETE" }),
  rollover: (id: number) =>
    request<Task>(`/api/tasks/${id}/rollover`, { method: "POST" }),
  autoRollover: () =>
    request<Task[]>("/api/tasks/auto-rollover", { method: "POST" }),
};

// ── Goals ─────────────────────────────────────────────────────

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
  list: () => request<Goal[]>(`/api/goals?userId=${getUserId()}`),
  create: (data: { title: string; description?: string; target_date?: string }) =>
    request<Goal>("/api/goals", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
  update: (id: number, data: Partial<{ title: string; description: string; target_date: string; achieved: boolean }>) =>
    request<Goal>(`/api/goals/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/goals/${id}`, { method: "DELETE" }),
};

// ── Backlog ───────────────────────────────────────────────────

export interface BacklogTask {
  id: number;
  user_id: number;
  text: string;
  note: string;
  created_at: string;
}

export const backlogApi = {
  list: () => request<BacklogTask[]>(`/api/backlog?userId=${getUserId()}`),
  create: (data: { text: string; note?: string }) =>
    request<BacklogTask>("/api/backlog", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/backlog/${id}`, { method: "DELETE" }),
};

// ── Journal ───────────────────────────────────────────────────

export interface JournalEntry {
  id: number;
  user_id: number;
  entry: string;
  /** Calendar day YYYY-MM-DD (user-selected; may differ from created_at for backdated entries) */
  entry_date?: string;
  created_at: string;
}

export const journalApi = {
  list: () => request<JournalEntry[]>(`/api/journal?userId=${getUserId()}`),
  create: (entry: string, entry_date: string) =>
    request<JournalEntry>("/api/journal", {
      method: "POST",
      body: JSON.stringify({ user_id: getUserId(), entry, entry_date }),
    }),
  update: (id: number, entry: string) =>
    request<JournalEntry>(`/api/journal/${id}`, { method: "PUT", body: JSON.stringify({ entry }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/journal/${id}`, { method: "DELETE" }),
};

// ── Wins ──────────────────────────────────────────────────────

export interface Win {
  id: number;
  user_id: number;
  category: "physical" | "mental" | "spiritual";
  content: string;
  created_at: string;
}

export const winsApi = {
  list: (category?: string) =>
    request<Win[]>(`/api/wins?userId=${getUserId()}${category ? `&category=${category}` : ""}`),
  create: (data: { category: string; content: string }) =>
    request<Win>("/api/wins", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
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
    request<TimeBlockingEvent[]>(`/api/timeblocking?userId=${getUserId()}${date ? `&date=${date}` : ""}`),
  create: (data: { slot_id: string; title: string; description?: string; color?: string; event_date?: string }) =>
    request<TimeBlockingEvent>("/api/timeblocking", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/timeblocking/${id}`, { method: "DELETE" }),
};

// ── Milestones ────────────────────────────────────────────────

export interface Milestone {
  id: number;
  user_id: number;
  title: string;
  description: string;
  horizon: "long" | "mid" | "short";
  achieved: boolean;
  target_date: string;
  created_at: string;
}

export const milestonesApi = {
  list: (horizon?: string) =>
    request<Milestone[]>(`/api/milestones?userId=${getUserId()}${horizon ? `&horizon=${horizon}` : ""}`),
  create: (data: { title: string; horizon: "long" | "mid" | "short"; description?: string; target_date?: string }) =>
    request<Milestone>("/api/milestones", { method: "POST", body: JSON.stringify({ user_id: getUserId(), ...data }) }),
  update: (id: number, data: Partial<{ title: string; description: string; target_date: string; achieved: boolean; horizon: string }>) =>
    request<Milestone>(`/api/milestones/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<{ message: string }>(`/api/milestones/${id}`, { method: "DELETE" }),
};

// ── Addictions ────────────────────────────────────────────────

export interface Checkin {
  id: number;
  user_id: number;
  stayed_clean: boolean;
  checked_at: string;
}

export const addictionsApi = {
  listCheckins: () => request<Checkin[]>(`/api/addictions/checkins?userId=${getUserId()}`),
  getStreak: () => request<{ streak: number; last_checkin: string | null }>(`/api/addictions/streak?userId=${getUserId()}`),
  checkIn: (stayed_clean: boolean) =>
    request<{ checkin: Checkin; streak: number }>("/api/addictions/checkins", {
      method: "POST",
      body: JSON.stringify({ user_id: getUserId(), stayed_clean }),
    }),
};

// ── Habits ─────────────────────────────────────────────────────

export type HabitEntryStatus = "success" | "failed";

export interface HabitEntry {
  id: number;
  habit_id: number;
  entry_date: string;
  status: HabitEntryStatus;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  entries: HabitEntry[];
}

export interface ClearedHabitEntry {
  habit_id: number;
  entry_date: string;
  status: null;
}

function normalizeHabitEntry<T extends { entry_date: string }>(entry: T): T {
  return { ...entry, entry_date: entry.entry_date.slice(0, 10) };
}

function normalizeHabit(habit: Habit): Habit {
  return {
    ...habit,
    entries: habit.entries.map(normalizeHabitEntry),
  };
}

export const habitsApi = {
  list: (startDate?: string, endDate?: string) =>
    request<Habit[]>(
      `/api/habits?userId=${getUserId()}${startDate && endDate ? `&startDate=${startDate}&endDate=${endDate}` : ""}`,
    ).then((habits) => habits.map(normalizeHabit)),
  create: (name: string) =>
    request<Habit>("/api/habits", {
      method: "POST",
      body: JSON.stringify({ user_id: getUserId(), name }),
    }).then(normalizeHabit),
  setEntry: (
    habitId: number,
    entry_date: string,
    status: HabitEntryStatus | null,
  ) =>
    request<HabitEntry | ClearedHabitEntry>(
      `/api/habits/${habitId}/entries`,
      {
        method: "PUT",
        body: JSON.stringify({ entry_date, status }),
      },
    ).then(normalizeHabitEntry),
  delete: (id: number) =>
    request<{ message: string }>(`/api/habits/${id}`, { method: "DELETE" }),
};
