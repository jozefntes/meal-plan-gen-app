import "./Home.css";
import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import Sidenav from "./components/Sidenav";

import fakeData from "./fakeData";
import { MAX_WEEK, MIN_WEEK } from "./constants";

import { useState } from "react";

export default function Home() {
  const getFormattedDate = (date) => {
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  const today = getFormattedDate(new Date());

  const [selectedDay, setSelectedDay] = useState(today);
  const [currentWeek, setCurrentWeek] = useState(0);

  const generateDays = (weekOffset) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const baseDate = new Date(now);
    baseDate.setDate(now.getDate() - dayOfWeek + 1);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i + weekOffset * 7);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const dayDate = getFormattedDate(date);
      days.push({ name: dayName, date: dayDate });
    }
    return days;
  };

  const days = generateDays(currentWeek);

  const handleDaySelect = (date) => {
    if (date === "prev") {
      setCurrentWeek((prev) => Math.max(prev - 1, MIN_WEEK));
    } else if (date === "next") {
      setCurrentWeek((prev) => Math.min(prev + 1, MAX_WEEK));
    } else {
      setSelectedDay(date);
    }
  };

  return (
    <>
      <Sidenav />

      <div className="content">
        <div className="header">
          <h4>Personal Meal Plan</h4>
          <button className="btn">
            <img src="../icons/plus-btn.svg" />
            <p className="btn-text">Create Plan</p>
          </button>
        </div>

        <DaySelector
          days={days}
          selectedDate={selectedDay}
          onDaySelect={handleDaySelect}
          currentWeek={currentWeek}
        />

        <ul className="meals">
          {fakeData.map(({ id, time, name, imageURL, protein, carbs, fat }) => (
            <MealCard
              key={id}
              id={id}
              time={time}
              name={name}
              imageURL={imageURL}
              protein={protein}
              carbs={carbs}
              fat={fat}
            />
          ))}
        </ul>

        <div className="summary">
          <div className="targets-smry">
            <h6>Targets</h6>
            <div className="target">
              <p className="body-s">Energy</p>
              <div className="progress-container">
                <div className="progress-info">
                  <p className="body-s">1,041.4 / 2,012 kcal</p>
                  <p className="body-s">52%</p>
                </div>
                <div className="progress-bar">
                  <div className="progress energy"></div>
                </div>
              </div>
            </div>
            <div className="target">
              <p className="body-s">Protein</p>
              <div className="progress-container">
                <div className="progress-info">
                  <p className="body-s">70.9 / 150.9 g</p>
                  <p className="body-s">47%</p>
                </div>
                <div className="progress-bar">
                  <div className="progress protein"></div>
                </div>
              </div>
            </div>
            <div className="target">
              <p className="body-s">Net Carbs</p>
              <div className="progress-container">
                <div className="progress-info">
                  <p className="body-s">76.5 / 201.2 g</p>
                  <p className="body-s">38%</p>
                </div>
                <div className="progress-bar">
                  <div className="progress carbs"></div>
                </div>
              </div>
            </div>
            <div className="target">
              <p className="body-s">Fat</p>
              <div className="progress-container">
                <div className="progress-info">
                  <p className="body-s">50.2 / 67.1 g</p>
                  <p className="body-s">75%</p>
                </div>
                <div className="progress-bar">
                  <div className="progress fat"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="vertical-line"></div>

          <div className="energy-smry">
            <h6>Energy Summary</h6>
            <div className="charts">
              <div className="pie-chart-container">
                <div className="pie-chart consumed"></div>
                <div className="pie-chart-text">
                  <p className="btn-text">
                    1,041 <span>kcal</span>
                  </p>
                </div>
                <p className="body-m">Consumed</p>
              </div>
              <div className="pie-chart-container">
                <div className="pie-chart remaining"></div>
                <div className="pie-chart-text">
                  <p className="btn-text">
                    970 <span>kcal</span>
                  </p>
                </div>
                <p className="body-m">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
