import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const BASE = "http://localhost:3000";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pg_token");
    if (!saved) {
      setLoading(false);
      return;
    }

    fetch(`${BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${saved}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("invalid token");
        return res.json();
      })
      .then((u: AuthUser) => {
        setToken(saved);
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem("pg_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((t: string, u: AuthUser) => {
    localStorage.setItem("pg_token", t);
    setToken(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pg_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
