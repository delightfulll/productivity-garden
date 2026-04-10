import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaSave, FaTimes, FaLayerGroup } from "react-icons/fa";
import Modal from "react-modal";
import { backlogApi, type BacklogTask } from "../lib/api";
import { useConfirmDeletion } from "../context/ConfirmContext";

function Backlog() {
  const { confirmDeletion } = useConfirmDeletion();
  const [tasks, setTasks] = useState<BacklogTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    backlogApi.list()
      .then(setTasks)
      .catch((err) => console.error("Failed to load backlog:", err));
  }, []);

  const handleAddTask = async () => {
    if (!newText.trim()) return;
    try {
      const created = await backlogApi.create({ text: newText.trim(), note: newNote.trim() });
      setTasks([...tasks, created]);
    } catch (err) {
      console.error("Failed to add backlog task:", err);
    }
    setNewText("");
    setNewNote("");
    setIsModalOpen(false);
  };

  const deleteTask = async (id: number) => {
    if (!(await confirmDeletion("Delete this backlog task?"))) return;
    setTasks(tasks.filter((t) => t.id !== id));
    try {
      await backlogApi.delete(id);
    } catch (err) {
      console.error("Failed to delete backlog task:", err);
    }
  };

  return (
    <div>
      <h2 className="content-title">Backlog</h2>
      <p className="content-text">Tasks waiting to be planted</p>

      <div className="task-box">
        <AnimatePresence>
          {tasks.length === 0 && (
            <div className="backlog-empty">
              <FaLayerGroup className="backlog-empty-icon" />
              <p>Your backlog is clear. Add tasks that are on your radar but not yet active.</p>
            </div>
          )}
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              className="backlog-item"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              layout
            >
              <div className="backlog-item-content">
                <span className="backlog-item-number">{index + 1}</span>
                <div className="backlog-item-details">
                  <span className="backlog-item-text">{task.text}</span>
                  {task.note && (
                    <span className="backlog-item-note">{task.note}</span>
                  )}
                </div>
                <span className="backlog-item-date">
                  {new Date(task.created_at).toLocaleDateString()}
                </span>
              </div>
              <motion.button
                className="backlog-delete-btn"
                onClick={() => deleteTask(task.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes />
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>

        <div
          className="add-task-card"
          onClick={() => setIsModalOpen(true)}
        >
          <FaPlus className="add-task-plus" />
          <span className="add-task-input">Add to backlog...</span>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        className="task-modal-content"
        overlayClassName="task-modal"
        contentLabel="Add to Backlog"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="task-modal-title">Add to Backlog</h3>
            <motion.button
              className="modal-close-button"
              onClick={() => setIsModalOpen(false)}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>
          <input
            type="text"
            className="task-input"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Task description..."
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
          />
          <textarea
            className="goal-textarea"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Notes (optional)..."
            rows={3}
          />
          <div className="task-modal-buttons">
            <motion.button
              className="task-cancel-button"
              onClick={() => setIsModalOpen(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              className="task-save-button"
              onClick={handleAddTask}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaSave className="button-icon" />
              Add to Backlog
            </motion.button>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Backlog;
