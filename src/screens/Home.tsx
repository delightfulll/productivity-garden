import React, { useState, useRef, useEffect } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { tasksApi, type Task } from "../lib/api";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { FaPlus, FaGripVertical, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import "../styles/index.css";
import CustomCalendar from "../components/calendar";
import Modal from "react-modal";
import Goals from "./Goals";
import Backlog from "./Backlog";
import GoalFocus from "../components/GoalFocus";

type ActiveTab = "tasks" | "goals" | "backlog";

interface TaskItemProps {
  task: any;
  category: string;
  onComplete: (taskId: number, category: string) => void;
  onDelete: (taskId: number, category: string) => void;
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const TaskItem = ({ task, category, onComplete, onDelete, taskRefs }: TaskItemProps) => (
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
      onChange={() => onComplete(task.id, category)}
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
);

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

  const handleTaskComplete = (taskId: number, category: string) => {
    const taskElement = taskRefs.current[taskId];
    if (!taskElement) return;

    const rect = taskElement.getBoundingClientRect();

    const updateTasks = (tasks: Task[]) =>
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      );

    let currentCompleted = false;
    switch (category) {
      case "watering":
        currentCompleted = wateringTasks.find((t) => t.id === taskId)?.completed ?? false;
        setWateringTasks(updateTasks(wateringTasks));
        break;
      case "sunlight":
        currentCompleted = sunlightTasks.find((t) => t.id === taskId)?.completed ?? false;
        setSunlightTasks(updateTasks(sunlightTasks));
        break;
      case "composting":
        currentCompleted = compostingTasks.find((t) => t.id === taskId)?.completed ?? false;
        setCompostingTasks(updateTasks(compostingTasks));
        break;
    }

    // Sync to API
    tasksApi.update(taskId, { completed: !currentCompleted }).catch((err) =>
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
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "watering" | "sunlight" | "composting" | null
  >(null);

  const handleAddTask = async () => {
    if (!newTaskText.trim() || !activeCategory) return;

    try {
      const created = await tasksApi.create({
        text: newTaskText.trim(),
        date: newTaskDate || "No date",
        category: activeCategory,
      });

      switch (activeCategory) {
        case "watering":  setWateringTasks([...wateringTasks, created]); break;
        case "sunlight":  setSunlightTasks([...sunlightTasks, created]); break;
        case "composting": setCompostingTasks([...compostingTasks, created]); break;
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }

    setNewTaskText("");
    setNewTaskDate("");
    setIsModalOpen(false);
    setActiveCategory(null);
  };

  const handleDeleteTask = async (taskId: number, category: string) => {
    // Optimistic removal
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
  };

  const openAddTaskModal = (
    category: "watering" | "sunlight" | "composting",
  ) => {
    setActiveCategory(category);
    setIsModalOpen(true);
  };

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
              <h2 className="content-title">Watering Tasks</h2>
              <p className="content-text">These tasks move the needle</p>
              <Reorder.Group
                axis="y"
                values={wateringTasks}
                onReorder={setWateringTasks}
                className="task-box"
                layoutScroll
              >
                <AnimatePresence mode="popLayout">
                  {wateringTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                      transition={{ duration: 0.2 }}
                    >
                        <TaskItem
                          task={task}
                          category="watering"
                          onComplete={handleTaskComplete}
                          onDelete={handleDeleteTask}
                          taskRefs={taskRefs}
                        />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("watering")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">Add a new watering task...</span>
                </motion.div>
              </Reorder.Group>

              <h2 className="content-title" style={{ marginTop: "1.5rem" }}>Sunlight Tasks</h2>
              <p className="content-text">These tasks keep your goal alive</p>
              <Reorder.Group
                axis="y"
                values={sunlightTasks}
                onReorder={setSunlightTasks}
                className="task-box"
              >
                <AnimatePresence>
                  {sunlightTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                        <TaskItem
                          task={task}
                          category="sunlight"
                          onComplete={handleTaskComplete}
                          onDelete={handleDeleteTask}
                          taskRefs={taskRefs}
                        />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("sunlight")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">Add a new sunlight task...</span>
                </motion.div>
              </Reorder.Group>

              <h2 className="content-title" style={{ marginTop: "1.5rem" }}>Composting</h2>
              <p className="content-text">These tasks are extraneous things not necessarily important</p>
              <Reorder.Group
                axis="y"
                values={compostingTasks}
                onReorder={setCompostingTasks}
                className="task-box"
              >
                <AnimatePresence>
                  {compostingTasks.map((task) => (
                    <Reorder.Item
                      key={task.id}
                      value={task}
                      whileDrag={{
                        scale: 1.03,
                        boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
                      }}
                    >
                        <TaskItem
                          task={task}
                          category="composting"
                          onComplete={handleTaskComplete}
                          onDelete={handleDeleteTask}
                          taskRefs={taskRefs}
                        />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
                <motion.div
                  className="add-task-card"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openAddTaskModal("composting")}
                >
                  <FaPlus className="add-task-plus" />
                  <span className="add-task-input">
                    Add a new composting task...
                  </span>
                </motion.div>
              </Reorder.Group>
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
