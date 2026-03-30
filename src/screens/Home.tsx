import React, { useState, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaGripVertical,
  FaSave,
  FaTimes,
  FaTint,
  FaSun,
  FaLeaf,
  FaFire,
  FaCheck,
} from "react-icons/fa";
import "../styles/index.css";
import CustomCalendar from "../components/calendar";
import Modal from "react-modal";
import Focus from "../components/focus";

/* ── Task item ──────────────────────────────────────────── */
const TaskItem = ({
  task,
  category,
  onComplete,
}: {
  task: any;
  category: string;
  onComplete: (id: number, category: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, x: -10 }}
    transition={{ duration: 0.2 }}
    className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all duration-300 cursor-move group ${
      task.completed
        ? "bg-green-50 border-green-200"
        : "bg-white border-gray-100 hover:border-green-300 hover:shadow-sm"
    }`}
  >
    <motion.div
      className="text-gray-300 group-hover:text-green-400 transition-colors cursor-move flex-shrink-0"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaGripVertical style={{ fontSize: "13px" }} />
    </motion.div>

    <button
      onClick={() => onComplete(task.id, category)}
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
        task.completed
          ? "bg-green-500 border-green-500"
          : "border-gray-300 hover:border-green-400 bg-white"
      }`}
    >
      {task.completed && <FaCheck className="text-white" style={{ fontSize: "8px" }} />}
    </button>

    <span
      className={`flex-1 text-sm transition-all duration-300 ${
        task.completed ? "text-gray-400 line-through" : "text-gray-700"
      }`}
    >
      {task.text}
    </span>
    <span
      className={`text-xs px-2.5 py-1 rounded-full flex-shrink-0 ${
        task.completed
          ? "bg-green-100 text-green-600"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {task.date}
    </span>
  </motion.div>
);

/* ── Task section card ──────────────────────────────────── */
const TaskSection = ({
  icon,
  title,
  subtitle,
  gradient,
  iconBg,
  tasks,
  category,
  onComplete,
  onAdd,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  iconBg: string;
  tasks: any[];
  category: "watering" | "sunlight" | "composting";
  onComplete: (id: number, cat: string) => void;
  onAdd: (cat: "watering" | "sunlight" | "composting") => void;
  delay?: number;
}) => {
  const done = tasks.filter((t) => t.completed).length;
  return (
    <motion.div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
    >
      {/* Header */}
      <div className={`px-7 py-6 flex items-center justify-between ${gradient} border-b border-gray-100`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconBg}`}>
            <span className="text-base">{icon}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-base leading-tight">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-gray-400 bg-white/70 px-3 py-1 rounded-full border border-gray-100">
          {done}/{tasks.length} done
        </span>
      </div>

      {/* Tasks */}
      <div className="px-6 pt-5 pb-5 space-y-3">
        <Reorder.Group axis="y" values={tasks} onReorder={() => {}} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                whileDrag={{ scale: 1.02, boxShadow: "0px 6px 18px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.2 }}
              >
                <TaskItem task={task} category={category} onComplete={onComplete} />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {/* Add task row */}
        <motion.button
          onClick={() => onAdd(category)}
          className="w-full flex items-center gap-2.5 px-5 py-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 hover:bg-green-50/50 transition-all duration-200 text-sm text-gray-400 hover:text-green-600 group mt-1"
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaPlus className="text-gray-300 group-hover:text-green-500 transition-colors" style={{ fontSize: "11px" }} />
          Add a task…
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ══════════════════════════════════════════════════════════
   Main screen
══════════════════════════════════════════════════════════ */
function Home() {
  const [wateringTasks, setWateringTasks] = useState([
    { id: 1, text: "Complete project proposal", date: "Due Today", completed: false },
    { id: 2, text: "Review pull requests", date: "Due Tomorrow", completed: false },
    { id: 3, text: "Update documentation", date: "Due in 2 days", completed: false },
  ]);

  const [sunlightTasks, setSunlightTasks] = useState([
    { id: 1, text: "Morning meditation", date: "Daily", completed: false },
    { id: 2, text: "Read for 30 minutes", date: "Daily", completed: false },
    { id: 3, text: "Evening reflection", date: "Daily", completed: false },
  ]);

  const [compostingTasks, setCompostingTasks] = useState([
    { id: 1, text: "Clean email inbox", date: "When possible", completed: false },
    { id: 2, text: "Organize desk", date: "When possible", completed: false },
    { id: 3, text: "Update software", date: "When possible", completed: false },
  ]);

  useEffect(() => {
    try {
      const sw = localStorage.getItem("wateringTasks");
      const ss = localStorage.getItem("sunlightTasks");
      const sc = localStorage.getItem("compostingTasks");
      if (sw) setWateringTasks(JSON.parse(sw));
      if (ss) setSunlightTasks(JSON.parse(ss));
      if (sc) setCompostingTasks(JSON.parse(sc));
    } catch (e) {
      console.error("Error loading tasks:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wateringTasks", JSON.stringify(wateringTasks));
      localStorage.setItem("sunlightTasks", JSON.stringify(sunlightTasks));
      localStorage.setItem("compostingTasks", JSON.stringify(compostingTasks));
    } catch (e) {
      console.error("Error saving tasks:", e);
    }
  }, [wateringTasks, sunlightTasks, compostingTasks]);

  const handleTaskComplete = (taskId: number, category: string) => {
    const update = (tasks: any[]) =>
      tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    if (category === "watering") setWateringTasks(update(wateringTasks));
    if (category === "sunlight") setSunlightTasks(update(sunlightTasks));
    if (category === "composting") setCompostingTasks(update(compostingTasks));
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<"watering" | "sunlight" | "composting" | null>(null);

  const openAddTaskModal = (cat: "watering" | "sunlight" | "composting") => {
    setActiveCategory(cat);
    setIsModalOpen(true);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim() || !activeCategory) return;
    const newTask = { id: Date.now(), text: newTaskText.trim(), date: newTaskDate || "No date", completed: false };
    if (activeCategory === "watering") setWateringTasks((p) => [...p, newTask]);
    if (activeCategory === "sunlight") setSunlightTasks((p) => [...p, newTask]);
    if (activeCategory === "composting") setCompostingTasks((p) => [...p, newTask]);
    setNewTaskText("");
    setNewTaskDate("");
    setIsModalOpen(false);
    setActiveCategory(null);
  };

  /* Progress calculation */
  const allTasks = [...wateringTasks, ...sunlightTasks, ...compostingTasks];
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const progressMessage =
    progressPercent === 100
      ? "Your garden is fully tended today! 🌸"
      : progressPercent >= 66
      ? "Almost there, keep growing!"
      : progressPercent >= 33
      ? "Good momentum, keep going!"
      : "Start tending your garden today.";

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content" style={{ height: "100vh", overflowY: "auto" }}>
        <div className="content-container px-10 pt-10 pb-32">

          {/* ── Hero banner ─────────────────────────────── */}
          <motion.div
            className="relative rounded-2xl overflow-hidden mb-8 shadow-md"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="h-44 w-full relative"
              style={{ background: "linear-gradient(135deg, #16a34a 0%, #4ade80 55%, #86efac 100%)" }}
            >
              <div className="absolute top-4 right-10 w-28 h-28 rounded-full bg-white/10" />
              <div className="absolute top-10 right-28 w-16 h-16 rounded-full bg-white/10" />
              <div className="absolute -top-2 right-48 w-12 h-12 rounded-full bg-white/10" />

              {/* Welcome text inside banner */}
              <div className="absolute inset-0 flex flex-col justify-center px-8">
                <p className="text-white/80 text-sm font-medium">{today}</p>
                <h1 className="text-white text-2xl font-bold mt-1">Welcome back, Vinay 👋</h1>
                <p className="text-white/70 text-sm mt-1">Let the flowers blossom today!</p>
              </div>

              {/* Streak badge */}
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-5 py-3">
                <FaFire className="text-orange-300 text-xl" />
                <div>
                  <p className="text-white text-2xl font-bold leading-none">12</p>
                  <p className="text-white/70 text-xs leading-none mt-0.5">day streak</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Daily progress card ──────────────────────── */}
          <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🌱</span>
                <div>
                  <p className="text-base font-semibold text-gray-800">Today's Growth</p>
                  <p className="text-xs text-gray-400 mt-0.5">{progressMessage}</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                {completedTasks} / {totalTasks} tasks
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #16a34a, #4ade80)" }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
              />
            </div>

            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-400">{progressPercent}% complete</p>
              <p className="text-xs text-gray-400">{totalTasks - completedTasks} remaining</p>
            </div>
          </motion.div>

          {/* ── Task sections ────────────────────────────── */}
          <div className="flex flex-col gap-6">
            <TaskSection
              icon={<FaTint className="text-blue-500" />}
              title="Watering Tasks"
              subtitle="High-impact work that moves the needle"
              gradient="bg-gradient-to-r from-blue-50 to-white"
              iconBg="bg-blue-100"
              tasks={wateringTasks}
              category="watering"
              onComplete={handleTaskComplete}
              onAdd={openAddTaskModal}
              delay={0.18}
            />

            <TaskSection
              icon={<FaSun className="text-yellow-500" />}
              title="Sunlight Tasks"
              subtitle="Habits that keep your goals alive"
              gradient="bg-gradient-to-r from-yellow-50 to-white"
              iconBg="bg-yellow-100"
              tasks={sunlightTasks}
              category="sunlight"
              onComplete={handleTaskComplete}
              onAdd={openAddTaskModal}
              delay={0.26}
            />

            <TaskSection
              icon={<FaLeaf className="text-green-600" />}
              title="Composting"
              subtitle="Extras and admin that can wait"
              gradient="bg-gradient-to-r from-green-50 to-white"
              iconBg="bg-green-100"
              tasks={compostingTasks}
              category="composting"
              onComplete={handleTaskComplete}
              onAdd={openAddTaskModal}
              delay={0.34}
            />
          </div>

        </div>
      </div>

      {/* Calendar sidebar */}
      <div className="calendar-container">
        <CustomCalendar />
        <Focus />
      </div>

      {/* Add task modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => { setIsModalOpen(false); setActiveCategory(null); }}
        className="task-modal-content"
        overlayClassName="task-modal"
        contentLabel="Add New Task"
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="modal-header">
            <h3 className="task-modal-title">
              Add{" "}
              {activeCategory ? activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1) : ""}{" "}
              Task
            </h3>
            <motion.button
              className="modal-close-button"
              onClick={() => { setIsModalOpen(false); setActiveCategory(null); }}
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaTimes />
            </motion.button>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <input
              type="text"
              className="task-input"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="Enter task description…"
              autoFocus
            />
            <input
              type="text"
              className="task-date-input"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              placeholder="Due date (optional)"
            />
            <div className="task-modal-buttons">
              <motion.button
                className="task-cancel-button"
                onClick={() => { setIsModalOpen(false); setActiveCategory(null); }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Cancel
              </motion.button>
              <motion.button
                className="task-save-button"
                onClick={handleAddTask}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <FaSave className="button-icon" />
                Add Task
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
}

export default Home;
