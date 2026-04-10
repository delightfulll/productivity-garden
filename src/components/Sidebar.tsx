import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/App.css";
import {
  FaSeedling,
  FaLeaf,
  FaBook,
  FaTrophy,
  FaRoute,
  FaHeart,
  FaTh,
  FaStopwatch,
  FaCog,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";

function Sidebar() {
  const { logout } = useAuth();
  const { confirm } = useConfirm();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const ok = await confirm({
      title: "Sign out?",
      message: "You will need to sign in again to access your garden.",
      confirmLabel: "Sign out",
    });
    if (!ok) return;
    logout();
    navigate("/auth");
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `nav-button ${isActive ? "active" : ""}`;

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon-wrap" aria-hidden>
          <FaSeedling className="sidebar-brand-icon" />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">Productivity Garden</span>
          <span className="sidebar-brand-sub">Your daily growth</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="App sections">
        <p className="sidebar-section-label">Garden</p>
        <div className="nav-section">
          <NavLink to="/" end className={navClass}>
            <FaLeaf className="nav-button-icon" aria-hidden />
            <span>Daily Garden</span>
          </NavLink>
          <NavLink to="/journal" className={navClass}>
            <FaBook className="nav-button-icon" aria-hidden />
            <span>Journal</span>
          </NavLink>
          <NavLink to="/wins" className={navClass}>
            <FaTrophy className="nav-button-icon" aria-hidden />
            <span>Wins</span>
          </NavLink>
          <NavLink to="/journey" className={navClass}>
            <FaRoute className="nav-button-icon" aria-hidden />
            <span>Journey</span>
          </NavLink>
          <NavLink to="/addictions" className={navClass}>
            <FaHeart className="nav-button-icon" aria-hidden />
            <span>Recovery</span>
          </NavLink>
          <NavLink to="/timeblocking" className={navClass}>
            <FaTh className="nav-button-icon" aria-hidden />
            <span>Time Blocking</span>
          </NavLink>
          <NavLink to="/timer" className={navClass}>
            <FaStopwatch className="nav-button-icon" aria-hidden />
            <span>Timer</span>
          </NavLink>
        </div>
      </nav>

      <div className="bottom-nav">
        <p className="sidebar-section-label">Account</p>
        <div className="nav-section">
          <NavLink to="/settings" className={navClass}>
            <FaCog className="nav-button-icon" aria-hidden />
            <span>Settings</span>
          </NavLink>
          <NavLink to="/profile" className={navClass}>
            <FaUser className="nav-button-icon" aria-hidden />
            <span>Profile</span>
          </NavLink>
          <button type="button" className="nav-button nav-button-signout" onClick={handleLogout}>
            <FaSignOutAlt className="nav-button-icon" aria-hidden />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
