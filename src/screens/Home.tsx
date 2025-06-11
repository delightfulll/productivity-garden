import React, { useState, useRef, useEffect } from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { FaPlus, FaGripVertical } from "react-icons/fa";
import "../index.css";
import CustomCalendar from "../components/calendar";
import CelebrationParticles from "../components/CelebrationParticles";
function Home() {
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

  const [wateringTasks, setWateringTasks] = useState([
    {
      id: 1,
      text: "Complete project proposal",
      date: "Due Today",
      completed: false,
    },
    {
      id: 2,
      text: "Review pull requests",
      date: "Due Tomorrow",
      completed: false,
    },
    {
      id: 3,
      text: "Update documentation",
      date: "Due in 2 days",
      completed: false,
    },
  ]);

  const [sunlightTasks, setSunlightTasks] = useState([
    { id: 1, text: "Morning meditation", date: "Daily", completed: false },
    { id: 2, text: "Read for 30 minutes", date: "Daily", completed: false },
    { id: 3, text: "Evening reflection", date: "Daily", completed: false },
  ]);

  const [compostingTasks, setCompostingTasks] = useState([
    {
      id: 1,
      text: "Clean email inbox",
      date: "When possible",
      completed: false,
    },
    { id: 2, text: "Organize desk", date: "When possible", completed: false },
    { id: 3, text: "Update software", date: "When possible", completed: false },
  ]);

  const handleTaskComplete = (taskId: number, category: string) => {
    // Get the position of the completed task before updating state
    const taskElement = taskRefs.current[taskId];
    if (taskElement) {
      const rect = taskElement.getBoundingClientRect();

      // Batch state updates
      const updateTasks = (tasks: any[]) =>
        tasks.map((task: any) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );

      // Update all states at once
      switch (category) {
        case "watering":
          setWateringTasks(updateTasks(wateringTasks));
          break;
        case "sunlight":
          setSunlightTasks(updateTasks(sunlightTasks));
          break;
        case "composting":
          setCompostingTasks(updateTasks(compostingTasks));
          break;
      }

      // Set confetti position and trigger after task update
      requestAnimationFrame(() => {
        setConfettiPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2 - 80,
        });
        setShowConfetti(true);

        // Clear the confetti after animation
        setTimeout(() => {
          setShowConfetti(false);
        }, 2000);
      });
    }
  };

  const TaskItem = ({ task, category }: { task: any; category: string }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`task-item ${task.completed ? "task-completed" : ""}`}
      ref={(el) => {
        if (el) {
          taskRefs.current[task.id] = el;
        }
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
        onChange={() => handleTaskComplete(task.id, category)}
        whileTap={{ scale: 0.9 }}
      />
      <span className={`task-text ${task.completed ? "completed" : ""}`}>
        {task.text}
      </span>
      <span className="task-date">{task.date}</span>
    </motion.div>
  );

  return (
    <div className="app-container">
      <CelebrationParticles
        trigger={showConfetti}
        position={confettiPosition}
      />
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

          {/* Rest of the content */}
          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Watering Tasks
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            These tasks move the needle
          </motion.p>
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
                  <TaskItem task={task} category="watering" />
                </Reorder.Item>
              ))}
            </AnimatePresence>
            <motion.div
              className="add-task-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="add-task-plus" />
              <span className="add-task-input">Add a new watering task...</span>
            </motion.div>
          </Reorder.Group>

          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Sunlight Tasks
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            These tasks keep your goal alive
          </motion.p>
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
                  <TaskItem task={task} category="sunlight" />
                </Reorder.Item>
              ))}
            </AnimatePresence>
            <motion.div
              className="add-task-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="add-task-plus" />
              <span className="add-task-input">Add a new sunlight task...</span>
            </motion.div>
          </Reorder.Group>

          <motion.h2
            className="content-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            Composting
          </motion.h2>
          <motion.p
            className="content-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            These tasks are extraneous things not necessarily important
          </motion.p>
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
                  <TaskItem task={task} category="composting" />
                </Reorder.Item>
              ))}
            </AnimatePresence>
            <motion.div
              className="add-task-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaPlus className="add-task-plus" />
              <span className="add-task-input">
                Add a new composting task...
              </span>
            </motion.div>
          </Reorder.Group>
        </div>
      </div>
      <div className="calendar-container">
        <CustomCalendar />
      </div>
    </div>
  );
}

export default Home;
