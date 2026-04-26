import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import {
  habitsApi,
  type Habit,
  type HabitEntry,
  type HabitEntryStatus,
} from "../lib/api";
import { formatLocalDayKey, parseLocalDayKey } from "../lib/dateUtils";
import "../styles/habits.css";

interface HabitListProps {
  endDateKey?: string;
  title?: string;
  subtitle?: string;
  showAddHabit?: boolean;
  showDelete?: boolean;
  compact?: boolean;
  emptyMessage?: string;
}

type HabitChoice = HabitEntryStatus | null;

const STATUS_OPTIONS: Array<{
  label: string;
  value: HabitChoice;
  className: string;
}> = [
  { label: "Green", value: "success", className: "habit-choice-success" },
  { label: "Red", value: "failed", className: "habit-choice-failed" },
  { label: "Grey / No response", value: null, className: "habit-choice-empty" },
];

function getSevenDayKeys(endDateKey: string): string[] {
  const end = parseLocalDayKey(endDateKey);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(end);
    day.setDate(end.getDate() - (6 - index));
    return formatLocalDayKey(day);
  });
}

function formatDayLabel(dayKey: string): string {
  return parseLocalDayKey(dayKey).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatDayTitle(dayKey: string): string {
  return parseLocalDayKey(dayKey).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function entryForDay(habit: Habit, dayKey: string): HabitEntry | undefined {
  return habit.entries.find((entry) => entry.entry_date === dayKey);
}

function HabitList({
  endDateKey,
  title = "Habit Tracker",
  subtitle,
  showAddHabit = true,
  showDelete = true,
  compact = false,
  emptyMessage = "No habits yet. Add one above to start tracking your week.",
}: HabitListProps) {
  const sectionTitleId = useId();
  const rangeEndKey = endDateKey ?? formatLocalDayKey(new Date());
  const dayKeys = useMemo(() => getSevenDayKeys(rangeEndKey), [rangeEndKey]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    habitsApi
      .list(dayKeys[0], dayKeys[dayKeys.length - 1])
      .then(setHabits)
      .catch((err) => console.error("Failed to load habits:", err));
  }, [dayKeys]);

  useEffect(() => {
    if (!openMenuKey) return;
    const close = (event: MouseEvent) => {
      if (
        menuWrapRef.current &&
        !menuWrapRef.current.contains(event.target as Node)
      ) {
        setOpenMenuKey(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [openMenuKey]);

  const handleCreateHabit = useCallback(async () => {
    const trimmed = newHabitName.trim();
    if (!trimmed) return;

    try {
      const created = await habitsApi.create(trimmed);
      setHabits((current) => [...current, created]);
      setNewHabitName("");
    } catch (err) {
      console.error("Failed to create habit:", err);
    }
  }, [newHabitName]);

  const handleDeleteHabit = useCallback(async (habitId: number) => {
    setHabits((current) => current.filter((habit) => habit.id !== habitId));
    try {
      await habitsApi.delete(habitId);
    } catch (err) {
      console.error("Failed to delete habit:", err);
    }
  }, []);

  const handleSetEntry = useCallback(
    async (habitId: number, dayKey: string, status: HabitChoice) => {
      setOpenMenuKey(null);

      setHabits((current) =>
        current.map((habit) => {
          if (habit.id !== habitId) return habit;
          const entries = habit.entries.filter(
            (entry) => entry.entry_date !== dayKey,
          );
          if (!status) return { ...habit, entries };
          return {
            ...habit,
            entries: [
              ...entries,
              {
                id: Date.now(),
                habit_id: habitId,
                entry_date: dayKey,
                status,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ],
          };
        }),
      );

      try {
        const saved = await habitsApi.setEntry(habitId, dayKey, status);
        setHabits((current) =>
          current.map((habit) => {
            if (habit.id !== habitId) return habit;
            const entries = habit.entries.filter(
              (entry) => entry.entry_date !== dayKey,
            );
            if (saved.status === null) return { ...habit, entries };
            return { ...habit, entries: [...entries, saved] };
          }),
        );
      } catch (err) {
        console.error("Failed to save habit entry:", err);
        habitsApi
          .list(dayKeys[0], dayKeys[dayKeys.length - 1])
          .then(setHabits)
          .catch((loadErr) => console.error("Failed to reload habits:", loadErr));
      }
    },
    [dayKeys],
  );

  return (
    <section
      className={`habit-section ${compact ? "habit-section-compact" : ""}`}
      aria-labelledby={title ? sectionTitleId : undefined}
    >
      {(title || subtitle) && (
        <div className="habit-header">
          <div>
            {title && (
              <h2 id={sectionTitleId} className="section-title section-title-watering">
                {title}
              </h2>
            )}
            {subtitle && <p className="section-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}

      {showAddHabit && (
        <div className="habit-add-card">
          <FaPlus className="add-task-plus" aria-hidden />
          <input
            className="habit-add-input"
            value={newHabitName}
            onChange={(event) => setNewHabitName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleCreateHabit();
              }
            }}
            placeholder="Add a habit to track..."
            aria-label="New habit name"
          />
          <button
            type="button"
            className="habit-add-button"
            onClick={() => void handleCreateHabit()}
          >
            Add Habit
          </button>
        </div>
      )}

      {habits.length === 0 ? (
        <div className="habit-empty-card">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => (
            <article key={habit.id} className="habit-card">
              <div className="habit-card-top">
                <h3 className="habit-name">{habit.name}</h3>
                {showDelete && (
                  <button
                    type="button"
                    className="habit-delete-button"
                    onClick={() => void handleDeleteHabit(habit.id)}
                    aria-label={`Delete ${habit.name}`}
                  >
                    <FaTrash aria-hidden />
                  </button>
                )}
              </div>

              <div className="habit-days" aria-label={`${habit.name} last seven days`}>
                {dayKeys.map((dayKey) => {
                  const entry = entryForDay(habit, dayKey);
                  const menuKey = `${habit.id}-${dayKey}`;
                  const statusClass = entry
                    ? `habit-circle-${entry.status}`
                    : "habit-circle-empty";

                  return (
                    <div
                      key={dayKey}
                      className="habit-day"
                      ref={openMenuKey === menuKey ? menuWrapRef : undefined}
                    >
                      <button
                        type="button"
                        className={`habit-circle ${statusClass}`}
                        onClick={() =>
                          setOpenMenuKey((current) =>
                            current === menuKey ? null : menuKey,
                          )
                        }
                        aria-label={`${formatDayTitle(dayKey)} status: ${
                          entry?.status ?? "no response"
                        }`}
                        aria-haspopup="menu"
                        aria-expanded={openMenuKey === menuKey}
                      />
                      <span className="habit-day-label">{formatDayLabel(dayKey)}</span>

                      {openMenuKey === menuKey && (
                        <div className="habit-status-menu" role="menu">
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              role="menuitem"
                              className="habit-status-option"
                              onClick={() =>
                                void handleSetEntry(habit.id, dayKey, option.value)
                              }
                            >
                              <span
                                className={`habit-choice-dot ${option.className}`}
                                aria-hidden
                              />
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default HabitList;
