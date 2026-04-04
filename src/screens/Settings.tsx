import React, { useState } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaDownload, FaTrash } from "react-icons/fa";

function Settings() {
  const [cleared, setCleared] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    const keys = Object.keys(localStorage);
    const data: Record<string, unknown> = {};
    keys.forEach((k) => {
      try {
        data[k] = JSON.parse(localStorage.getItem(k) ?? "null");
      } catch {
        data[k] = localStorage.getItem(k);
      }
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `productivity-garden-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const handleClear = () => {
    localStorage.clear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content" style={{ height: "100vh", overflowY: "auto" }}>
        <div className="content-container px-8 pt-8 pb-24">

          {/* Page header */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl font-bold" style={{ color: "#1f2937" }}>Settings</h1>
            <p className="mt-2 text-sm" style={{ color: "#9ca3af" }}>
              Manage your local data.
            </p>
          </motion.div>

          <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: "1.25rem" }}>

            {/* Section label */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
              <div style={{ height: "1px", flex: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: "0.72rem", color: "#d1d5db", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Data
              </span>
              <div style={{ height: "1px", flex: 1, background: "#e5e7eb" }} />
            </div>

            {/* Data card */}
            <motion.div
              style={{
                background: "white",
                border: "1.5px solid #e5e7eb",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Export row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.1rem 1.4rem",
                  borderBottom: "1.5px solid #f3f4f6",
                }}
              >
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                    Export All Data
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                    Download everything as a JSON file
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <AnimatePresence>
                    {exported && (
                      <motion.span
                        key="exported"
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}
                      >
                        Saved ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button
                    onClick={handleExport}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.5rem 1.1rem",
                      background: "#22c55e",
                      color: "white",
                      border: "none",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
                    }}
                  >
                    <FaDownload style={{ fontSize: "0.75rem" }} />
                    Export
                  </motion.button>
                </div>
              </div>

              {/* Clear row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "1.1rem 1.4rem",
                }}
              >
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 600, color: "#1f2937", margin: 0 }}>
                    Clear Local Data
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.2rem" }}>
                    Permanently erase everything stored in this browser
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <AnimatePresence>
                    {cleared && (
                      <motion.span
                        key="cleared"
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 600 }}
                      >
                        Cleared ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <motion.button
                    onClick={handleClear}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      padding: "0.5rem 1.1rem",
                      background: "#fff1f2",
                      color: "#ef4444",
                      border: "1.5px solid #fecaca",
                      borderRadius: 10,
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <FaTrash style={{ fontSize: "0.75rem" }} />
                    Clear
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Version chip */}
            <motion.div
              style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#d1d5db",
                  fontFamily: "monospace",
                  background: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  padding: "0.35rem 0.85rem",
                }}
              >
                Productivity Garden · v1.0.0
              </span>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
