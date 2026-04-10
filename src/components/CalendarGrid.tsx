import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/App.css";
import { useDayParam } from "../hooks/useDayParam";
import { formatLocalDayKey } from "../lib/dateUtils";

type Value = Date | [Date, Date] | null;

const CalendarGrid = () => {
  const { dayKey, selectedDate, setDayFromDate } = useDayParam();

  const todayKey = formatLocalDayKey(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterdayKey = formatLocalDayKey(yesterday);
  const tomorrowKey = formatLocalDayKey(tomorrow);

  const goToYesterday = () => {
    setDayFromDate(yesterday);
  };

  const goToToday = () => {
    setDayFromDate(new Date());
  };

  const goToTomorrow = () => {
    setDayFromDate(tomorrow);
  };

  const isYesterday = dayKey === yesterdayKey;
  const isToday = dayKey === todayKey;
  const isTomorrow = dayKey === tomorrowKey;

  return (
    <div className="calendar-grid-wrapper">
      <Calendar
        className="react-calendar"
        tileClassName="react-calendar__tile"
        value={selectedDate}
        onChange={(value) => setDayFromDate(value as Date)}
        showNavigation={true}
        showDoubleView={false}
        formatShortWeekday={(locale, date) =>
          date.toLocaleDateString(locale, { weekday: "short" }).slice(0, 2)
        }
      />
      <div className="calendar-controls">
        <button type="button" className={isYesterday ? "active" : ""} onClick={goToYesterday}>
          Yesterday
        </button>
        <button type="button" className={isToday ? "active" : ""} onClick={goToToday}>
          Today
        </button>
        <button type="button" className={isTomorrow ? "active" : ""} onClick={goToTomorrow}>
          Tomorrow
        </button>
      </div>
    </div>
  );
};

export default CalendarGrid;
