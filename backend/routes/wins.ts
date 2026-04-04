import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

// GET /api/wins?userId=1&category=physical (category optional)
router.get("/", async (req: Request, res: Response) => {
  const { userId, category } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    let query = "SELECT * FROM wins WHERE user_id = $1";
    const params: (string | number)[] = [Number(userId)];

    if (category) {
      query += " AND category = $2";
      params.push(String(category));
    }
    query += " ORDER BY created_at ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /wins error:", err);
    res.status(500).json({ error: "Failed to fetch wins" });
  }
});

// POST /api/wins
// Body: { user_id, category, content }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, category, content } = req.body;
  if (!user_id || !category || !content) {
    res.status(400).json({ error: "user_id, category, and content are required" });
    return;
  }

  const valid = ["physical", "mental", "spiritual"];
  if (!valid.includes(category)) {
    res.status(400).json({ error: "category must be physical, mental, or spiritual" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO wins (user_id, category, content) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, category, content]
    );
    // Bump wins counter on user
    await pool.query(
      "UPDATE users SET wins = wins + 1 WHERE id = $1",
      [user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /wins error:", err);
    res.status(500).json({ error: "Failed to create win" });
  }
});

// DELETE /api/wins/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM wins WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Win not found" }); return; }
    res.json({ message: "Win deleted", win: result.rows[0] });
  } catch (err) {
    console.error("DELETE /wins/:id error:", err);
    res.status(500).json({ error: "Failed to delete win" });
  }
});

export default router;
