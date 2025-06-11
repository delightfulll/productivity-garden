import React from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h1 className="sidebar-title">Productivity Garden</h1>

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
          TimeBlocking
        </NavLink>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <div className="nav-section">
          <button className="nav-button">Settings</button>
          <button className="nav-button">Profile</button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
