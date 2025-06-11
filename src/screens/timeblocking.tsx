import React from "react";
import Sidebar from "../components/Sidebar";

const TimeBlocking = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-container">
          <h2 className="content-title">TimeBlocking</h2>
          <p className="content-text">Block your time and get things done</p>
          <div className="time-blocking-container">
            <div className="time-blocking-item">
              <h3>Time Block 1</h3>
              <p>10:00 AM - 11:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeBlocking;
