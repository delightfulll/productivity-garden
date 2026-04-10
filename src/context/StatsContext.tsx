import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usersApi, type UserStats } from "../lib/api";
import { getUserId } from "../lib/api";
import { useAuth } from "./AuthContext";

// ── Garden rank names ──────────────────────────────────────────
const RANKS = [
  "Seedling",           // 1
  "Sprout",             // 2
  "Sapling",            // 3
  "Young Plant",        // 4
  "Growing Vine",       // 5
  "Budding Flower",     // 6
  "Flourishing Gardener", // 7
  "Blooming Garden",    // 8
  "Thriving Meadow",    // 9
  "Ancient Grove",      // 10
  "Forest Keeper",      // 11+
];

export function getRankName(level: number): string {
  return RANKS[Math.min(level - 1, RANKS.length - 1)];
}

// ── Context ────────────────────────────────────────────────────

interface StatsContextValue {
  stats: UserStats | null;
  refreshStats: () => void;
}

const StatsContext = createContext<StatsContextValue>({
  stats: null,
  refreshStats: () => {},
});

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(() => {
    const uid = getUserId();
    if (!uid) return;
    usersApi.getStats(uid).then(setStats).catch(console.error);
  }, []);

  // Fetch on mount and whenever the auth user changes
  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);

  return (
    <StatsContext.Provider value={{ stats, refreshStats: fetchStats }}>
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  return useContext(StatsContext);
}
