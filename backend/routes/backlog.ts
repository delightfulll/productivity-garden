import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /api/backlog?userId=1
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = await pool.query(
      "SELECT * FROM backlog_tasks WHERE user_id = $1 ORDER BY created_at ASC",
      [Number(userId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /backlog error:", err);
    res.status(500).json({ error: "Failed to fetch backlog" });
  }
});

// POST /api/backlog
// Body: { user_id, text, note? }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, text, note } = req.body;
  if (!user_id || !text) { res.status(400).json({ error: "user_id and text are required" }); return; }

  try {
    const result = await pool.query(
      `INSERT INTO backlog_tasks (user_id, text, note) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, text, note || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /backlog error:", err);
    res.status(500).json({ error: "Failed to create backlog task" });
  }
});

// DELETE /api/backlog/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM backlog_tasks WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Backlog task not found" }); return; }
    res.json({ message: "Backlog task deleted", task: result.rows[0] });
  } catch (err) {
    console.error("DELETE /backlog/:id error:", err);
    res.status(500).json({ error: "Failed to delete backlog task" });
  }
});

export default router;
