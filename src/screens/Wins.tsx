import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaSave, FaTrash, FaChevronDown } from "react-icons/fa";
import Modal from "react-modal";
import { winsApi, type Win } from "../lib/api";

type WinCategory = "physical" | "mental" | "spiritual";

interface CategoryConfig {
  key: WinCategory;
  icon: string;
  title: string;
  emptyIcon: string;
  emptyText: string;
  badgeClass: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: "physical",
    icon: "🏃",
    title: "Physical",
    emptyIcon: "💪",
    emptyText: "Log a physical win — a workout, walk, or healthy meal.",
    badgeClass: "wins-badge-physical",
  },
  {
    key: "mental",
    icon: "🧠",
    title: "Mental",
    emptyIcon: "✨",
    emptyText: "Capture a mental win — focus, learning, or mindset shift.",
    badgeClass: "wins-badge-mental",
  },
  {
    key: "spiritual",
    icon: "🙏",
    title: "Spiritual",
    emptyIcon: "🌿",
    emptyText: "Note a spiritual win — gratitude, meditation, or connection.",
    badgeClass: "wins-badge-spiritual",
  },
];

interface WinSectionProps {
  config: CategoryConfig;
  wins: Win[];
  onAdd: (category: WinCategory) => void;
  onDelete: (id: number) => void;
}

const WinSection = ({ config, wins, onAdd, onDelete }: WinSectionProps) => {
  const [open, setOpen] = useState(true);

  return (
    <motion.div
      className="wins-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div
        className={`wins-section-header ${open ? "wins-section-header-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="wins-section-icon">{config.icon}</span>
        <div className="wins-section-label">
          <p className="wins-section-title">{config.title} Wins</p>
        </div>
        <span className={`wins-badge ${config.badgeClass}`}>{wins.length}</span>
        <motion.span
          className={`wins-chevron ${open ? "wins-chevron-open" : ""}`}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <FaChevronDown />
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="wins-section-body">
              <AnimatePresence mode="popLayout">
                {wins.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="wins-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="wins-empty-icon">{config.emptyIcon}</span>
                    <p>{config.emptyText}</p>
                  </motion.div>
                ) : (
                  wins.map((win) => (
                    <motion.div
                      key={win.id}
                      className="win-card"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      whileHover={{ scale: 1.01 }}
                      style={{ justifyContent: "space-between" }}
                    >
                      <div className="flex flex-col">
                        <span className="win-card-text">{win.content}</span>
                        <span className="journal-entry-date">
                          {new Date(win.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <motion.button
                        className="wins-delete-btn"
                        onClick={() => onDelete(win.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Delete win"
                      >
                        <FaTrash />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>

              <motion.div
                className="journey-add-card"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAdd(config.key)}
              >
                <motion.span
                  className="journey-add-icon"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaPlus />
                </motion.span>
                <span className="journey-add-text">Add a {config.title.toLowerCase()} win…</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

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

  const openAdd = (category: WinCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const selectedConfig = CATEGORIES.find((c) => c.key === selectedCategory)!;

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">
          <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.75rem" }}>
            <div className="welcome-section">
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
                Celebrate your progress — every win counts.
              </motion.p>
            </div>
          </div>

          {CATEGORIES.map((config, i) => (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <WinSection
                config={config}
                wins={wins.filter((w) => w.category === config.key)}
                onAdd={openAdd}
                onDelete={handleDeleteWin}
              />
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="journey-modal-content"
        overlayClassName="journey-modal"
        contentLabel="New Win Entry"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="journey-modal-title">
              {selectedConfig.icon} New {selectedConfig.title} Win
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
            transition={{ delay: 0.15 }}
          >
            <label className="journey-modal-label">What did you achieve?</label>
            <textarea
              className="journey-modal-textarea"
              value={winEntry}
              onChange={(e) => setWinEntry(e.target.value)}
              placeholder={`Describe your ${selectedConfig.title.toLowerCase()} win…`}
              autoFocus
            />

            <div className="journey-modal-buttons">
              <motion.button
                className="journey-cancel-button"
                onClick={() => setIsModalOpen(false)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="journey-save-button"
                onClick={handleAddWin}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaSave />
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
