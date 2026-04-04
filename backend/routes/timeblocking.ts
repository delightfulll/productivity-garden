import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

// GET /api/timeblocking?userId=1&date=2026-04-02
router.get("/", async (req: Request, res: Response) => {
  const { userId, date } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    let query = "SELECT * FROM time_blocking_events WHERE user_id = $1";
    const params: (string | number)[] = [Number(userId)];

    if (date) {
      query += " AND event_date = $2";
      params.push(String(date));
    }
    query += " ORDER BY slot_id ASC, created_at ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /timeblocking error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/timeblocking
// Body: { user_id, slot_id, title, description?, color?, event_date? }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, slot_id, title, description, color, event_date } = req.body;
  if (!user_id || !slot_id || !title) {
    res.status(400).json({ error: "user_id, slot_id, and title are required" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO time_blocking_events (user_id, slot_id, title, description, color, event_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, slot_id, title, description || "", color || "", event_date || new Date().toISOString().split("T")[0]]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /timeblocking error:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// DELETE /api/timeblocking/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM time_blocking_events WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Event not found" }); return; }
    res.json({ message: "Event deleted", event: result.rows[0] });
  } catch (err) {
    console.error("DELETE /timeblocking/:id error:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

export default router;
