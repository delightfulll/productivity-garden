import { Router, Request, Response } from "express";
import pool from "../db/db";
import { awardXP, revokeXP } from "../db/xp";
import { requireAuth, AuthRequest } from "../middleware/auth";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Normalize stored task date to YYYY-MM-DD (local). */
function normalizeTaskDate(raw: string | null | undefined): string {
  const t = (raw ?? "").trim();
  if (!t || t === "No date") {
    return formatLocalDate(new Date());
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    return t;
  }
  const p = new Date(t);
  if (!Number.isNaN(p.getTime())) {
    return formatLocalDate(p);
  }
  return formatLocalDate(new Date());
}

function nextDayKey(fromIso: string): string {
  const [y, mo, d] = fromIso.split("-").map(Number);
  const dt = new Date(y, mo - 1, d, 12, 0, 0, 0);
  dt.setDate(dt.getDate() + 1);
  return formatLocalDate(dt);
}

const XP_BY_CATEGORY: Record<string, number> = {
  watering: 25,
  sunlight: 20,
  composting: 10,
};

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

// POST /api/tasks/auto-rollover  (Authorization: Bearer — user id from token)
// Moves all incomplete past-dated tasks for the user to today's date.
router.post("/auto-rollover", requireAuth, async (req: AuthRequest, res: Response) => {
  const uid = req.userId;

  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const todayKey = formatLocalDate(new Date());

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET date = $1
       WHERE user_id = $2
         AND completed = FALSE
         AND date ~ '^\\d{4}-\\d{2}-\\d{2}$'
         AND date < $1
       RETURNING *`,
      [todayKey, uid],
    );
    res.json(result.rows);
  } catch (err) {
    console.error("POST /tasks/auto-rollover error:", err);
    res.status(500).json({ error: "Failed to auto-rollover tasks" });
  }
});

// POST /api/tasks/:id/rollover  (Authorization: Bearer — user id from token)
// Moves task to the next calendar day, keeping all other tasks on that day intact.
router.post("/:id/rollover", requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const uid = req.userId;

  if (!uid) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const taskId = Number(id);
  if (!taskId || Number.isNaN(taskId)) {
    res.status(400).json({ error: "Invalid task id" });
    return;
  }

  try {
    const found = await pool.query(
      "SELECT * FROM tasks WHERE id = $1 AND user_id = $2",
      [taskId, uid],
    );
    if (!found.rows?.length) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const task = found.rows[0] as { date: string };
    const fromKey = normalizeTaskDate(task.date);
    const destKey = nextDayKey(fromKey);

    const updated = await pool.query(
      `UPDATE tasks
       SET date = $1, sort_order = 0, completed = false
       WHERE id = $2
       RETURNING *`,
      [destKey, taskId],
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error("POST /tasks/:id/rollover error:", err);
    res.status(500).json({ error: "Failed to roll task over" });
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
    const before = await pool.query("SELECT * FROM tasks WHERE id = $1", [Number(id)]);
    if (before.rowCount === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    const wasCompleted = Boolean(before.rows[0].completed);

    const result = await pool.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values
    );

    const task = result.rows[0];
    const xpDelta = XP_BY_CATEGORY[task.category] ?? 10;

    // Only adjust stats / XP when completion actually crosses (avoids double-counting)
    if (completed === true && !wasCompleted) {
      await pool.query(
        "UPDATE users SET tasks_done = tasks_done + 1 WHERE id = $1",
        [task.user_id],
      );
      try {
        await awardXP(task.user_id, xpDelta);
      } catch (xpErr) {
        console.error("awardXP failed (non-fatal):", xpErr);
      }
    } else if (completed === false && wasCompleted) {
      await pool.query(
        "UPDATE users SET tasks_done = GREATEST(tasks_done - 1, 0) WHERE id = $1",
        [task.user_id],
      );
      try {
        await revokeXP(task.user_id, xpDelta);
      } catch (xpErr) {
        console.error("revokeXP failed (non-fatal):", xpErr);
      }
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
