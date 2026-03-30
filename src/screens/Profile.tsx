import React, { useState } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLeaf,
  FaFire,
  FaTrophy,
  FaBookOpen,
  FaEdit,
  FaCheck,
  FaTimes,
  FaSeedling,
  FaStar,
  FaBolt,
  FaHeart,
} from "react-icons/fa";

const FOCUS_AREAS = [
  { label: "Deep Work", emoji: "🎯" },
  { label: "Health", emoji: "💪" },
  { label: "Learning", emoji: "📚" },
  { label: "Mindfulness", emoji: "🧘" },
  { label: "Relationships", emoji: "🤝" },
  { label: "Creativity", emoji: "🎨" },
  { label: "Finance", emoji: "💰" },
  { label: "Fitness", emoji: "🏃" },
];

const GARDEN_LEVEL = 7;
const LEVEL_XP = 340;
const LEVEL_XP_MAX = 500;

function Profile() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("Vinay");
  const [bio, setBio] = useState("Growing one task at a time.");
  const [draftName, setDraftName] = useState(name);
  const [draftBio, setDraftBio] = useState(bio);
  const [focusAreas, setFocusAreas] = useState(["Deep Work", "Health", "Mindfulness"]);

  const stats = [
    { icon: <FaFire />, label: "Streak", value: "12", bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-100" },
    { icon: <FaLeaf />, label: "Tasks Done", value: "148", bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
    { icon: <FaTrophy />, label: "Wins", value: "34", bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-100" },
    { icon: <FaBookOpen />, label: "Journal", value: "27", bg: "bg-blue-50", text: "text-blue-500", border: "border-blue-100" },
  ];

  const activity = [
    { color: "bg-green-500", icon: "🌿", text: "Completed all watering tasks", time: "Today", tag: "Task" },
    { color: "bg-yellow-500", icon: "🏆", text: "Logged a win: finished sprint", time: "Yesterday", tag: "Win" },
    { color: "bg-blue-500", icon: "📖", text: "Added a journal entry", time: "2 days ago", tag: "Journal" },
    { color: "bg-orange-500", icon: "🔥", text: "12-day streak milestone!", time: "Today", tag: "Streak" },
    { color: "bg-purple-500", icon: "✨", text: "Completed evening reflection", time: "3 days ago", tag: "Task" },
  ];

  const tagColors: Record<string, string> = {
    Task: "bg-green-100 text-green-700",
    Win: "bg-yellow-100 text-yellow-700",
    Journal: "bg-blue-100 text-blue-700",
    Streak: "bg-orange-100 text-orange-700",
  };

  const handleSave = () => { setName(draftName.trim() || name); setBio(draftBio.trim() || bio); setEditing(false); };
  const handleCancel = () => { setDraftName(name); setDraftBio(bio); setEditing(false); };
  const toggleFocus = (label: string) =>
    setFocusAreas((prev) => prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]);

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const xpPercent = Math.round((LEVEL_XP / LEVEL_XP_MAX) * 100);

  return (
    <div className="app-container">
      <Sidebar />

      {/* Scrollable content area */}
      <div className="main-content" style={{ height: "100vh", overflowY: "auto" }}>
        <div className="content-container pb-20">

          {/* ── Hero banner ─────────────────────────────── */}
          <motion.div
            className="relative rounded-2xl overflow-hidden mb-8 shadow-md"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className="h-48 w-full relative"
              style={{ background: "linear-gradient(135deg, #16a34a 0%, #4ade80 50%, #86efac 100%)" }}
            >
              <div className="absolute top-6 right-10 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute top-12 right-28 w-20 h-20 rounded-full bg-white/10" />
              <div className="absolute -top-3 right-52 w-14 h-14 rounded-full bg-white/10" />
            </div>

            <div className="bg-white px-10 pb-8">
              <div className="flex items-end gap-6 -mt-12">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #15803d, #22c55e)" }}
                  >
                    <span className="text-white text-3xl font-bold tracking-wide">{initials}</span>
                  </div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <FaLeaf className="text-white" style={{ fontSize: "9px" }} />
                  </div>
                </div>

                {/* Name + bio */}
                <div className="flex-1 pb-1 pt-14">
                  <AnimatePresence mode="wait">
                    {editing ? (
                      <motion.div key="editing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                        <input
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 focus:outline-none bg-transparent w-full"
                        />
                        <textarea
                          value={draftBio}
                          onChange={(e) => setDraftBio(e.target.value)}
                          rows={2}
                          className="text-base text-gray-500 border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none w-full"
                        />
                        <div className="flex gap-3">
                          <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors">
                            <FaCheck style={{ fontSize: "10px" }} /> Save
                          </button>
                          <button onClick={handleCancel} className="flex items-center gap-2 px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                            <FaTimes style={{ fontSize: "10px" }} /> Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="viewing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
                          <button onClick={() => setEditing(true)} className="p-1.5 text-gray-300 hover:text-green-500 rounded-lg transition-colors hover:bg-green-50">
                            <FaEdit style={{ fontSize: "14px" }} />
                          </button>
                        </div>
                        <p className="text-base text-gray-500 mt-1.5 leading-relaxed">{bio}</p>
                        <p className="text-sm text-gray-400 mt-2 flex items-center gap-1.5">
                          <FaSeedling className="text-green-400" style={{ fontSize: "12px" }} />
                          Gardening since January 2025
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Streak badge */}
                {!editing && (
                  <div className="pb-1 flex-shrink-0 flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-2xl px-6 py-4">
                    <FaFire className="text-orange-500 text-2xl" />
                    <div>
                      <p className="text-3xl font-bold text-gray-800 leading-none">12</p>
                      <p className="text-sm text-gray-400 leading-none mt-1">day streak</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Garden Level ─────────────────────────────── */}
          <motion.div
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌳</span>
                <div>
                  <p className="text-base font-semibold text-gray-700">Garden Level {GARDEN_LEVEL}</p>
                  <p className="text-sm text-gray-400 mt-0.5">Flourishing Gardener</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                {LEVEL_XP} / {LEVEL_XP_MAX} XP
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #16a34a, #4ade80)" }}
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-2">{LEVEL_XP_MAX - LEVEL_XP} XP until Level {GARDEN_LEVEL + 1}</p>
          </motion.div>

          {/* ── Stats ────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-5 mb-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className={`${s.bg} border ${s.border} rounded-2xl p-6 flex flex-col`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                whileHover={{ scale: 1.03 }}
              >
                <span className={`text-2xl ${s.text} mb-3`}>{s.icon}</span>
                <p className="text-3xl font-bold text-gray-800 leading-none">{s.value}</p>
                <p className="text-sm text-gray-500 mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Bottom grid ──────────────────────────────── */}
          <div className="grid grid-cols-5 gap-6">
            {/* Focus Areas */}
            <motion.div
              className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <FaStar className="text-yellow-400 text-lg" />
                <h3 className="text-base font-semibold text-gray-800">Focus Areas</h3>
              </div>
              <p className="text-sm text-gray-400 mb-5">What you're growing towards</p>
              <div className="flex flex-col gap-3">
                {FOCUS_AREAS.map((area) => {
                  const active = focusAreas.includes(area.label);
                  return (
                    <button
                      key={area.label}
                      onClick={() => toggleFocus(area.label)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 text-left ${
                        active
                          ? "bg-green-500 text-white shadow-sm"
                          : "bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      <span className="text-lg">{area.emoji}</span>
                      {area.label}
                      {active && <FaCheck className="ml-auto text-white/80 text-xs" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.4 }}
            >
              <div className="flex items-center gap-2.5 mb-1">
                <FaBolt className="text-green-500 text-lg" />
                <h3 className="text-base font-semibold text-gray-800">Recent Activity</h3>
              </div>
              <p className="text-sm text-gray-400 mb-5">Your garden's growth log</p>
              <div className="space-y-5">
                {activity.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-4"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                  >
                    <div className={`w-1 self-stretch rounded-full ${item.color} flex-shrink-0`} style={{ minHeight: "44px" }} />
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base text-gray-700 leading-snug">{item.text}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{item.time}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0 ${tagColors[item.tag]}`}>
                      {item.tag}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-7 pt-5 border-t border-gray-50 flex items-center gap-2.5">
                <FaHeart className="text-red-400" />
                <p className="text-sm text-gray-400 italic">Every small action nourishes the garden.</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
