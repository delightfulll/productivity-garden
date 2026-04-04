import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

// POST /api/users
// Body: { name, bio?, focus_areas? }
router.post("/", async (req: Request, res: Response) => {
  const { name, bio, focus_areas } = req.body;

  if (!name) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO users (name, bio, focus_areas)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, bio || "", focus_areas || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /users error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [Number(id)]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /users/:id error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// PUT /api/users/:id
// Body: { name?, bio?, focus_areas? }
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, bio, focus_areas } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined)         { fields.push(`name = $${idx++}`);         values.push(name); }
  if (bio !== undefined)          { fields.push(`bio = $${idx++}`);           values.push(bio); }
  if (focus_areas !== undefined)  { fields.push(`focus_areas = $${idx++}`);   values.push(focus_areas); }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields provided to update" });
    return;
  }

  values.push(Number(id));

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /users/:id error:", err);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// GET /api/users/:id/stats
router.get("/:id/stats", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userResult = await pool.query(
      `SELECT streak, tasks_done, wins, journal_count, garden_level, xp, xp_max
       FROM users WHERE id = $1`,
      [Number(id)]
    );

    if (userResult.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Live task counts grouped by category and completion
    const taskResult = await pool.query(
      `SELECT
         category,
         COUNT(*)                            AS total,
         COUNT(*) FILTER (WHERE completed)   AS completed
       FROM tasks
       WHERE user_id = $1
       GROUP BY category`,
      [Number(id)]
    );

    res.json({
      ...userResult.rows[0],
      task_summary: taskResult.rows,
    });
  } catch (err) {
    console.error("GET /users/:id/stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// PUT /api/users/:id/stats
// Body: { streak?, wins?, journal_count?, garden_level?, xp?, xp_max? }
router.put("/:id/stats", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { streak, wins, journal_count, garden_level, xp, xp_max } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (streak !== undefined)        { fields.push(`streak = $${idx++}`);        values.push(streak); }
  if (wins !== undefined)          { fields.push(`wins = $${idx++}`);           values.push(wins); }
  if (journal_count !== undefined) { fields.push(`journal_count = $${idx++}`);  values.push(journal_count); }
  if (garden_level !== undefined)  { fields.push(`garden_level = $${idx++}`);   values.push(garden_level); }
  if (xp !== undefined)            { fields.push(`xp = $${idx++}`);             values.push(xp); }
  if (xp_max !== undefined)        { fields.push(`xp_max = $${idx++}`);         values.push(xp_max); }

  if (fields.length === 0) {
    res.status(400).json({ error: "No stat fields provided to update" });
    return;
  }

  values.push(Number(id));

  try {
    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /users/:id/stats error:", err);
    res.status(500).json({ error: "Failed to update stats" });
  }
});

export default router;
