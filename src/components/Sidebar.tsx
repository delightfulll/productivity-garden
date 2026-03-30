import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/App.css";
import logo from "../assets/logo.png";
function Sidebar() {
  return (
    <div className="sidebar">
      <img src={logo} alt="logo" className="logo" />

      {/* Main Navigation */}
      <div className="nav-section">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Daily Garden
        </NavLink>
        <NavLink
          to="/journal"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Journal
        </NavLink>
        <NavLink
          to="/wins"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Wins
        </NavLink>
        <NavLink
          to="/journey"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Journey
        </NavLink>
        <NavLink
          to="/addictions"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Recovery
        </NavLink>
        <NavLink
          to="/timeblocking"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Time Blocking
        </NavLink>
        <NavLink
          to="/timer"
          className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
        >
          Timer
        </NavLink>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-section">
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
          >
            Settings
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-button ${isActive ? "active" : ""}`}
          >
            Profile
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
