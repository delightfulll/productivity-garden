import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type Value = Date | [Date, Date] | null;

// Custom Calendar component
const CustomCalendar = () => {
  const [date, setDate] = useState<Value>(new Date());

  const goToYesterday = () => {
    if (date instanceof Date) {
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      setDate(d);
    }
  };

  const goToToday = () => setDate(new Date());

  const goToTomorrow = () => {
    if (date instanceof Date) {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      setDate(d);
    }
  };

  return (
    <div className="calendar-container">
      <Calendar
        className="react-calendar"
        tileClassName="react-calendar__tile"
        value={date}
        onChange={(value) => setDate(value as Value)}
      />
      <div
        className="calendar-controls"
        style={{
          marginTop: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <button
          onClick={() => {
            goToYesterday();
          }}
        >
          Yesterday
        </button>
        <button
          onClick={() => {
            goToToday();
          }}
        >
          Today
        </button>
        <button
          onClick={() => {
            goToTomorrow();
          }}
        >
          Tomorrow
        </button>
      </div>
    </div>
  );
};

export default CustomCalendar;
