import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSeedling } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/App.css";

const BASE = "http://localhost:3000";

type Mode = "login" | "register";

function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const switchMode = (next: Mode) => {
    reset();
    setMode(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      login(data.token, data.user);
      navigate("/");
    } catch {
      setError("Could not connect to the server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          {/* Logo */}
          <div className="auth-logo">
            <FaSeedling className="auth-logo-icon" />
            <span className="auth-logo-text">Productivity Garden</span>
          </div>

          <h1 className="auth-heading">
            {mode === "login" ? "Welcome back" : "Create your garden"}
          </h1>
          <p className="auth-subheading">
            {mode === "login"
              ? "Sign in to continue growing"
              : "Start your productivity journey"}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {mode === "register" && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="auth-name">Name</label>
                <input
                  id="auth-name"
                  className="auth-input"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={mode === "login"}
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                className="auth-input"
                type="password"
                placeholder={mode === "register" ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          <hr className="auth-divider" />

          <p className="auth-toggle">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              className="auth-toggle-btn"
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Auth;
