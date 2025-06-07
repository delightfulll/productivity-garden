import React, { useState } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTimes, FaSave } from "react-icons/fa";
import Modal from "react-modal";

type WinCategory = "physical" | "mental" | "spiritual";

interface Win {
  id: number;
  content: string;
  date: string;
}

interface Wins {
  physical: Win[];
  mental: Win[];
  spiritual: Win[];
}

function Wins() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [winEntry, setWinEntry] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<WinCategory>("physical");
  const [wins, setWins] = useState<Wins>({
    physical: [
      {
        id: 1,
        content: "Completed a 5K run in under 25 minutes",
        date: "2024-03-20",
      },
    ],
    mental: [
      {
        id: 1,
        content: "Finished reading a challenging book",
        date: "2024-03-20",
      },
    ],
    spiritual: [
      { id: 1, content: "Meditated for 20 minutes", date: "2024-03-20" },
    ],
  });

  const handleAddWin = () => {
    if (winEntry.trim()) {
      const newWin: Win = {
        id: wins[selectedCategory].length + 1,
        content: winEntry,
        date: new Date().toISOString().split("T")[0],
      };

      setWins({
        ...wins,
        [selectedCategory]: [...wins[selectedCategory], newWin],
      });
      setWinEntry("");
      setIsModalOpen(false);
    }
  };

  const renderWinSection = (category: WinCategory, title: string) => (
    <div className="win-section">
      <h3 className="win-section-title">{title}</h3>
      <AnimatePresence>
        {wins[category].map((win: Win, index: number) => (
          <motion.div
            key={win.id}
            className="win-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex flex-col">
              <span className="win-card-text">{win.content}</span>
              <span className="journal-entry-date">{win.date}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <motion.div
        className="add-win-card"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setSelectedCategory(category);
          setIsModalOpen(true);
        }}
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

      {/* React Modal */}
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
              New{" "}
              {selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)}{" "}
              Win
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
