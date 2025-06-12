import React, { useState, useEffect } from "react";
import { useTimer } from "react-timer-hook";

interface Task {
  id: number;
  text: string;
  category: string;
  date: string;
  completed: boolean;
}

interface Tasks {
  watering: Task[];
  sunlight: Task[];
  composting: Task[];
}

const Timer = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [tasks, setTasks] = useState<Tasks>({
    watering: [],
    sunlight: [],
    composting: [],
  });

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const wateringTasks = await localStorage.getItem("wateringTasks");
        const sunlightTasks = await localStorage.getItem("sunlightTasks");
        const compostingTasks = await localStorage.getItem("compostingTasks");

        setTasks({
          watering: wateringTasks ? JSON.parse(wateringTasks) : [],
          sunlight: sunlightTasks ? JSON.parse(sunlightTasks) : [],
          composting: compostingTasks ? JSON.parse(compostingTasks) : [],
        });
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    loadTasks();
  }, []);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({
    autoStart: false,
    expiryTimestamp: new Date(Date.now() + 300000),
  });

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(false);
    // Reset timer when selecting a new task
    const time = new Date();
    time.setSeconds(time.getSeconds() + 300);
    restart(time);
  };

  // Combine all tasks into a single array for display
  const allTasks = [
    ...tasks.watering.map((task) => ({ ...task, category: "watering" })),
    ...tasks.sunlight.map((task) => ({ ...task, category: "sunlight" })),
    ...tasks.composting.map((task) => ({ ...task, category: "composting" })),
  ];

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Task Timer</h1>

      {/* Task Selection */}
      <div style={{ marginBottom: "20px" }}>
        {selectedTask ? (
          <div
            style={{
              padding: "10px",
              backgroundColor: "#f0f9f0",
              borderRadius: "8px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3>Current Task:</h3>
              <p
                style={{
                  fontSize: "1.2em",
                  color: "#2d3748",
                  margin: "5px 0",
                }}
              >
                {selectedTask.text}
              </p>
              <span
                style={{
                  color: "#718096",
                  fontSize: "0.9em",
                }}
              >
                Category: {selectedTask.category}
              </span>
            </div>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "#4299e1",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9em",
              }}
            >
              Change Task
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsTaskModalOpen(true)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1.1em",
            }}
          >
            Select Task
          </button>
        )}
      </div>

      {/* Timer Display */}
      <div
        style={{
          fontSize: "100px",
          fontFamily: "monospace",
          margin: "20px 0",
        }}
      >
        <span>{days}</span>:<span>{hours}</span>:<span>{minutes}</span>:
        <span>{seconds}</span>
      </div>

      {/* Timer Status */}
      <p
        style={{
          fontSize: "1.2em",
          color: isRunning ? "#48bb78" : "#718096",
          marginBottom: "20px",
        }}
      >
        {isRunning ? "Running" : "Paused"}
      </p>

      {/* Timer Controls */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        {!isRunning ? (
          <button
            onClick={start}
            style={{
              padding: "10px 20px",
              backgroundColor: "#48bb78",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Start
          </button>
        ) : (
          <button
            onClick={pause}
            style={{
              padding: "10px 20px",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Stop
          </button>
        )}
        <button
          onClick={() => {
            const time = new Date();
            time.setSeconds(time.getSeconds() + 300);
            restart(time);
          }}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4299e1",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Reset
        </button>
      </div>

      {/* Task Selection Modal */}
      {isTaskModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h2>Select a Task</h2>

            {/* Watering Tasks */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#2d3748", marginBottom: "10px" }}>
                Watering Tasks
              </h3>
              {allTasks
                .filter((task) => task.category === "watering")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    style={{
                      padding: "10px",
                      margin: "5px 0",
                      backgroundColor: "#f7fafc",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#edf2f7")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7fafc")
                    }
                  >
                    <p style={{ margin: 0 }}>{task.text}</p>
                    <small style={{ color: "#718096" }}>{task.date}</small>
                  </div>
                ))}
            </div>

            {/* Sunlight Tasks */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#2d3748", marginBottom: "10px" }}>
                Sunlight Tasks
              </h3>
              {allTasks
                .filter((task) => task.category === "sunlight")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    style={{
                      padding: "10px",
                      margin: "5px 0",
                      backgroundColor: "#f7fafc",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#edf2f7")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7fafc")
                    }
                  >
                    <p style={{ margin: 0 }}>{task.text}</p>
                    <small style={{ color: "#718096" }}>{task.date}</small>
                  </div>
                ))}
            </div>

            {/* Composting Tasks */}
            <div style={{ marginTop: "20px" }}>
              <h3 style={{ color: "#2d3748", marginBottom: "10px" }}>
                Composting Tasks
              </h3>
              {allTasks
                .filter((task) => task.category === "composting")
                .map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskSelect(task)}
                    style={{
                      padding: "10px",
                      margin: "5px 0",
                      backgroundColor: "#f7fafc",
                      borderRadius: "4px",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#edf2f7")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7fafc")
                    }
                  >
                    <p style={{ margin: 0 }}>{task.text}</p>
                    <small style={{ color: "#718096" }}>{task.date}</small>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setIsTaskModalOpen(false)}
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                backgroundColor: "#e53e3e",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timer;
