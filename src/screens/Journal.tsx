import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPen, FaTimes, FaSave, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Modal from "react-modal";
import { journalApi, type JournalEntry } from "../lib/api";
import { useConfirmDeletion } from "../context/ConfirmContext";

/** Calendar day for grouping (user-chosen date, or legacy: created_at local day). */
function entryDayKey(e: JournalEntry): string {
  const d = e.entry_date;
  if (d != null && String(d).trim() !== "") {
    const s = String(d);
    return s.length >= 10 ? s.slice(0, 10) : s;
  }
  return dateToKey(new Date(e.created_at));
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function todayKey(): string {
  return dateToKey(new Date());
}

/** Returns the Sunday that starts the week `weekOffset` weeks from today's week. */
function getWeekSunday(weekOffset: number): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const sunday = new Date(now);
  sunday.setDate(now.getDate() - now.getDay() + weekOffset * 7);
  return sunday;
}

/** Returns up to 7 date-key strings for the given week, capped at today. */
function getWeekDays(weekOffset: number): string[] {
  const sunday = getWeekSunday(weekOffset);
  const today = todayKey();
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const key = dateToKey(d);
    if (key > today) break; // never show future dates
    days.push(key);
  }
  return days;
}

function formatChip(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return {
    dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
    dayNum: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    year,
  };
}

function formatWeekRange(weekOffset: number): string {
  const days = getWeekDays(weekOffset);
  if (days.length === 0) return "";
  const first = formatChip(days[0]);
  const last = formatChip(days[days.length - 1]);
  if (first.month === last.month && first.year === last.year) {
    return `${first.month} ${first.dayNum} – ${last.dayNum}, ${first.year}`;
  }
  if (first.year === last.year) {
    return `${first.month} ${first.dayNum} – ${last.month} ${last.dayNum}, ${first.year}`;
  }
  return `${first.month} ${first.dayNum}, ${first.year} – ${last.month} ${last.dayNum}, ${last.year}`;
}

// ── Component ─────────────────────────────────────────────────────────────────

function Journal() {
  const { confirmDeletion } = useConfirmDeletion();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey());
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    journalApi
      .list()
      .then(setEntries)
      .catch((err) => console.error("Failed to load journal:", err));
  }, []);

  const weekDays = getWeekDays(weekOffset);
  const canGoRight = weekOffset < 0; // current week is the rightmost
  const canGoLeft = true;            // can always go further back

  const goToPrevWeek = () => {
    const newOffset = weekOffset - 1;
    const newDays = getWeekDays(newOffset);
    setWeekOffset(newOffset);
    // Keep selected date if it's in the new week, otherwise pick the last day shown
    if (!newDays.includes(selectedDate)) {
      setSelectedDate(newDays[newDays.length - 1]);
    }
  };

  const goToNextWeek = () => {
    if (!canGoRight) return;
    const newOffset = weekOffset + 1;
    const newDays = getWeekDays(newOffset);
    setWeekOffset(newOffset);
    if (!newDays.includes(selectedDate)) {
      setSelectedDate(newDays[newDays.length - 1]);
    }
  };

  const filteredEntries = entries.filter((e) => entryDayKey(e) === selectedDate);

  const handleSave = async () => {
    if (!journalEntry.trim()) return;
    try {
      if (editingId !== null) {
        const updated = await journalApi.update(editingId, journalEntry);
        setEntries(entries.map((e) => (e.id === editingId ? updated : e)));
      } else {
        const created = await journalApi.create(journalEntry, selectedDate);
        setEntries([created, ...entries]);
      }
    } catch (err) {
      console.error("Failed to save journal entry:", err);
    }
    setJournalEntry("");
    setEditingId(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDeletion("Delete this journal entry?"))) return;
    setEntries(entries.filter((e) => e.id !== id));
    try {
      await journalApi.delete(id);
    } catch (err) {
      console.error("Failed to delete journal entry:", err);
    }
  };

  const openEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setJournalEntry(entry.entry);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setJournalEntry("");
    setIsModalOpen(true);
  };

  const isToday = selectedDate === todayKey();

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">

          {/* Header */}
          <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.5rem" }}>
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Journal
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Record your thoughts and reflections
              </motion.p>
            </div>
          </div>

          {/* Week label + navigation */}
          <div className="journal-week-nav">
            <motion.button
              className="journal-timeline-arrow"
              onClick={goToPrevWeek}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Previous week"
            >
              <FaChevronLeft />
            </motion.button>

            <AnimatePresence mode="wait">
              <motion.span
                key={weekOffset}
                className="journal-week-label"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.18 }}
              >
                {weekOffset === 0 ? "This week" : weekOffset === -1 ? "Last week" : formatWeekRange(weekOffset)}
              </motion.span>
            </AnimatePresence>

            <motion.button
              className={`journal-timeline-arrow ${!canGoRight ? "journal-timeline-arrow-disabled" : ""}`}
              onClick={goToNextWeek}
              whileHover={canGoRight ? { scale: 1.1 } : {}}
              whileTap={canGoRight ? { scale: 0.9 } : {}}
              title="Next week"
              disabled={!canGoRight}
            >
              <FaChevronRight />
            </motion.button>
          </div>

          {/* Date chips — always exactly the week's days (capped at today) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={weekOffset}
              className="journal-timeline-chips"
              initial={{ opacity: 0, x: weekOffset < 0 ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {weekDays.map((key) => {
                const { dayName, dayNum, month } = formatChip(key);
                const isSelected = key === selectedDate;
                const isCurrentDay = key === todayKey();
                const hasEntries = entries.some((e) => entryDayKey(e) === key);

                return (
                  <motion.button
                    key={key}
                    className={`journal-date-chip ${isSelected ? "journal-date-chip-active" : ""}`}
                    onClick={() => setSelectedDate(key)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="journal-date-chip-day">{dayName}</span>
                    <span className="journal-date-chip-num">{dayNum}</span>
                    <span className="journal-date-chip-month">{month}</span>
                    {isCurrentDay && (
                      <span className="journal-date-chip-today">Today</span>
                    )}
                    {hasEntries && (
                      <span className={`journal-date-dot ${isSelected ? "journal-date-dot-active" : ""}`} />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Selected date label */}
          <motion.p
            key={selectedDate}
            className="journal-selected-label"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isToday
              ? "Today's entries"
              : (() => {
                  const { dayName, dayNum, month, year } = formatChip(selectedDate);
                  return `${dayName}, ${month} ${dayNum}, ${year}`;
                })()}
          </motion.p>

          {/* Entries */}
          <div className="win-section">
            <AnimatePresence mode="popLayout">
              {filteredEntries.length === 0 ? (
                <motion.div
                  key="empty"
                  className="journal-empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="journal-empty-icon">🌱</span>
                  <p>No entries for this day yet.</p>
                  <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    Click below to start writing.
                  </p>
                </motion.div>
              ) : (
                filteredEntries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    className="add-win-card journal-entry-card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openEdit(entry)}>
                      <p className="win-card-text" style={{ whiteSpace: "pre-wrap" }}>
                        {entry.entry}
                      </p>
                      <span className="journal-entry-date">
                        {new Date(entry.created_at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <motion.button
                      className="journal-card-delete-btn"
                      onClick={() => handleDelete(entry.id)}
                      whileHover={{ color: "#ef4444", scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <FaTrash />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            <motion.div
              className="add-win-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openNew}
              style={{ cursor: "pointer", marginTop: "0.5rem" }}
            >
              <motion.div
                className="add-win-plus"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <FaPen />
              </motion.div>
              <span className="add-win-input">Add a new journal entry...</span>
            </motion.div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => { setIsModalOpen(false); setEditingId(null); setJournalEntry(""); }}
        className="journal-modal-content"
        overlayClassName="journal-modal"
        contentLabel="Journal Entry"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="journal-modal-title">
              {editingId !== null ? "Edit Entry" : "New Journal Entry"}
            </h3>
            <motion.button
              className="modal-close-button"
              onClick={() => { setIsModalOpen(false); setEditingId(null); setJournalEntry(""); }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <textarea
              className="journal-textarea"
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write your thoughts here..."
            />
            <div className="journal-modal-buttons">
              <motion.button
                className="journal-cancel-button"
                onClick={() => { setIsModalOpen(false); setEditingId(null); setJournalEntry(""); }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="journal-save-button"
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave className="button-icon" />
                Save Entry
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Journal;
