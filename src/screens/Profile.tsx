import React, { useState, useEffect, useCallback } from "react";
import "../styles/App.css";
import "../styles/profile.css";
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
  FaTree,
  FaBullseye,
  FaHeartbeat,
  FaBook,
  FaUsers,
  FaPen,
  FaChartLine,
  FaRunning,
} from "react-icons/fa";
import { usersApi, getUserId, type ActivityItem } from "../lib/api";
import { useStats, getRankName } from "../context/StatsContext";
import { useAuth } from "../context/AuthContext";

// ── Focus Areas ────────────────────────────────────────────────
const FOCUS_AREAS = [
  { label: "Deep Work",     icon: <FaBullseye /> },
  { label: "Health",        icon: <FaHeartbeat /> },
  { label: "Learning",      icon: <FaBook /> },
  { label: "Mindfulness",   icon: <FaLeaf /> },
  { label: "Relationships", icon: <FaUsers /> },
  { label: "Creativity",    icon: <FaPen /> },
  { label: "Finance",       icon: <FaChartLine /> },
  { label: "Fitness",       icon: <FaRunning /> },
];

// ── Activity helpers ───────────────────────────────────────────
function activityIcon(item: ActivityItem) {
  if (item.type === "win")     return <FaTrophy />;
  if (item.type === "journal") return <FaBookOpen />;
  // task — colour by category
  if (item.category === "watering")   return <FaLeaf />;
  if (item.category === "sunlight")   return <FaFire />;
  if (item.category === "composting") return <FaStar />;
  return <FaLeaf />;
}

function activityAccent(item: ActivityItem) {
  if (item.type === "win")     return "profile-activity-yellow";
  if (item.type === "journal") return "profile-activity-blue";
  if (item.category === "sunlight")   return "profile-activity-orange";
  if (item.category === "composting") return "profile-activity-purple";
  return "profile-activity-green";
}

function activityTag(item: ActivityItem): { label: string; cls: string } {
  if (item.type === "win")     return { label: "Win",     cls: "profile-tag-win"     };
  if (item.type === "journal") return { label: "Journal", cls: "profile-tag-journal" };
  if (item.category === "watering")   return { label: "Watering",   cls: "profile-tag-task"   };
  if (item.category === "sunlight")   return { label: "Sunlight",   cls: "profile-tag-streak" };
  return { label: "Task", cls: "profile-tag-task" };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7)   return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString();
}

// ──────────────────────────────────────────────────────────────
function Profile() {
  const { user } = useAuth();
  const { stats, refreshStats } = useStats();

  // Profile fields
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [draftName, setDraftName] = useState("");
  const [draftBio, setDraftBio] = useState("");

  // Activity feed
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  // Load profile + activity on mount
  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;

    usersApi.getProfile(uid).then((p) => {
      setName(p.name);
      setBio(p.bio ?? "");
      setFocusAreas(p.focus_areas ?? []);
      setDraftName(p.name);
      setDraftBio(p.bio ?? "");
    }).catch(console.error);

    usersApi.getActivity(uid).then((a) => {
      setActivity(a);
    }).catch(console.error).finally(() => setLoadingActivity(false));
  }, []);

  const handleSave = useCallback(async () => {
    const uid = getUserId();
    if (!uid) return;
    const saved = await usersApi.updateProfile(uid, {
      name: draftName.trim() || name,
      bio: draftBio.trim(),
      focus_areas: focusAreas,
    });
    setName(saved.name);
    setBio(saved.bio ?? "");
    setEditing(false);
  }, [draftName, draftBio, focusAreas, name]);

  const handleCancel = () => {
    setDraftName(name);
    setDraftBio(bio);
    setEditing(false);
  };

  const toggleFocus = useCallback((label: string) => {
    setFocusAreas((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label],
    );
  }, []);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const level       = stats?.garden_level ?? 1;
  const xp          = stats?.xp ?? 0;
  const xpMax       = stats?.xp_max ?? 500;
  const streak      = stats?.streak ?? 0;
  const tasksDone   = stats?.tasks_done ?? 0;
  const winsCount   = stats?.wins ?? 0;
  const journalCnt  = stats?.journal_count ?? 0;
  const xpPercent   = Math.min(Math.round((xp / xpMax) * 100), 100);
  const rankName    = getRankName(level);

  const statCards = [
    { icon: <FaFire />,     label: "Streak",     value: streak,     colorClass: "profile-stat-orange" },
    { icon: <FaLeaf />,     label: "Tasks Done", value: tasksDone,  colorClass: "profile-stat-green"  },
    { icon: <FaTrophy />,   label: "Wins",       value: winsCount,  colorClass: "profile-stat-yellow" },
    { icon: <FaBookOpen />, label: "Journal",    value: journalCnt, colorClass: "profile-stat-blue"   },
  ];

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-content" style={{ height: "100vh", overflowY: "auto" }}>
        <div className="content-container pb-20">

          {/* ── Page heading ─────────────────────────── */}
          <motion.div
            className="profile-page-header"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="welcome-title">Your Profile</h2>
            <p className="welcome-subtitle">Track your growth and focus areas.</p>
          </motion.div>

          {/* ── Hero banner ──────────────────────────── */}
          <motion.div
            className="profile-hero"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.45 }}
          >
            <div className="profile-banner">
              <div className="profile-banner-circle profile-banner-circle-lg" />
              <div className="profile-banner-circle profile-banner-circle-md" />
              <div className="profile-banner-circle profile-banner-circle-sm" />
            </div>

            <div className="profile-hero-body">
              <div className="profile-hero-row">
                {/* Avatar */}
                <div className="profile-avatar-wrap">
                  <div className="profile-avatar">
                    <span className="profile-avatar-initials">{initials}</span>
                  </div>
                  <div className="profile-avatar-badge">
                    <FaLeaf className="profile-avatar-badge-icon" />
                  </div>
                </div>

                {/* Name + bio */}
                <div className="profile-identity">
                  <AnimatePresence mode="wait">
                    {editing ? (
                      <motion.div
                        key="editing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="profile-edit-form"
                      >
                        <input
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          className="profile-edit-name"
                          placeholder="Your name"
                        />
                        <textarea
                          value={draftBio}
                          onChange={(e) => setDraftBio(e.target.value)}
                          rows={2}
                          className="profile-edit-bio"
                          placeholder="A short bio..."
                        />
                        <div className="profile-edit-actions">
                          <button onClick={handleSave} className="profile-save-btn">
                            <FaCheck className="profile-btn-icon" /> Save
                          </button>
                          <button onClick={handleCancel} className="profile-cancel-btn">
                            <FaTimes className="profile-btn-icon" /> Cancel
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="viewing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="profile-name-row">
                          <h1 className="profile-name">{name}</h1>
                          <button onClick={() => { setDraftName(name); setDraftBio(bio); setEditing(true); }} className="profile-edit-btn">
                            <FaEdit />
                          </button>
                        </div>
                        <p className="profile-bio">{bio || "No bio yet — click edit to add one."}</p>
                        <p className="profile-since">
                          <FaSeedling className="profile-since-icon" />
                          {user?.created_at
                            ? `Gardening since ${new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                            : "Gardening since the beginning"}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Streak badge */}
                {!editing && (
                  <div className="profile-streak-badge">
                    <FaFire className="profile-streak-icon" />
                    <div>
                      <p className="profile-streak-num">{streak}</p>
                      <p className="profile-streak-label">day streak</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── Garden Level ─────────────────────────── */}
          <motion.div
            className="profile-card profile-level-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <div className="profile-level-top">
              <div className="profile-level-info">
                <FaTree className="profile-level-icon" />
                <div>
                  <p className="profile-level-title">Garden Level {level}</p>
                  <p className="profile-level-sub">{rankName}</p>
                </div>
              </div>
              <span className="profile-xp-badge">{xp} / {xpMax} XP</span>
            </div>
            <div className="profile-xp-track">
              <motion.div
                className="profile-xp-fill"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="profile-xp-hint">{xpMax - xp} XP until Level {level + 1}</p>
          </motion.div>

          {/* ── Stats ────────────────────────────────── */}
          <div className="profile-stats-grid">
            {statCards.map((s, i) => (
              <motion.div
                key={s.label}
                className={`profile-stat-card ${s.colorClass}`}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.07, duration: 0.35 }}
                whileHover={{ scale: 1.03 }}
              >
                <span className="profile-stat-icon">{s.icon}</span>
                <p className="profile-stat-value">{s.value}</p>
                <p className="profile-stat-label">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Bottom grid ───────────────────────────── */}
          <div className="profile-bottom-grid">
            {/* Focus Areas */}
            <motion.div
              className="profile-card profile-focus-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.4 }}
            >
              <div className="profile-section-header">
                <FaStar className="profile-section-icon profile-section-icon-yellow" />
                <h3 className="profile-section-title">Focus Areas</h3>
              </div>
              <p className="profile-section-sub">What you're growing towards</p>
              <div className="profile-focus-list">
                {FOCUS_AREAS.map((area) => {
                  const active = focusAreas.includes(area.label);
                  return (
                    <button
                      key={area.label}
                      onClick={() => toggleFocus(area.label)}
                      className={`profile-focus-item ${active ? "profile-focus-item-active" : ""}`}
                    >
                      <span className="profile-focus-item-icon">{area.icon}</span>
                      {area.label}
                      {active && <FaCheck className="profile-focus-check" />}
                    </button>
                  );
                })}
              </div>
              {editing && (
                <button onClick={handleSave} className="profile-save-btn" style={{ marginTop: "1rem", width: "100%", justifyContent: "center" }}>
                  <FaCheck className="profile-btn-icon" /> Save Focus Areas
                </button>
              )}
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              className="profile-card profile-activity-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <div className="profile-section-header">
                <FaBolt className="profile-section-icon profile-section-icon-green" />
                <h3 className="profile-section-title">Recent Activity</h3>
              </div>
              <p className="profile-section-sub">Your garden's growth log</p>

              {loadingActivity ? (
                <p className="profile-section-sub" style={{ marginTop: "1rem" }}>Loading…</p>
              ) : activity.length === 0 ? (
                <div className="profile-empty-activity">
                  <FaLeaf className="profile-empty-icon" />
                  <p>No activity yet — start gardening!</p>
                </div>
              ) : (
                <div className="profile-activity-list">
                  {activity.map((item, i) => {
                    const tag = activityTag(item);
                    return (
                      <motion.div
                        key={i}
                        className="profile-activity-row"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.46 + i * 0.06 }}
                      >
                        <div className={`profile-activity-bar ${activityAccent(item)}`} />
                        <div className="profile-activity-icon-wrap">
                          {activityIcon(item)}
                        </div>
                        <div className="profile-activity-body">
                          <p className="profile-activity-text">{item.content}</p>
                          <p className="profile-activity-time">{timeAgo(item.created_at)}</p>
                        </div>
                        <span className={`profile-activity-tag ${tag.cls}`}>
                          {tag.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <div className="profile-activity-footer">
                <FaHeart className="profile-activity-footer-icon" />
                <p className="profile-activity-footer-text">
                  Every small action nourishes the garden.
                </p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Profile;
