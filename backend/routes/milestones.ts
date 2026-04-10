import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

// GET /api/milestones?userId=1&horizon=long|mid|short (horizon is optional)
router.get("/", async (req: Request, res: Response) => {
  const { userId, horizon } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = horizon
      ? await pool.query(
          "SELECT * FROM milestones WHERE user_id = $1 AND horizon = $2 ORDER BY created_at ASC",
          [Number(userId), horizon]
        )
      : await pool.query(
          "SELECT * FROM milestones WHERE user_id = $1 ORDER BY created_at ASC",
          [Number(userId)]
        );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /milestones error:", err);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

// POST /api/milestones
// Body: { user_id, title, horizon, description?, target_date? }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, title, horizon, description, target_date } = req.body;
  if (!user_id || !title || !horizon) {
    res.status(400).json({ error: "user_id, title, and horizon are required" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO milestones (user_id, title, horizon, description, target_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [user_id, title, horizon, description || "", target_date || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /milestones error:", err);
    res.status(500).json({ error: "Failed to create milestone" });
  }
});


// PUT /api/milestones/:id
// Body: { title?, description?, target_date?, achieved?, horizon? }
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, target_date, achieved, horizon } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (title !== undefined)       { fields.push(`title = $${idx++}`);       values.push(title); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (target_date !== undefined) { fields.push(`target_date = $${idx++}`); values.push(target_date); }
  if (achieved !== undefined)    { fields.push(`achieved = $${idx++}`);    values.push(achieved); }
  if (horizon !== undefined)     { fields.push(`horizon = $${idx++}`);     values.push(horizon); }

  if (fields.length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  values.push(Number(id));
  try {
    const result = await pool.query(
      `UPDATE milestones SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Milestone not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /milestones/:id error:", err);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

// DELETE /api/milestones/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM milestones WHERE id = $1 RETURNING *",
      [Number(id)]
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Milestone not found" }); return; }
    res.json({ message: "Milestone deleted", milestone: result.rows[0] });
  } catch (err) {
    console.error("DELETE /milestones/:id error:", err);
    res.status(500).json({ error: "Failed to delete milestone" });
  }
});

export default router;
