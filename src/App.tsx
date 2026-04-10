import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
import "./styles/App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { StatsProvider } from "./context/StatsContext";
import Auth from "./screens/Auth";
import Home from "./screens/Home";
import Journal from "./screens/Journal";
import Wins from "./screens/Wins";
import Journey from "./screens/Journey";
import Addictions from "./screens/Addictions";
import TimeBlocking from "./screens/timeblocking";
import TimerScreen from "./screens/timerscreen";
import Settings from "./screens/Settings";
import Profile from "./screens/Profile";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a minimal green spinner while restoring session
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6" }}>
        <div style={{ color: "#22c55e", fontSize: "1rem", fontWeight: 500 }}>Loading…</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // While checking session, show nothing (ProtectedRoute handles the spinner)
  if (loading) return null;

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <Auth />}
      />

      {/* Protected */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/wins" element={<ProtectedRoute><Wins /></ProtectedRoute>} />
      <Route path="/journey" element={<ProtectedRoute><Journey /></ProtectedRoute>} />
      <Route path="/addictions" element={<ProtectedRoute><Addictions /></ProtectedRoute>} />
      <Route path="/timeblocking" element={<ProtectedRoute><TimeBlocking /></ProtectedRoute>} />
      <Route path="/timer" element={<ProtectedRoute><TimerScreen /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StatsProvider>
          <ConfirmProvider>
            <AppRoutes />
          </ConfirmProvider>
        </StatsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
