import React from "react";
import "../App.css";
import Sidebar from "../components/Sidebar";

function Journey() {
  return (
    <div className="app-container">
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <div className="content-container">
          <h2 className="content-title">Your Journey</h2>
          <p className="content-text">
            Track your progress and growth over time
          </p>

          {/* Journey Timeline */}
          <div className="win-section">
            <h3 className="win-section-title">Recent Milestones</h3>
            <div className="win-card">
              <div className="flex flex-col">
                <span className="win-card-text">
                  Started daily meditation practice
                </span>
                <span className="journal-entry-date">March 15, 2024</span>
              </div>
            </div>
            <div className="win-card">
              <div className="flex flex-col">
                <span className="win-card-text">Completed first 5K run</span>
                <span className="journal-entry-date">March 10, 2024</span>
              </div>
            </div>
            <div className="win-card">
              <div className="flex flex-col">
                <span className="win-card-text">Read 10 books this year</span>
                <span className="journal-entry-date">March 5, 2024</span>
              </div>
            </div>

            {/* Add New Milestone */}
            <div className="add-win-card">
              <button className="add-win-plus">+</button>
              <span className="add-win-input">Add a new milestone...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Journey;
