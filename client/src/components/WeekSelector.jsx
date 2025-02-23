import "./WeekSelector.css";

export default function WeekSelector({ selectedWeek, onWeekSelect }) {
  const weeks = [
    "This Week",
    "Next Week",
    "Week After Next",
    "Three Weeks Out",
  ];

  return (
    <ul className="week-selector">
      {weeks.map((week, index) => (
        <li
          key={index}
          className={`week-selector__btn ${
            selectedWeek === index ? "selected" : ""
          }`}
        >
          <button onClick={() => onWeekSelect(index)}>
            <p className="body-l">{week}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
