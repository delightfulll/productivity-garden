import React, { useState } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPen, FaTimes, FaSave } from "react-icons/fa";
import Modal from "react-modal";

function Journal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [entries, setEntries] = useState<string[]>([]);
  const handleAddEntry = () => {
    if (journalEntry.trim()) {
      setEntries([...entries, journalEntry]);
      setJournalEntry("");
      setIsModalOpen(false);
    }
  };

  return (
    <div className="app-container">
      <Sidebar />

      {/* Main Content Area */}
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

          {/* Journal Entries List */}
          <div className="win-section">
            <AnimatePresence>
              {entries.map((entry, index) => (
                <motion.div
                  key={entry}
                  className="win-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex flex-col">
                    <span className="win-card-text">{entry}</span>
                    <span className="journal-entry-date">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add New Entry Button */}
            <motion.div
              className="add-win-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.button
                className="add-win-plus"
                onClick={() => setIsModalOpen(true)}
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

      {/* React Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="journal-modal-content"
        overlayClassName="journal-modal"
        contentLabel="New Journal Entry"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="journal-modal-title">New Journal Entry</h3>
            <motion.button
              className="modal-close-button"
              onClick={() => setIsModalOpen(false)}
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
                onClick={() => setIsModalOpen(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="journal-save-button"
                onClick={handleAddEntry}
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
