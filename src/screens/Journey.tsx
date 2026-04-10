import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTimes,
  FaSave,
  FaTrash,
  FaCheck,
  FaChevronDown,
  FaCalendarAlt,
} from "react-icons/fa";
import Modal from "react-modal";
import { milestonesApi, type Milestone } from "../lib/api";
import { useConfirmDeletion } from "../context/ConfirmContext";

// ── Types ─────────────────────────────────────────────────────

type Horizon = "long" | "mid" | "short";

interface HorizonConfig {
  key: Horizon;
  icon: string;
  title: string;
  subtitle: string;
  badgeClass: string;
  emptyIcon: string;
  emptyText: string;
}

const HORIZONS: HorizonConfig[] = [
  {
    key: "long",
    icon: "🌳",
    title: "Long Term",
    subtitle: "1 year and beyond",
    badgeClass: "journey-badge-long",
    emptyIcon: "🌱",
    emptyText: "Plant the seeds of your biggest dreams.",
  },
  {
    key: "mid",
    icon: "🌿",
    title: "Mid Term",
    subtitle: "1 – 12 months",
    badgeClass: "journey-badge-mid",
    emptyIcon: "🪴",
    emptyText: "Set milestones that bridge today and tomorrow.",
  },
  {
    key: "short",
    icon: "🌱",
    title: "Short Term",
    subtitle: "Within the next month",
    badgeClass: "journey-badge-short",
    emptyIcon: "🌾",
    emptyText: "What will you accomplish this month?",
  },
];

// ── Sub-component: single milestone card ─────────────────────

interface MilestoneCardProps {
  milestone: Milestone;
  onAchieve: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
  onClick: (m: Milestone) => void;
}

const MilestoneCard = ({ milestone, onAchieve, onDelete, onClick }: MilestoneCardProps) => (
  <motion.div
    layout
    className={`journey-milestone-card ${milestone.achieved ? "journey-milestone-card-achieved" : ""}`}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{ duration: 0.2 }}
  >
    {/* Achieve toggle */}
    <motion.button
      className={`journey-achieve-btn ${milestone.achieved ? "journey-achieve-btn-done" : ""}`}
      onClick={() => onAchieve(milestone.id, milestone.achieved)}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      title={milestone.achieved ? "Mark as pending" : "Mark as achieved"}
    >
      <FaCheck />
    </motion.button>

    {/* Body — click to edit */}
    <div className="journey-milestone-body" style={{ cursor: "pointer" }} onClick={() => onClick(milestone)}>
      <p className={`journey-milestone-title ${milestone.achieved ? "journey-milestone-title-achieved" : ""}`}>
        {milestone.title}
      </p>
      {milestone.description && (
        <p className="journey-milestone-desc">{milestone.description}</p>
      )}
      {milestone.target_date && (
        <p className="journey-milestone-date">
          <FaCalendarAlt style={{ fontSize: "0.7rem" }} />
          {milestone.target_date}
        </p>
      )}
    </div>

    {/* Delete */}
    <motion.button
      className="journey-delete-btn"
      onClick={() => onDelete(milestone.id)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      title="Delete milestone"
    >
      <FaTrash />
    </motion.button>
  </motion.div>
);

// ── Sub-component: collapsible horizon section ────────────────

interface HorizonSectionProps {
  config: HorizonConfig;
  milestones: Milestone[];
  onAdd: (horizon: Horizon) => void;
  onAchieve: (id: number, current: boolean) => void;
  onDelete: (id: number) => void;
  onEdit: (m: Milestone) => void;
}

const HorizonSection = ({
  config,
  milestones,
  onAdd,
  onAchieve,
  onDelete,
  onEdit,
}: HorizonSectionProps) => {
  const [open, setOpen] = useState(true);
  const achieved = milestones.filter((m) => m.achieved).length;
  const total = milestones.length;

  return (
    <motion.div
      className="journey-section"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div
        className={`journey-section-header ${open ? "journey-section-header-open" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="journey-section-icon">{config.icon}</span>
        <div className="journey-section-label">
          <p className="journey-section-title">{config.title}</p>
          <p className="journey-section-subtitle">{config.subtitle}</p>
        </div>

        {/* Badge: achieved / total */}
        <span className={`journey-badge ${config.badgeClass}`}>
          {achieved}/{total}
        </span>

        <motion.span
          className={`journey-chevron ${open ? "journey-chevron-open" : ""}`}
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
        >
          <FaChevronDown />
        </motion.span>
      </div>

      {/* Body — animated collapse */}
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
            <div className="journey-section-body">
              <AnimatePresence mode="popLayout">
                {milestones.length === 0 ? (
                  <motion.div
                    key="empty"
                    className="journey-empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <span className="journey-empty-icon">{config.emptyIcon}</span>
                    <p>{config.emptyText}</p>
                  </motion.div>
                ) : (
                  milestones.map((m) => (
                    <MilestoneCard
                      key={m.id}
                      milestone={m}
                      onAchieve={onAchieve}
                      onDelete={onDelete}
                      onClick={onEdit}
                    />
                  ))
                )}
              </AnimatePresence>

              {/* Add card */}
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
                <span className="journey-add-text">Add a {config.title.toLowerCase()} milestone…</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Main component ────────────────────────────────────────────

function Journey() {
  const { confirmDeletion } = useConfirmDeletion();
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeHorizon, setActiveHorizon] = useState<Horizon>("short");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDate, setFormDate] = useState("");

  useEffect(() => {
    milestonesApi
      .list()
      .then(setMilestones)
      .catch((err) => console.error("Failed to load milestones:", err));
  }, []);

  const milestonesFor = (horizon: Horizon) =>
    milestones.filter((m) => m.horizon === horizon);

  // ── Open modal ────────────────────────────────────────────

  const openAdd = (horizon: Horizon) => {
    setEditingId(null);
    setActiveHorizon(horizon);
    setFormTitle("");
    setFormDesc("");
    setFormDate("");
    setIsModalOpen(true);
  };

  const openEdit = (m: Milestone) => {
    setEditingId(m.id);
    setActiveHorizon(m.horizon);
    setFormTitle(m.title);
    setFormDesc(m.description);
    setFormDate(m.target_date);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormTitle("");
    setFormDesc("");
    setFormDate("");
  };

  // ── Save ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!formTitle.trim()) return;

    try {
      if (editingId !== null) {
        const updated = await milestonesApi.update(editingId, {
          title: formTitle.trim(),
          description: formDesc.trim(),
          target_date: formDate.trim(),
        });
        setMilestones((prev) => prev.map((m) => (m.id === editingId ? updated : m)));
      } else {
        const created = await milestonesApi.create({
          title: formTitle.trim(),
          horizon: activeHorizon,
          description: formDesc.trim(),
          target_date: formDate.trim(),
        });
        setMilestones((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Failed to save milestone:", err);
    }

    closeModal();
  };

  // ── Achieve toggle ────────────────────────────────────────

  const handleAchieve = async (id: number, current: boolean) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, achieved: !current } : m))
    );
    try {
      await milestonesApi.update(id, { achieved: !current });
    } catch (err) {
      console.error("Failed to update milestone:", err);
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, achieved: current } : m))
      );
    }
  };

  // ── Delete ────────────────────────────────────────────────

  const handleDelete = async (id: number) => {
    if (!(await confirmDeletion("Delete this milestone?"))) return;
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    try {
      await milestonesApi.delete(id);
    } catch (err) {
      console.error("Failed to delete milestone:", err);
    }
  };

  // ── Modal label ───────────────────────────────────────────

  const horizonLabel = HORIZONS.find((h) => h.key === activeHorizon)?.title ?? "";

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">

          {/* Header */}
          <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.75rem" }}>
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Your Journey
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Plant seeds today — watch them grow into milestones.
              </motion.p>
            </div>
          </div>

          {/* Three horizon sections */}
          {HORIZONS.map((config, i) => (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <HorizonSection
                config={config}
                milestones={milestonesFor(config.key)}
                onAdd={openAdd}
                onAchieve={handleAchieve}
                onDelete={handleDelete}
                onEdit={openEdit}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="journey-modal-content"
        overlayClassName="journey-modal"
        contentLabel="Milestone"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {/* Modal header */}
          <div className="modal-header">
            <h3 className="journey-modal-title">
              {editingId !== null ? "Edit Milestone" : `New ${horizonLabel} Milestone`}
            </h3>
            <motion.button
              className="modal-close-button"
              onClick={closeModal}
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
            <label className="journey-modal-label">Title</label>
            <input
              className="journey-modal-input"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />

            <label className="journey-modal-label">Description (optional)</label>
            <textarea
              className="journey-modal-textarea"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Add some context or motivation…"
            />

            <label className="journey-modal-label">Target Date (optional)</label>
            <input
              className="journey-modal-input"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              placeholder="e.g. Dec 2025 or Q3 2026"
            />

            <div className="journey-modal-buttons">
              <motion.button
                className="journey-cancel-button"
                onClick={closeModal}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="journey-save-button"
                onClick={handleSave}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaSave />
                {editingId !== null ? "Save Changes" : "Add Milestone"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Journey;
