import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /api/addictions/checkins?userId=1
router.get("/checkins", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = await pool.query(
      "SELECT * FROM addiction_checkins WHERE user_id = $1 ORDER BY checked_at ASC",
      [Number(userId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /addictions/checkins error:", err);
    res.status(500).json({ error: "Failed to fetch check-ins" });
  }
});

// GET /api/addictions/streak?userId=1
router.get("/streak", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = await pool.query(
      "SELECT streak, last_checkin FROM addiction_streaks WHERE user_id = $1",
      [Number(userId)]
    );
    if (result.rowCount === 0) {
      res.json({ streak: 0, last_checkin: null });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /addictions/streak error:", err);
    res.status(500).json({ error: "Failed to fetch streak" });
  }
});

// POST /api/addictions/checkins
// Body: { user_id, stayed_clean }
router.post("/checkins", async (req: Request, res: Response) => {
  const { user_id, stayed_clean } = req.body;
  if (user_id === undefined || stayed_clean === undefined) {
    res.status(400).json({ error: "user_id and stayed_clean are required" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert the check-in
    const checkinResult = await client.query(
      "INSERT INTO addiction_checkins (user_id, stayed_clean) VALUES ($1, $2) RETURNING *",
      [user_id, stayed_clean]
    );

    // Upsert streak
    const streakRow = await client.query(
      "SELECT streak FROM addiction_streaks WHERE user_id = $1",
      [user_id]
    );

    const today = new Date().toISOString().split("T")[0];
    let newStreak: number;

    if (streakRow.rowCount === 0) {
      newStreak = stayed_clean ? 1 : 0;
      await client.query(
        "INSERT INTO addiction_streaks (user_id, streak, last_checkin) VALUES ($1, $2, $3)",
        [user_id, newStreak, today]
      );
    } else {
      const current = streakRow.rows[0].streak as number;
      newStreak = stayed_clean ? current + 1 : 0;
      await client.query(
        "UPDATE addiction_streaks SET streak = $1, last_checkin = $2 WHERE user_id = $3",
        [newStreak, today, user_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ checkin: checkinResult.rows[0], streak: newStreak });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("POST /addictions/checkins error:", err);
    res.status(500).json({ error: "Failed to save check-in" });
  } finally {
    client.release();
  }
});

export default router;
