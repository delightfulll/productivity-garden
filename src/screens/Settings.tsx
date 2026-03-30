import React, { useState } from "react";
import "../styles/App.css";
import Sidebar from "../components/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBell,
  FaPalette,
  FaLeaf,
  FaDatabase,
  FaShieldAlt,
  FaCheck,
  FaDownload,
  FaTrash,
} from "react-icons/fa";

/* ── Toggle ────────────────────────────────────────────── */
const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    style={{ WebkitTapHighlightColor: "transparent", width: "52px", height: "28px" }}
    className={`relative inline-flex flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 focus:outline-none ${
      enabled ? "bg-green-500" : "bg-gray-200"
    }`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

/* ── Section wrapper ────────────────────────────────────── */
interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  gradient: string;
  iconBg: string;
  children: React.ReactNode;
  delay?: number;
}

const Section = ({ icon, title, subtitle, gradient, iconBg, children, delay = 0 }: SectionProps) => (
  <motion.div
    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4, ease: "easeOut" }}
    whileHover={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}
  >
    {/* Gradient header strip */}
    <div className={`px-7 py-6 flex items-center gap-4 ${gradient}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${iconBg}`}>
        <span className="text-base">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-base leading-tight">{title}</p>
        <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>

    {/* Rows */}
    <div className="px-5 py-3">{children}</div>
  </motion.div>
);

/* ── Setting row ────────────────────────────────────────── */
interface RowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  delay?: number;
}

const Row = ({ label, description, children, delay = 0 }: RowProps) => (
  <motion.div
    className="group flex items-center justify-between px-4 py-5 rounded-xl cursor-default transition-colors duration-150 hover:bg-gray-50"
    initial={{ opacity: 0, x: -6 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    whileHover={{ x: 3 }}
  >
    <div className="pr-8">
      <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900 transition-colors">{label}</p>
      {description && (
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      )}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </motion.div>
);

/* ── Chip selector ──────────────────────────────────────── */
const ChipGroup = ({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex gap-1.5">
    {options.map((o) => (
      <button
        key={o}
        onClick={() => onChange(o)}
        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-200 ${
          value === o
            ? "bg-green-500 text-white shadow-sm scale-105"
            : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
        }`}
      >
        {o}
      </button>
    ))}
  </div>
);

/* ── Divider ────────────────────────────────────────────── */
const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-3 mt-1">
    <div className="h-px flex-1 bg-gray-100" />
    <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">{label}</span>
    <div className="h-px flex-1 bg-gray-100" />
  </div>
);

/* ══════════════════════════════════════════════════════════
   Main screen
══════════════════════════════════════════════════════════ */
function Settings() {
  const [notif, setNotif] = useState({
    dailyReminder: true,
    weeklyRecap: true,
    streakAlerts: true,
    journalPrompts: false,
  });
  const [reminderTime, setReminderTime] = useState("08:00");

  const [appearance, setAppearance] = useState({
    compactMode: false,
    animations: true,
    showDates: true,
  });
  const [fontSize, setFontSize] = useState("medium");
  const [theme, setTheme] = useState("green");

  const [garden, setGarden] = useState({
    showCompleted: true,
    dailyReset: true,
    autoArchive: false,
    confirmDelete: true,
  });

  const [cleared, setCleared] = useState(false);

  const toggleNotif = (k: keyof typeof notif) => setNotif((p) => ({ ...p, [k]: !p[k] }));
  const toggleApp = (k: keyof typeof appearance) => setAppearance((p) => ({ ...p, [k]: !p[k] }));
  const toggleGarden = (k: keyof typeof garden) => setGarden((p) => ({ ...p, [k]: !p[k] }));

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

          {/* ── Page header ───────────────────────────────── */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-400 mt-2 text-sm">Tune your garden to grow just the way you like.</p>
          </motion.div>

          <div className="flex flex-col gap-5">

            {/* ── Notifications ─────────────────────────────── */}
            <div>
              <SectionDivider label="Notifications" />
              <Section
                icon={<FaBell className="text-violet-500" />}
                title="Notifications"
                subtitle="Reminders and alerts to keep you on track"
                gradient="bg-gradient-to-r from-violet-50 to-white border-b border-gray-100"
                iconBg="bg-violet-100"
                delay={0.06}
              >
                <Row label="Daily Reminder" description="A gentle nudge to tend your garden each day" delay={0.1}>
                  <Toggle enabled={notif.dailyReminder} onChange={() => toggleNotif("dailyReminder")} />
                </Row>

                <AnimatePresence>
                  {notif.dailyReminder && (
                    <motion.div
                      key="time"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mx-3 mb-3 px-4 py-3 bg-violet-50/60 rounded-xl border border-violet-100">
                        <label className="block text-xs text-violet-400 font-medium mb-1.5">Reminder time</label>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="border border-violet-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-400"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Row label="Weekly Recap" description="Sunday summary of everything you grew this week" delay={0.13}>
                  <Toggle enabled={notif.weeklyRecap} onChange={() => toggleNotif("weeklyRecap")} />
                </Row>
                <Row label="Streak Alerts" description="Don't let your streak wither away" delay={0.16}>
                  <Toggle enabled={notif.streakAlerts} onChange={() => toggleNotif("streakAlerts")} />
                </Row>
                <Row label="Journal Prompts" description="Daily writing seeds to spark reflection" delay={0.19}>
                  <Toggle enabled={notif.journalPrompts} onChange={() => toggleNotif("journalPrompts")} />
                </Row>
              </Section>
            </div>

            {/* ── Appearance ────────────────────────────────── */}
            <div>
              <SectionDivider label="Appearance" />
              <Section
                icon={<FaPalette className="text-pink-500" />}
                title="Appearance"
                subtitle="Personalise how your garden looks and feels"
                gradient="bg-gradient-to-r from-pink-50 to-white border-b border-gray-100"
                iconBg="bg-pink-100"
                delay={0.14}
              >
                <Row label="Font Size" description="Scale the text throughout the app" delay={0.18}>
                  <ChipGroup options={["small", "medium", "large"]} value={fontSize} onChange={setFontSize} />
                </Row>

                <Row label="Color Theme" description="Accent colour for active states and highlights" delay={0.21}>
                  <div className="flex gap-2.5">
                    {[
                      { id: "green", bg: "bg-green-500", ring: "ring-green-400" },
                      { id: "teal", bg: "bg-teal-500", ring: "ring-teal-400" },
                      { id: "emerald", bg: "bg-emerald-600", ring: "ring-emerald-400" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`w-7 h-7 rounded-full ${t.bg} flex items-center justify-center transition-all duration-200 ${
                          theme === t.id
                            ? `ring-2 ring-offset-2 ${t.ring} scale-110 shadow-md`
                            : "hover:scale-110 hover:shadow-sm opacity-70 hover:opacity-100"
                        }`}
                      >
                        {theme === t.id && <FaCheck className="text-white" style={{ fontSize: "8px" }} />}
                      </button>
                    ))}
                  </div>
                </Row>

                <Row label="Compact Mode" description="Tighter spacing to see more at once" delay={0.24}>
                  <Toggle enabled={appearance.compactMode} onChange={() => toggleApp("compactMode")} />
                </Row>
                <Row label="Animations" description="Smooth motion throughout the app" delay={0.27}>
                  <Toggle enabled={appearance.animations} onChange={() => toggleApp("animations")} />
                </Row>
                <Row label="Show Due Dates" description="Display date tags on tasks and entries" delay={0.3}>
                  <Toggle enabled={appearance.showDates} onChange={() => toggleApp("showDates")} />
                </Row>
              </Section>
            </div>

            {/* ── Garden Preferences ────────────────────────── */}
            <div>
              <SectionDivider label="Garden" />
              <Section
                icon={<FaLeaf className="text-green-600" />}
                title="Garden Preferences"
                subtitle="Control how your tasks grow and behave"
                gradient="bg-gradient-to-r from-green-50 to-white border-b border-gray-100"
                iconBg="bg-green-100"
                delay={0.22}
              >
                <Row label="Show Completed Tasks" description="Keep finished tasks visible with a strikethrough" delay={0.26}>
                  <Toggle enabled={garden.showCompleted} onChange={() => toggleGarden("showCompleted")} />
                </Row>
                <Row label="Daily Reset" description="Clear completed tasks automatically at midnight" delay={0.29}>
                  <Toggle enabled={garden.dailyReset} onChange={() => toggleGarden("dailyReset")} />
                </Row>
                <Row label="Auto-Archive Wins" description="Move wins older than 30 days to archive" delay={0.32}>
                  <Toggle enabled={garden.autoArchive} onChange={() => toggleGarden("autoArchive")} />
                </Row>
                <Row label="Confirm Before Deleting" description="Ask before removing a task or entry" delay={0.35}>
                  <Toggle enabled={garden.confirmDelete} onChange={() => toggleGarden("confirmDelete")} />
                </Row>
              </Section>
            </div>

            {/* ── Data ──────────────────────────────────────── */}
            <div>
              <SectionDivider label="Data" />
              <Section
                icon={<FaDatabase className="text-blue-500" />}
                title="Data"
                subtitle="Export or permanently manage your information"
                gradient="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100"
                iconBg="bg-blue-100"
                delay={0.3}
              >
                <Row label="Export All Data" description="Download your tasks, journal entries, and wins as JSON" delay={0.34}>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    <FaDownload style={{ fontSize: "11px" }} />
                    Export
                  </motion.button>
                </Row>

                <Row label="Clear Local Data" description="Permanently erase everything stored in this browser" delay={0.37}>
                  <div className="flex items-center gap-3">
                    <AnimatePresence>
                      {cleared && (
                        <motion.span
                          key="cleared"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-green-600 font-medium"
                        >
                          Cleared ✓
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <motion.button
                      onClick={handleClear}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 px-5 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors duration-200 text-sm font-medium border border-red-100"
                    >
                      <FaTrash style={{ fontSize: "11px" }} />
                      Clear Data
                    </motion.button>
                  </div>
                </Row>
              </Section>
            </div>

            {/* ── Privacy ───────────────────────────────────── */}
            <div>
              <SectionDivider label="Privacy & Security" />
              <Section
                icon={<FaShieldAlt className="text-gray-500" />}
                title="Privacy & Security"
                subtitle="Transparency about how your data is handled"
                gradient="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100"
                iconBg="bg-gray-100"
                delay={0.38}
              >
                <Row label="Storage" description="All data is stored locally on your device only" delay={0.42}>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-medium border border-green-200">
                    <FaShieldAlt style={{ fontSize: "9px" }} /> Local only
                  </span>
                </Row>
                <Row label="No account required" description="Productivity Garden works fully offline" delay={0.45}>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-4 py-1.5 rounded-full font-medium border border-gray-200">
                    ✓ Offline
                  </span>
                </Row>
                <Row label="Version" description="Productivity Garden" delay={0.48}>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    v1.0.0
                  </span>
                </Row>
              </Section>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
