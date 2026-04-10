import React from "react";
import { motion } from "framer-motion";
import { FaFire, FaTree } from "react-icons/fa";
import { useStats, getRankName } from "../context/StatsContext";

export default function XPBar() {
  const { stats } = useStats();

  if (!stats) return null;

  const { xp, xp_max, garden_level, streak } = stats;
  const pct = Math.min(Math.round((xp / xp_max) * 100), 100);
  const rank = getRankName(garden_level);

  return (
    <div className="xpbar-wrap">
      {/* Rank + level */}
      <div className="xpbar-header">
        <div className="xpbar-rank">
          <FaTree className="xpbar-rank-icon" />
          <span className="xpbar-rank-label">Lv.{garden_level}</span>
          <span className="xpbar-rank-name">{rank}</span>
        </div>
        <div className="xpbar-streak">
          <FaFire className="xpbar-streak-icon" />
          <span className="xpbar-streak-num">{streak}</span>
        </div>
      </div>

      {/* XP track */}
      <div className="xpbar-track">
        <motion.div
          className="xpbar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
      <div className="xpbar-footer">
        <span className="xpbar-xp">{xp} / {xp_max} XP</span>
        <span className="xpbar-to-next">{xp_max - xp} to next level</span>
      </div>
    </div>
  );
}
