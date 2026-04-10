/** Local calendar day as YYYY-MM-DD (no UTC shift). */
export function formatLocalDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseLocalDayKey(key: string): Date {
  const [y, mo, d] = key.split("-").map(Number);
  if (!y || !mo || !d) return new Date();
  return new Date(y, mo - 1, d, 12, 0, 0, 0);
}

export function nextLocalDayKey(fromKey: string): string {
  const d = parseLocalDayKey(fromKey);
  d.setDate(d.getDate() + 1);
  return formatLocalDayKey(d);
}

/** Canonical YYYY-MM-DD for a task (for rollover / display). */
export function taskDayKey(taskDate: string | undefined | null): string {
  const raw = (taskDate ?? "").trim();
  if (!raw || raw === "No date") {
    return formatLocalDayKey(new Date());
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return formatLocalDayKey(parsed);
  }
  return formatLocalDayKey(new Date());
}

/** Whether a task's stored `date` belongs on this calendar day. */
export function taskBelongsOnDay(
  taskDate: string | undefined | null,
  dayKey: string,
): boolean {
  const raw = (taskDate ?? "").trim();
  if (!raw || raw === "No date") {
    const todayKey = formatLocalDayKey(new Date());
    return dayKey === todayKey;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw === dayKey;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) {
    return formatLocalDayKey(parsed) === dayKey;
  }
  return false;
}
