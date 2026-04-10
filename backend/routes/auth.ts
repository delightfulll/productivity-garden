import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db/db";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const SALT_ROUNDS = 12;

function signToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });
}

// POST /api/auth/register
// Body: { name, email, password }
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
    if (existing.rowCount && existing.rowCount > 0) {
      res.status(409).json({ error: "An account with this email already exists" });
      return;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), email.toLowerCase().trim(), password_hash]
    );

    const user = result.rows[0];
    const token = signToken(user.id);

    res.status(201).json({ token, user });
  } catch (err) {
    console.error("POST /auth/register error:", err);
    res.status(500).json({ error: "Failed to register" });
  }
});

// POST /api/auth/login
// Body: { email, password }
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [email.toLowerCase().trim()]
    );

    if (!result.rowCount || result.rowCount === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const token = signToken(user.id);
    const { password_hash: _, ...safeUser } = user;

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("POST /auth/login error:", err);
    res.status(500).json({ error: "Failed to log in" });
  }
});

// GET /api/auth/me  (requires token)
router.get("/me", requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.userId]
    );

    if (!result.rowCount || result.rowCount === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("GET /auth/me error:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

export default router;
