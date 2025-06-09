import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaFire, FaCalendarCheck, FaChartLine } from "react-icons/fa";
import "../App.css";
import Sidebar from "../components/Sidebar";
import "./Addictions.css";

function Addictions() {
  const [streak, setStreak] = useState(0);
  const [lastCheckIn, setLastCheckIn] = useState<Date | null>(null);
  const [checkIns, setCheckIns] = useState<
    { date: Date; stayedClean: boolean }[]
  >([]);

  useEffect(() => {
    // Load saved data from localStorage
    const savedStreak = localStorage.getItem("addictionStreak");
    const savedCheckIns = localStorage.getItem("addictionCheckIns");
    const savedLastCheckIn = localStorage.getItem("lastCheckIn");

    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedCheckIns) setCheckIns(JSON.parse(savedCheckIns));
    if (savedLastCheckIn) setLastCheckIn(new Date(savedLastCheckIn));
  }, []);

  const handleCheckIn = (stayedClean: boolean) => {
    const today = new Date();
    const newCheckIns = [...checkIns, { date: today, stayedClean }];
    setCheckIns(newCheckIns);
    localStorage.setItem("addictionCheckIns", JSON.stringify(newCheckIns));

    if (stayedClean) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem("addictionStreak", newStreak.toString());
    } else {
      setStreak(0);
      localStorage.setItem("addictionStreak", "0");
    }

    setLastCheckIn(today);
    localStorage.setItem("lastCheckIn", today.toISOString());
  };

  const calculateProgress = () => {
    if (checkIns.length === 0) return 0;
    const cleanDays = checkIns.filter((check) => check.stayedClean).length;
    return (cleanDays / checkIns.length) * 100;
  };

  return (
    <div className="app-container">
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-container">
          <h2 className="content-title">Recovery Tracker</h2>
          <p className="content-text">Track your progress and stay motivated</p>

          <div className="stats-container">
            <motion.div
              className="streak-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaFire className="streak-icon" />
              <h2>{streak}</h2>
              <p>Day Streak</p>
            </motion.div>

            <motion.div
              className="progress-card"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <FaChartLine className="progress-icon" />
              <h2>{calculateProgress().toFixed(1)}%</h2>
              <p>Success Rate</p>
            </motion.div>
          </div>

          <div className="check-in-container">
            <h3>Daily Check-in</h3>
            <p>Did you stay clean today?</p>
            <div className="button-group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCheckIn(true)}
                className="yes-button"
              >
                Yes, I stayed clean!
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleCheckIn(false)}
                className="no-button"
              >
                No, I slipped up
              </motion.button>
            </div>
          </div>

          <div className="history-container">
            <h3>Recent History</h3>
            <div className="history-list">
              {checkIns
                .slice(-7)
                .reverse()
                .map((check, index) => (
                  <motion.div
                    key={index}
                    className={`history-item ${
                      check.stayedClean ? "clean" : "slipped"
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FaCalendarCheck />
                    <span>{new Date(check.date).toLocaleDateString()}</span>
                    <span>
                      {check.stayedClean ? "Stayed Clean" : "Slipped Up"}
                    </span>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Addictions;
