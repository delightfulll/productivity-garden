import { Router, Request, Response } from "express";
import pool from "../db/db";
import { awardXP } from "../db/xp";

const router = Router();

// GET /api/journal?userId=1
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = await pool.query(
      "SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY created_at DESC",
      [Number(userId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /journal error:", err);
    res.status(500).json({ error: "Failed to fetch journal entries" });
  }
});

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

// POST /api/journal
// Body: { user_id, entry, entry_date? } — entry_date is YYYY-MM-DD (calendar day in the user's UI)
router.post("/", async (req: Request, res: Response) => {
  const { user_id, entry, entry_date: rawDate } = req.body;
  if (!user_id || !entry) { res.status(400).json({ error: "user_id and entry are required" }); return; }

  let entry_date: string;
  if (rawDate != null && rawDate !== "") {
    if (typeof rawDate !== "string" || !DATE_KEY.test(rawDate)) {
      res.status(400).json({ error: "entry_date must be YYYY-MM-DD" });
      return;
    }
    entry_date = rawDate;
  } else {
    entry_date = new Date().toISOString().slice(0, 10);
  }

  try {
    const result = await pool.query(
      `INSERT INTO journal_entries (user_id, entry, entry_date) VALUES ($1, $2, $3::date) RETURNING *`,
      [user_id, entry, entry_date]
    );
    await pool.query("UPDATE users SET journal_count = journal_count + 1 WHERE id = $1", [user_id]);
    await awardXP(user_id, 15);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /journal error:", err);
    res.status(500).json({ error: "Failed to create journal entry" });
  }
});

// PUT /api/journal/:id
// Body: { entry }
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { entry } = req.body;
  if (!entry) { res.status(400).json({ error: "entry is required" }); return; }

  try {
    const result = await pool.query(
      "UPDATE journal_entries SET entry = $1 WHERE id = $2 RETURNING *",
      [entry, Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Entry not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /journal/:id error:", err);
    res.status(500).json({ error: "Failed to update journal entry" });
  }
});

// DELETE /api/journal/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM journal_entries WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Entry not found" }); return; }
    await pool.query(
      "UPDATE users SET journal_count = GREATEST(journal_count - 1, 0) WHERE id = $1",
      [result.rows[0].user_id],
    );
    res.json({ message: "Entry deleted", entry: result.rows[0] });
  } catch (err) {
    console.error("DELETE /journal/:id error:", err);
    res.status(500).json({ error: "Failed to delete journal entry" });
  }
});

export default router;
