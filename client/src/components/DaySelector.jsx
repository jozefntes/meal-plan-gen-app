import { MAX_WEEK, MIN_WEEK } from "../constants";

import "./DaySelector.css";

export default function DaySelector({
  days,
  selectedDate,
  onDaySelect,
  currentWeek,
}) {
  return (
    <ul className="day-selector">
      <li
        style={{ visibility: currentWeek <= MIN_WEEK ? "hidden" : "visible" }}
      >
        <button onClick={() => onDaySelect("prev")}>
          <img src="/icons/chevron-left.svg" />
        </button>
      </li>
      {days.map((day, index) => (
        <li key={index} className={day.date === selectedDate ? "selected" : ""}>
          <button onClick={() => onDaySelect(day.date)}>
            <p className="body-l">
              {day.name}
              <span className="body-s">{day.date}</span>
            </p>
          </button>
        </li>
      ))}
      <li
        style={{ visibility: currentWeek >= MAX_WEEK ? "hidden" : "visible" }}
      >
        <button onClick={() => onDaySelect("next")}>
          <img src="/icons/chevron-right.svg" />
        </button>
      </li>
    </ul>
  );
}
