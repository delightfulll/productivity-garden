import React, { useState } from "react";
import "../styles/App.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CalendarGrid from "./CalendarGrid";

const CustomCalendar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="calendar-collapsible">
      <div className="calendar-header" onClick={() => setIsOpen(!isOpen)}>
        <span>Calendar</span>
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {isOpen && <CalendarGrid />}
    </div>
  );
};

export default CustomCalendar;
