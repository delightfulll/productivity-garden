import React, { useState, useRef, useEffect, useCallback } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { tasksApi, type Task } from "../lib/api";
import { motion, Reorder, AnimatePresence, LayoutGroup } from "framer-motion";
import { FaPlus, FaGripVertical, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import "../styles/index.css";
import CustomCalendar from "../components/calendar";
import Modal from "react-modal";
import Goals from "./Goals";
import Backlog from "./Backlog";
import GoalFocus from "../components/GoalFocus";

type ActiveTab = "tasks" | "goals" | "backlog";

interface TaskItemProps {
  task: Task;
  category: string;
  onComplete: (taskId: number, category: string, currentCompleted: boolean) => void;
  onDelete: (taskId: number, category: string) => void;
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const TaskItem = React.memo(({ task, category, onComplete, onDelete, taskRefs }: TaskItemProps) => (
  <motion.div
    className={`task-item ${task.completed ? "task-completed" : ""}`}
    ref={(el) => {
      if (el) taskRefs.current[task.id] = el;
    }}
  >
    <motion.div
      className="drag-handle"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <FaGripVertical />
    </motion.div>
    <motion.input
      type="checkbox"
      className="task-checkbox"
      checked={task.completed}
      onChange={() => onComplete(task.id, category, task.completed)}
      whileTap={{ scale: 0.9 }}
    />
    <span className={`task-text ${task.completed ? "completed" : ""}`}>
      {task.text}
    </span>
    <span className="task-date">{task.date}</span>
    <motion.button
      className="task-delete-btn"
      onClick={() => onDelete(task.id, category)}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      title="Delete task"
    >
      <FaTrash />
    </motion.button>
  </motion.div>
));

interface TaskSectionProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  category: "watering" | "sunlight" | "composting";
  onReorder: React.Dispatch<React.SetStateAction<Task[]>>;
  onComplete: (taskId: number, category: string, currentCompleted: boolean) => void;
  onDelete: (taskId: number, category: string) => void;
  onAddClick: (category: "watering" | "sunlight" | "composting") => void;
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const TaskSection = React.memo(({
  title, subtitle, tasks, category,
  onReorder, onComplete, onDelete, onAddClick, taskRefs,
}: TaskSectionProps) => (
  <>
    <h2 className="content-title" style={category !== "watering" ? { marginTop: "1.5rem" } : undefined}>{title}</h2>
    <p className="content-text">{subtitle}</p>
    <LayoutGroup id={category}>
    <Reorder.Group
      axis="y"
      values={tasks}
      onReorder={onReorder}
      className="task-box"
      layoutScroll
    >
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <Reorder.Item
            key={task.id}
            value={task}
            whileDrag={{ scale: 1.03, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <TaskItem
              task={task}
              category={category}
              onComplete={onComplete}
              onDelete={onDelete}
              taskRefs={taskRefs}
            />
          </Reorder.Item>
        ))}
      </AnimatePresence>
      <motion.div
        className="add-task-card"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onAddClick(category)}
      >
        <FaPlus className="add-task-plus" />
        <span className="add-task-input">Add a new {category} task...</span>
      </motion.div>
    </Reorder.Group>
    </LayoutGroup>
  </>
));

function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPosition, setConfettiPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [completedTaskId, setCompletedTaskId] = useState<number | null>(null);
  const taskRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [wateringTasks, setWateringTasks] = useState<Task[]>([]);
  const [sunlightTasks, setSunlightTasks] = useState<Task[]>([]);
  const [compostingTasks, setCompostingTasks] = useState<Task[]>([]);

  // Load tasks from API on mount
  useEffect(() => {
    tasksApi.list().then((all) => {
      setWateringTasks(all.filter((t) => t.category === "watering"));
      setSunlightTasks(all.filter((t) => t.category === "sunlight"));
      setCompostingTasks(all.filter((t) => t.category === "composting"));
    }).catch((err) => console.error("Failed to load tasks:", err));
  }, []);

  const handleTaskComplete = useCallback((taskId: number, category: string, currentCompleted: boolean) => {
    const taskElement = taskRefs.current[taskId];
    if (!taskElement) return;

    const rect = taskElement.getBoundingClientRect();
    const newCompleted = !currentCompleted;

    const updateTasks = (tasks: Task[]) =>
      tasks.map((task) => task.id === taskId ? { ...task, completed: newCompleted } : task);

    switch (category) {
      case "watering":   setWateringTasks(updateTasks); break;
      case "sunlight":   setSunlightTasks(updateTasks); break;
      case "composting": setCompostingTasks(updateTasks); break;
    }

    tasksApi.update(taskId, { completed: newCompleted }).catch((err) =>
      console.error("Failed to update task:", err)
    );

    requestAnimationFrame(() => {
      setConfettiPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2 - 80,
      });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    });
  }, [taskRefs]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "watering" | "sunlight" | "composting" | null
  >(null);

  const handleAddTask = useCallback(async () => {
    if (!newTaskText.trim() || !activeCategory) return;

    try {
      const created = await tasksApi.create({
        text: newTaskText.trim(),
        date: newTaskDate || "No date",
        category: activeCategory,
      });

      switch (activeCategory) {
        case "watering":   setWateringTasks((t) => [...t, created]); break;
        case "sunlight":   setSunlightTasks((t) => [...t, created]); break;
        case "composting": setCompostingTasks((t) => [...t, created]); break;
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }

    setNewTaskText("");
    setNewTaskDate("");
    setIsModalOpen(false);
    setActiveCategory(null);
  }, [newTaskText, newTaskDate, activeCategory]);

  const handleDeleteTask = useCallback(async (taskId: number, category: string) => {
    switch (category) {
      case "watering":   setWateringTasks((t) => t.filter((x) => x.id !== taskId)); break;
      case "sunlight":   setSunlightTasks((t) => t.filter((x) => x.id !== taskId)); break;
      case "composting": setCompostingTasks((t) => t.filter((x) => x.id !== taskId)); break;
    }
    try {
      await tasksApi.delete(taskId);
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  }, []);

  const openAddTaskModal = useCallback((
    category: "watering" | "sunlight" | "composting",
  ) => {
    setActiveCategory(category);
    setIsModalOpen(true);
  }, []);

  return (
    <div className="app-container">
      <AnimatePresence>
        {
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              zIndex: 1000,
            }}
          ></motion.div>
        }
      </AnimatePresence>
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-container">
          <div className="home-header">
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome Back, Vinay
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Let the flowers blossom today!
              </motion.p>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {new Date().toLocaleDateString()}
              </motion.p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="home-tabs">
            {(["tasks", "goals", "backlog"] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                className={`home-tab-btn ${activeTab === tab ? "home-tab-active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "tasks" && (
            <div>
              <TaskSection
                title="Watering Tasks"
                subtitle="These tasks move the needle"
                tasks={wateringTasks}
                category="watering"
                onReorder={setWateringTasks}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
              <TaskSection
                title="Sunlight Tasks"
                subtitle="These tasks keep your goal alive"
                tasks={sunlightTasks}
                category="sunlight"
                onReorder={setSunlightTasks}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
              <TaskSection
                title="Composting"
                subtitle="These tasks are extraneous things not necessarily important"
                tasks={compostingTasks}
                category="composting"
                onReorder={setCompostingTasks}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
            </div>
          )}

          {activeTab === "goals" && <Goals />}

          {activeTab === "backlog" && <Backlog />}
        </div>
      </div>
      <div className="calendar-container">
        <CustomCalendar />
        <GoalFocus />
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setActiveCategory(null);
        }}
        className="task-modal-content"
        overlayClassName="task-modal"
        contentLabel="Add New Task"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="modal-header">
            <h3 className="task-modal-title">
              Add New{" "}
              {activeCategory
                ? activeCategory.charAt(0).toUpperCase() +
                  activeCategory.slice(1)
                : ""}{" "}
              Task
            </h3>
            <motion.button
              className="modal-close-button"
              onClick={() => {
                setIsModalOpen(false);
                setActiveCategory(null);
              }}
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
            <input
              type="text"
              className="task-input"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Enter task description..."
            />
            <input
              type="text"
              className="task-date-input"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              placeholder="Enter due date (optional)"
            />
            <div className="task-modal-buttons">
              <motion.button
                className="task-cancel-button"
                onClick={() => {
                  setIsModalOpen(false);
                  setActiveCategory(null);
                }}
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
