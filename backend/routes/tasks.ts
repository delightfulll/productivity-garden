import { Router, Request, Response } from "express";
import pool from "../db";

const router = Router();

// GET /api/tasks?userId=1
// GET /api/tasks?userId=1&category=watering
router.get("/", async (req: Request, res: Response) => {
  const { userId, category } = req.query;

  if (!userId) {
    res.status(400).json({ error: "userId query param is required" });
    return;
  }

  try {
    let query = "SELECT * FROM tasks WHERE user_id = $1";
    const params: (string | number)[] = [Number(userId)];

    if (category) {
      query += " AND category = $2";
      params.push(String(category));
    }

    query += " ORDER BY sort_order ASC, created_at ASC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// POST /api/tasks
// Body: { user_id, text, date?, category, sort_order? }
router.post("/", async (req: Request, res: Response) => {
  const { user_id, text, date, category, sort_order } = req.body;

  if (!user_id || !text || !category) {
    res.status(400).json({ error: "user_id, text, and category are required" });
    return;
  }

  const validCategories = ["watering", "sunlight", "composting"];
  if (!validCategories.includes(category)) {
    res.status(400).json({ error: "category must be watering, sunlight, or composting" });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, text, date, category, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, text, date || "No date", category, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id
// Body: { text?, date?, completed?, sort_order? }
router.put("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, date, completed, sort_order } = req.body;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (text !== undefined)       { fields.push(`text = $${idx++}`);       values.push(text); }
  if (date !== undefined)       { fields.push(`date = $${idx++}`);       values.push(date); }
  if (completed !== undefined)  { fields.push(`completed = $${idx++}`);  values.push(completed); }
  if (sort_order !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(sort_order); }

  if (fields.length === 0) {
    res.status(400).json({ error: "No fields provided to update" });
    return;
  }

  values.push(Number(id));

  try {
    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    // Increment tasks_done on the user when a task is completed
    if (completed === true) {
      const task = result.rows[0];
      await pool.query(
        "UPDATE users SET tasks_done = tasks_done + 1 WHERE id = $1",
        [task.user_id]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("PUT /tasks/:id error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [Number(id)]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json({ message: "Task deleted", task: result.rows[0] });
  } catch (err) {
    console.error("DELETE /tasks/:id error:", err);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
