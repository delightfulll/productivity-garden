import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { tasksApi, type Task } from "../lib/api";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaGripVertical,
  FaSave,
  FaTimes,
  FaTrash,
  FaEllipsisV,
  FaForward,
} from "react-icons/fa";
import "../styles/index.css";
import CustomCalendar from "../components/calendar";
import Modal from "react-modal";
import XPBar from "../components/XPBar";
import { useStats } from "../context/StatsContext";
import Goals from "./Goals";
import Backlog from "./Backlog";
import GoalFocus from "../components/GoalFocus";
import HabitList from "../components/HabitList";
import { playTaskCompleteSound } from "../lib/taskCompleteSound";
import { useConfirm, useConfirmDeletion } from "../context/ConfirmContext";
import { useDayParam } from "../hooks/useDayParam";
import { taskBelongsOnDay, parseLocalDayKey } from "../lib/dateUtils";
import { useAuth } from "../context/AuthContext";

type ActiveTab = "tasks" | "habits" | "goals" | "backlog";
type TaskCategory = "watering" | "sunlight" | "composting";

interface TaskItemProps {
  task: Task;
  category: TaskCategory;
  onComplete: (
    taskId: number,
    category: TaskCategory,
    currentCompleted: boolean,
  ) => void;
  onDelete: (taskId: number, category: TaskCategory) => void;
  onRollOver: (taskId: number, category: TaskCategory) => void;
  taskRefs: React.RefObject<{ [key: number]: HTMLDivElement | null }>;
}

function TaskItem({
  task,
  category,
  onComplete,
  onDelete,
  onRollOver,
  taskRefs,
}: TaskItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  return (
    <motion.div
      className={`task-item ${task.completed ? "task-completed" : ""} ${menuOpen ? "task-item-menu-expanded" : ""}`}
      ref={(el) => {
        if (el) taskRefs.current[task.id] = el;
      }}
    >
      <motion.div
        className="task-complete-fill"
        aria-hidden
        initial={false}
        animate={{ scaleX: task.completed ? 1 : 0 }}
        transition={{
          duration: task.completed ? 0.55 : 0.4,
          ease: task.completed ? [0.22, 1, 0.36, 1] : [0.4, 0, 0.2, 1],
        }}
        style={{ transformOrigin: "left center" }}
      />
      <div className="task-item-content">
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
          onChange={() => {
            if (!task.completed) playTaskCompleteSound();
            onComplete(task.id, category, task.completed);
          }}
          whileTap={{ scale: 0.9 }}
        />
        <span className={`task-text ${task.completed ? "completed" : ""}`}>
          {task.text}
        </span>
        <span className="task-date">{task.date}</span>
        <div
          className={`task-item-menu-wrap ${menuOpen ? "task-item-menu-open" : ""}`}
          ref={menuRef}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="task-item-menu-trigger"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            title="Task actions"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <ul className="task-item-menu" role="menu">
              <li>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onRollOver(task.id, category);
                  }}
                >
                  <FaForward className="task-item-menu-icon" />
                  Roll to next day
                </button>
              </li>
              <li>
                <button
                  type="button"
                  role="menuitem"
                  className="task-item-menu-danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task.id, category);
                  }}
                >
                  <FaTrash className="task-item-menu-icon" />
                  Delete
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TaskSectionProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  category: TaskCategory;
  layoutAnimationCategory: TaskCategory | null;
  onActivateLayout: (category: TaskCategory) => void;
  onReorder: (newOrder: Task[]) => void;
  onComplete: (
    taskId: number,
    category: TaskCategory,
    currentCompleted: boolean,
  ) => void;
  onDelete: (taskId: number, category: TaskCategory) => void;
  onRollOver: (taskId: number, category: TaskCategory) => void;
  onAddClick: (category: TaskCategory) => void;
  taskRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const TaskSection = React.memo(
  ({
    title,
    subtitle,
    tasks,
    category,
    layoutAnimationCategory,
    onActivateLayout,
    onReorder,
    onComplete,
    onDelete,
    onRollOver,
    onAddClick,
    taskRefs,
  }: TaskSectionProps) => {
    const shouldAnimateLayout = layoutAnimationCategory === category;

    return (
      <>
        <div
          className="section-header"
          style={category !== "watering" ? { marginTop: "1.75rem" } : undefined}
        >
          <h2 className={`section-title section-title-${category}`}>{title}</h2>
        </div>
        <p className="section-subtitle">{subtitle}</p>
        <Reorder.Group
          axis="y"
          values={tasks}
          onReorder={onReorder}
          className="task-box"
          onPointerDownCapture={() => onActivateLayout(category)}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {tasks.map((task) => (
              <Reorder.Item
                key={task.id}
                value={task}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout={shouldAnimateLayout ? "position" : undefined}
                whileDrag={{
                  scale: 1.03,
                }}
                transition={{
                  opacity: { duration: 0.18 },
                  scale: { duration: 0.18 },
                  layout: {
                    duration: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  },
                }}
              >
                <TaskItem
                  task={task}
                  category={category}
                  onComplete={onComplete}
                  onDelete={onDelete}
                  onRollOver={onRollOver}
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
      </>
    );
  },
);

function Home() {
  const { user } = useAuth();
  const { refreshStats } = useStats();
  const { confirmDeletion } = useConfirmDeletion();
  const { confirm } = useConfirm();
  const { dayKey, selectedDate, setDayFromDate } = useDayParam();
  const [activeTab, setActiveTab] = useState<ActiveTab>("tasks");
  const [layoutAnimationCategory, setLayoutAnimationCategory] =
    useState<TaskCategory | null>(null);
  const taskRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [wateringTasks, setWateringTasks] = useState<Task[]>([]);
  const [sunlightTasks, setSunlightTasks] = useState<Task[]>([]);
  const [compostingTasks, setCompostingTasks] = useState<Task[]>([]);

  const wateringForDay = useMemo(
    () => wateringTasks.filter((t) => taskBelongsOnDay(t.date, dayKey)),
    [wateringTasks, dayKey],
  );
  const sunlightForDay = useMemo(
    () => sunlightTasks.filter((t) => taskBelongsOnDay(t.date, dayKey)),
    [sunlightTasks, dayKey],
  );
  const compostingForDay = useMemo(
    () => compostingTasks.filter((t) => taskBelongsOnDay(t.date, dayKey)),
    [compostingTasks, dayKey],
  );

  const mergeReorder = useCallback(
    (setter: React.Dispatch<React.SetStateAction<Task[]>>, next: Task[]) => {
      setter((all) => {
        const ids = new Set(next.map((t) => t.id));
        return [...all.filter((t) => !ids.has(t.id)), ...next];
      });
    },
    [],
  );

  // Load tasks from API on mount, auto-rolling over any incomplete past-dated tasks first
  useEffect(() => {
    tasksApi
      .autoRollover()
      .catch(() => {
        /* non-fatal: proceed to load regardless */
      })
      .finally(() => {
        tasksApi
          .list()
          .then((all) => {
            setWateringTasks(all.filter((t) => t.category === "watering"));
            setSunlightTasks(all.filter((t) => t.category === "sunlight"));
            setCompostingTasks(all.filter((t) => t.category === "composting"));
          })
          .catch((err) => console.error("Failed to load tasks:", err));
      });
  }, []);

  const handleTaskComplete = useCallback(
    (taskId: number, category: TaskCategory, currentCompleted: boolean) => {
      const newCompleted = !currentCompleted;

      const updateTasks = (tasks: Task[]) =>
        tasks.map((task) =>
          task.id === taskId ? { ...task, completed: newCompleted } : task,
        );

      switch (category) {
        case "watering":
          setWateringTasks(updateTasks);
          break;
        case "sunlight":
          setSunlightTasks(updateTasks);
          break;
        case "composting":
          setCompostingTasks(updateTasks);
          break;
      }

      tasksApi
        .update(taskId, { completed: newCompleted })
        .then(() => refreshStats())
        .catch((err) => {
          console.error("Failed to update task:", err);
          refreshStats();
        });
    },
    [refreshStats],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [activeCategory, setActiveCategory] = useState<TaskCategory | null>(
    null,
  );

  const handleAddTask = useCallback(async () => {
    if (!newTaskText.trim() || !activeCategory) return;

    try {
      const created = await tasksApi.create({
        text: newTaskText.trim(),
        date: newTaskDate.trim() || dayKey,
        category: activeCategory,
      });

      setLayoutAnimationCategory(activeCategory);

      switch (activeCategory) {
        case "watering":
          setWateringTasks((t) => [...t, created]);
          break;
        case "sunlight":
          setSunlightTasks((t) => [...t, created]);
          break;
        case "composting":
          setCompostingTasks((t) => [...t, created]);
          break;
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    }

    setNewTaskText("");
    setNewTaskDate("");
    setIsModalOpen(false);
    setActiveCategory(null);
  }, [newTaskText, newTaskDate, activeCategory, dayKey]);

  const handleDeleteTask = useCallback(
    async (taskId: number, category: TaskCategory) => {
      if (!(await confirmDeletion("Delete this task?"))) return;
      setLayoutAnimationCategory(category);
      switch (category) {
        case "watering":
          setWateringTasks((t) => t.filter((x) => x.id !== taskId));
          break;
        case "sunlight":
          setSunlightTasks((t) => t.filter((x) => x.id !== taskId));
          break;
        case "composting":
          setCompostingTasks((t) => t.filter((x) => x.id !== taskId));
          break;
      }
      try {
        await tasksApi.delete(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    },
    [confirmDeletion],
  );

  const handleRollOverTask = useCallback(
    async (taskId: number, _category: TaskCategory) => {
      if (
        !(await confirm({
          title: "Roll over to next day?",
          message: "This task will be moved to the next calendar day.",
          confirmLabel: "Roll over",
        }))
      ) {
        return;
      }
      try {
        const updated = await tasksApi.rollover(taskId);
        const all = await tasksApi.list();
        setWateringTasks(all.filter((t) => t.category === "watering"));
        setSunlightTasks(all.filter((t) => t.category === "sunlight"));
        setCompostingTasks(all.filter((t) => t.category === "composting"));
        setDayFromDate(parseLocalDayKey(updated.date));
      } catch (err) {
        console.error("Failed to roll task over:", err);
        const msg =
          err instanceof Error ? err.message : "Could not roll task over.";
        window.alert(msg);
      }
    },
    [setDayFromDate, confirm],
  );

  const openAddTaskModal = useCallback(
    (category: TaskCategory) => {
      setActiveCategory(category);
      setNewTaskDate(dayKey);
      setIsModalOpen(true);
    },
    [dayKey],
  );

  return (
    <div className="app-container">
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-container">
          <div className="home-header">
            <div className="welcome-section">
              <motion.h2
                className="welcome-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome Back, {user?.name ?? "Guest"} 🌱
              </motion.h2>
              <motion.p
                className="welcome-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Let the flowers blossom today.
              </motion.p>
              <motion.span
                className="welcome-date"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </motion.span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="home-tabs">
            {(["tasks", "habits", "goals", "backlog"] as ActiveTab[]).map(
              (tab) => (
                <button
                  key={tab}
                  className={`home-tab-btn ${activeTab === tab ? "home-tab-active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ),
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "tasks" && (
            <div key={dayKey} className="home-tasks-day">
              <TaskSection
                category="watering"
                title="Watering Tasks"
                subtitle="These tasks move the needle"
                tasks={wateringForDay}
                layoutAnimationCategory={layoutAnimationCategory}
                onActivateLayout={setLayoutAnimationCategory}
                onReorder={(next) => {
                  setLayoutAnimationCategory("watering");
                  mergeReorder(setWateringTasks, next);
                }}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onRollOver={handleRollOverTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
              <TaskSection
                title="Sunlight Tasks"
                subtitle="These tasks keep your goal alive"
                tasks={sunlightForDay}
                category="sunlight"
                layoutAnimationCategory={layoutAnimationCategory}
                onActivateLayout={setLayoutAnimationCategory}
                onReorder={(next) => {
                  setLayoutAnimationCategory("sunlight");
                  mergeReorder(setSunlightTasks, next);
                }}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onRollOver={handleRollOverTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
              <TaskSection
                title="Composting"
                subtitle="These tasks are extraneous things not necessarily important"
                tasks={compostingForDay}
                category="composting"
                layoutAnimationCategory={layoutAnimationCategory}
                onActivateLayout={setLayoutAnimationCategory}
                onReorder={(next) => {
                  setLayoutAnimationCategory("composting");
                  mergeReorder(setCompostingTasks, next);
                }}
                onComplete={handleTaskComplete}
                onDelete={handleDeleteTask}
                onRollOver={handleRollOverTask}
                onAddClick={openAddTaskModal}
                taskRefs={taskRefs}
              />
            </div>
          )}

          {activeTab === "habits" && (
            <HabitList
              endDateKey={dayKey}
              title="Habits"
              subtitle="Track each habit across the seven days ending on this calendar date."
            />
          )}

          {activeTab === "goals" && <Goals />}

          {activeTab === "backlog" && <Backlog />}
        </div>
      </div>
      <div className="calendar-container">
        <XPBar />
        <CustomCalendar />
        <GoalFocus />
        <HabitList
          endDateKey={dayKey}
          title="Habits"
          subtitle="Last seven days"
          showAddHabit={false}
          showDelete={false}
          compact
          emptyMessage="No habits yet. Add one from the Habits tab."
        />
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
