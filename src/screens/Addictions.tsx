import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaCalendarCheck, FaChartLine } from "react-icons/fa";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import "../styles/Addictions.css";
import { addictionsApi, type Checkin } from "../lib/api";

function Addictions() {
  const [streak, setStreak] = useState(0);
  const [checkIns, setCheckIns] = useState<Checkin[]>([]);

  useEffect(() => {
    Promise.all([
      addictionsApi.getStreak(),
      addictionsApi.listCheckins(),
    ])
      .then(([streakData, checkins]) => {
        setStreak(streakData.streak);
        setCheckIns(checkins);
      })
      .catch((err) => console.error("Failed to load addiction data:", err));
  }, []);

  const handleCheckIn = async (stayedClean: boolean) => {
    try {
      const result = await addictionsApi.checkIn(stayedClean);
      setStreak(result.streak);
      setCheckIns((prev) => [...prev, result.checkin]);
    } catch (err) {
      console.error("Failed to save check-in:", err);
    }
  };

  const calculateProgress = () => {
    if (checkIns.length === 0) return 0;
    const cleanDays = checkIns.filter((c) => c.stayed_clean).length;
    return (cleanDays / checkIns.length) * 100;
  };

  const recentHistory = checkIns.slice(-7).reverse();

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content">
        <div className="content-container">

          {/* Page header */}
          <div className="home-header" style={{ maxWidth: "100%", marginBottom: "1.75rem" }}>
            <div className="welcome-section">
              <motion.h2
                className="content-title"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Recovery Tracker
              </motion.h2>
              <motion.p
                className="content-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Track your progress and stay motivated — one day at a time.
              </motion.p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="recovery-stats-row">
            <motion.div
              className="recovery-stat-card"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <FaFire className="recovery-stat-icon recovery-stat-icon-fire" />
              <p className="recovery-stat-number">{streak}</p>
              <p className="recovery-stat-label">Day Streak</p>
            </motion.div>

            <motion.div
              className="recovery-stat-card"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
            >
              <FaChartLine className="recovery-stat-icon recovery-stat-icon-chart" />
              <p className="recovery-stat-number">{calculateProgress().toFixed(1)}%</p>
              <p className="recovery-stat-label">Success Rate</p>
            </motion.div>
          </div>

          {/* Daily check-in */}
          <motion.div
            className="recovery-checkin-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.4 }}
          >
            <p className="recovery-checkin-title">Daily Check-in</p>
            <p className="recovery-checkin-sub">Did you stay clean today?</p>
            <div className="recovery-checkin-buttons">
              <motion.button
                className="recovery-yes-button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCheckIn(true)}
              >
                ✓ Yes, I stayed clean!
              </motion.button>
              <motion.button
                className="recovery-no-button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCheckIn(false)}
              >
                I slipped up
              </motion.button>
            </div>
          </motion.div>

          {/* Recent history */}
          <motion.div
            className="recovery-history-section"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.4 }}
          >
            <p className="recovery-history-heading">Recent History</p>

            {recentHistory.length === 0 ? (
              <div className="recovery-history-empty">
                <span className="recovery-history-empty-icon">📋</span>
                <p>No check-ins yet. Start today!</p>
              </div>
            ) : (
              <div className="recovery-history-list">
                <AnimatePresence>
                  {recentHistory.map((check, index) => (
                    <motion.div
                      key={check.id}
                      className={`recovery-history-item ${check.stayed_clean ? "recovery-history-clean" : "recovery-history-slipped"}`}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06 }}
                    >
                      <FaCalendarCheck className="recovery-history-icon" />
                      <span className="recovery-history-date">
                        {new Date(check.checked_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className={`recovery-history-status ${check.stayed_clean ? "recovery-history-status-clean" : "recovery-history-status-slipped"}`}>
                        {check.stayed_clean ? "Stayed Clean" : "Slipped Up"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default Addictions;
