import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/App.css";

type Value = Date | [Date, Date] | null;

const CalendarGrid = () => {
  const [date, setDate] = useState<Value>(new Date());

  const goToYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setDate(yesterday);
  };

  const goToToday = () => {
    const today = new Date();
    if (date instanceof Date && date.toDateString() === today.toDateString()) {
      return;
    }
    setDate(today);
  };

  const goToTomorrow = () => {
    //only be able to press it once a day
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      date instanceof Date &&
      date.toDateString() === tomorrow.toDateString()
    ) {
      return;
    }
    setDate(tomorrow);
  };

  const isYesterday =
    date instanceof Date &&
    date.toDateString() === (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d; })().toDateString();

  const isToday =
    date instanceof Date &&
    date.toDateString() === new Date().toDateString();

  const isTomorrow =
    date instanceof Date &&
    date.toDateString() === (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })().toDateString();

  return (
    <div className="calendar-grid-wrapper">
      <Calendar
        className="react-calendar"
        tileClassName="react-calendar__tile"
        value={date}
        onChange={(value) => setDate(value as Value)}
        showNavigation={true}
        showDoubleView={false}
        formatShortWeekday={(locale, date) =>
          date.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2)
        }
      />
      <div className="calendar-controls">
        <button className={isYesterday ? "active" : ""} onClick={goToYesterday}>Yesterday</button>
        <button className={isToday ? "active" : ""} onClick={goToToday}>Today</button>
        <button className={isTomorrow ? "active" : ""} onClick={goToTomorrow}>Tomorrow</button>
      </div>
    </div>
  );
};

export default CalendarGrid;
