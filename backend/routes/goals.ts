import { Router, Request, Response } from "express";
import pool from "../db/db";

const router = Router();

// Returns all goals for a user, ordered oldest-first
router.get("/", async (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) { res.status(400).json({ error: "userId is required" }); return; }

  try {
    const result = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at ASC",
      [Number(userId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("GET /goals error:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// Creates a new goal; description and target_date default to empty string if omitted
router.post("/", async (req: Request, res: Response) => {
  const { user_id, title, description, target_date } = req.body;
  if (!user_id || !title) { res.status(400).json({ error: "user_id and title are required" }); return; }

  try {
    const result = await pool.query(
      `INSERT INTO goals (user_id, title, description, target_date)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_id, title, description || "", target_date || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /goals error:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// Partially updates a goal — only fields present in the request body are modified
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, target_date, achieved } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (title !== undefined)       { fields.push(`title = $${idx++}`);       values.push(title); }
  if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
  if (target_date !== undefined) { fields.push(`target_date = $${idx++}`); values.push(target_date); }
  if (achieved !== undefined)    { fields.push(`achieved = $${idx++}`);    values.push(achieved); }

  if (fields.length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

  values.push(Number(id));
  try {
    const result = await pool.query(
      `UPDATE goals SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );
    if (result.rowCount === 0) { res.status(404).json({ error: "Goal not found" }); return; }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /goals/:id error:", err);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// Deletes a goal and returns the deleted record for confirmation
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM goals WHERE id = $1 RETURNING *", [Number(id)]);
    if (result.rowCount === 0) { res.status(404).json({ error: "Goal not found" }); return; }
    res.json({ message: "Goal deleted", goal: result.rows[0] });
  } catch (err) {
    console.error("DELETE /goals/:id error:", err);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

export default router;
