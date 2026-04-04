import React, { useState, useEffect } from "react";
import { FaSeedling, FaChevronDown, FaTimes } from "react-icons/fa";
import { goalsApi, type Goal } from "../lib/api";

function GoalFocus() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [focusedId, setFocusedId] = useState<number | null>(() => {
    const saved = localStorage.getItem("focusedGoalId");
    return saved ? JSON.parse(saved) : null;
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    goalsApi
      .list()
      .then(setGoals)
      .catch((err) => console.error("Failed to load goals:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("focusedGoalId", JSON.stringify(focusedId));
  }, [focusedId]);

  const activeGoals = goals.filter((g) => !g.achieved);
  const focusedGoal = activeGoals.find((g) => g.id === focusedId) ?? null;

  const selectGoal = (id: number) => {
    setFocusedId(id);
    setDropdownOpen(false);
  };

  const clearFocus = () => {
    setFocusedId(null);
    setDropdownOpen(false);
  };

  return (
    <div className="goal-focus-widget">
      <div className="goal-focus-header">
        <FaSeedling className="goal-focus-icon" />
        <span className="goal-focus-label">Goal Focus</span>
        {focusedGoal && (
          <button className="goal-focus-clear" onClick={clearFocus} title="Clear focus">
            <FaTimes />
          </button>
        )}
      </div>

      {focusedGoal ? (
        <div className="goal-focus-card">
          <p className="goal-focus-title">{focusedGoal.title}</p>
          {focusedGoal.description && (
            <p className="goal-focus-desc">{focusedGoal.description}</p>
          )}
          {focusedGoal.target_date && (
            <p className="goal-focus-date">Target: {focusedGoal.target_date}</p>
          )}
          <button
            className="goal-focus-change"
            onClick={() => setDropdownOpen((o) => !o)}
          >
            Change <FaChevronDown style={{ display: "inline", marginLeft: 4 }} />
          </button>
        </div>
      ) : (
        <button
          className="goal-focus-pick"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {activeGoals.length === 0
            ? "No active goals yet"
            : "Pick a goal to focus on"}
          {activeGoals.length > 0 && (
            <FaChevronDown style={{ marginLeft: 6 }} />
          )}
        </button>
      )}

      {dropdownOpen && activeGoals.length > 0 && (
        <ul className="goal-focus-dropdown">
          {activeGoals.map((g) => (
            <li
              key={g.id}
              className={`goal-focus-option ${g.id === focusedId ? "goal-focus-option-active" : ""}`}
              onClick={() => selectGoal(g.id)}
            >
              {g.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GoalFocus;
