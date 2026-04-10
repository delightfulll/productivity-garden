import pool from "./db";

const XP_LEVEL_MULTIPLIER = 1.45;

// Ensure the column exists the first time awardXP is called — idempotent.
let columnEnsured = false;
async function ensureActivityDateColumn(): Promise<void> {
  if (columnEnsured) return;
  try {
    await pool.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_activity_date DATE`,
    );
    columnEnsured = true;
  } catch {
    // ignore — might not have ALTER privilege in some setups
  }
}

/**
 * Awards XP to a user, handles level-ups, and updates the daily streak.
 */
export async function awardXP(userId: number, xpAmount: number): Promise<void> {
  await ensureActivityDateColumn();

  const userRes = await pool.query(
    `SELECT xp, xp_max, garden_level, streak, last_activity_date
     FROM users WHERE id = $1`,
    [userId],
  );
  if (userRes.rowCount === 0) return;

  const u = userRes.rows[0];
  let newXp: number = (u.xp ?? 0) + xpAmount;
  let newXpMax: number = u.xp_max ?? 500;
  let newLevel: number = u.garden_level ?? 1;

  // Level up loop (could gain multiple levels at once)
  while (newXp >= newXpMax) {
    newXp -= newXpMax;
    newXpMax = Math.round(newXpMax * XP_LEVEL_MULTIPLIER);
    newLevel += 1;
  }

  // Streak logic
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const lastDate: string | null = u.last_activity_date
    ? new Date(u.last_activity_date).toISOString().split("T")[0]
    : null;

  let newStreak: number = u.streak ?? 0;
  if (!lastDate) {
    newStreak = 1;
  } else if (lastDate === today) {
    // Already active today — streak unchanged
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    newStreak = lastDate === yesterdayStr ? newStreak + 1 : 1;
  }

  await pool.query(
    `UPDATE users
     SET xp = $1, xp_max = $2, garden_level = $3, streak = $4, last_activity_date = $5
     WHERE id = $6`,
    [newXp, newXpMax, newLevel, newStreak, today, userId],
  );
}

/**
 * Removes XP (e.g. when un-completing a task). May level down if XP goes negative.
 * Does not change streak — that reflects daily activity, not a single task toggle.
 */
export async function revokeXP(userId: number, xpAmount: number): Promise<void> {
  if (xpAmount <= 0) return;

  const userRes = await pool.query(
    `SELECT xp, xp_max, garden_level FROM users WHERE id = $1`,
    [userId],
  );
  if (userRes.rowCount === 0) return;

  const u = userRes.rows[0];
  let newXp: number = (u.xp ?? 0) - xpAmount;
  let newXpMax: number = u.xp_max ?? 500;
  let newLevel: number = u.garden_level ?? 1;

  while (newXp < 0 && newLevel > 1) {
    const prevBar = Math.max(1, Math.round(newXpMax / XP_LEVEL_MULTIPLIER));
    newXp += prevBar;
    newXpMax = prevBar;
    newLevel -= 1;
  }

  if (newXp < 0) newXp = 0;

  await pool.query(
    `UPDATE users SET xp = $1, xp_max = $2, garden_level = $3 WHERE id = $4`,
    [newXp, newXpMax, newLevel, userId],
  );
}
