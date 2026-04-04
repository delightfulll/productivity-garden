import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPen, FaTimes, FaSave, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import { journalApi, type JournalEntry } from "../lib/api";

function Journal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    journalApi.list()
      .then(setEntries)
      .catch((err) => console.error("Failed to load journal:", err));
  }, []);

  const handleSave = async () => {
    if (!journalEntry.trim()) return;
    try {
      if (editingId !== null) {
        const updated = await journalApi.update(editingId, journalEntry);
        setEntries(entries.map((e) => (e.id === editingId ? updated : e)));
      } else {
        const created = await journalApi.create(journalEntry);
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

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">
          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Journal Entries
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Record your thoughts and reflections
          </motion.p>

          <div className="win-section">
            <AnimatePresence>
              {entries.map((entry) => (
                <motion.div
                  key={entry.id}
                  className="add-win-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  style={{ justifyContent: "space-between", alignItems: "flex-start" }}
                >
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => openEdit(entry)}>
                    <p className="win-card-text" style={{ whiteSpace: "pre-wrap" }}>
                      {entry.entry}
                    </p>
                    <span className="journal-entry-date">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <motion.button
                    style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", padding: "0.25rem", marginLeft: "0.5rem" }}
                    onClick={() => handleDelete(entry.id)}
                    whileHover={{ color: "#ef4444", scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FaTrash />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              className="add-win-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openNew}
              style={{ cursor: "pointer" }}
            >
              <motion.button
                className="add-win-plus"
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <FaPen />
              </motion.button>
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
