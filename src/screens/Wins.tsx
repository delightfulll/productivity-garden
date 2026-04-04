import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaSave, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import { winsApi, type Win } from "../lib/api";

type WinCategory = "physical" | "mental" | "spiritual";

function Wins() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winEntry, setWinEntry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<WinCategory>("physical");
  const [wins, setWins] = useState<Win[]>([]);

  useEffect(() => {
    winsApi.list()
      .then(setWins)
      .catch((err) => console.error("Failed to load wins:", err));
  }, []);

  const handleAddWin = async () => {
    if (!winEntry.trim()) return;
    try {
      const created = await winsApi.create({ category: selectedCategory, content: winEntry.trim() });
      setWins([...wins, created]);
    } catch (err) {
      console.error("Failed to create win:", err);
    }
    setWinEntry("");
    setIsModalOpen(false);
  };

  const handleDeleteWin = async (id: number) => {
    setWins(wins.filter((w) => w.id !== id));
    try {
      await winsApi.delete(id);
    } catch (err) {
      console.error("Failed to delete win:", err);
    }
  };

  const renderWinSection = (category: WinCategory, title: string) => {
    const categoryWins = wins.filter((w) => w.category === category);
    return (
      <div className="win-section">
        <h3 className="win-section-title">{title}</h3>
        <AnimatePresence>
          {categoryWins.map((win) => (
            <motion.div
              key={win.id}
              className="win-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              whileHover={{ scale: 1.02 }}
              style={{ justifyContent: "space-between" }}
            >
              <div className="flex flex-col">
                <span className="win-card-text">{win.content}</span>
                <span className="journal-entry-date">
                  {new Date(win.created_at).toLocaleDateString()}
                </span>
              </div>
              <motion.button
                style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", padding: "0.25rem" }}
                onClick={() => handleDeleteWin(win.id)}
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
          onClick={() => { setSelectedCategory(category); setIsModalOpen(true); }}
        >
          <motion.button
            className="add-win-plus"
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <FaPlus />
          </motion.button>
          <span className="add-win-input">Add a new {category} win...</span>
        </motion.div>
      </div>
    );
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
            Daily Wins
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Track your daily achievements across different aspects of life
          </motion.p>

          {renderWinSection("physical", "Physical Win")}
          {renderWinSection("mental", "Mental Win")}
          {renderWinSection("spiritual", "Spiritual Win")}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="journal-modal-content"
        overlayClassName="journal-modal"
        contentLabel="New Win Entry"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="journal-modal-title">
              New {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Win
            </h3>
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
              value={winEntry}
              onChange={(e) => setWinEntry(e.target.value)}
              placeholder={`Write your ${selectedCategory} win here...`}
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
                onClick={handleAddWin}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSave className="button-icon" />
                Save Win
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Wins;
