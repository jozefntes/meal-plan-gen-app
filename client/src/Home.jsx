import "./Home.css";
import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import Sidenav from "./components/Sidenav";
import TargetSummary from "./components/TargetSummary";

import { dates, userData } from "./fakedata.json";
import { MAX_WEEK, MIN_WEEK } from "./constants";

import { useEffect, useState } from "react";
import EnergySummary from "./components/EnergySummary";

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

  const [selectedDayMeals, setSelectedDayMeals] = useState(null);
  const [selectedDayProgress, setSelectedDayProgress] = useState(null);

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

  const handleMealDone = (id) => {
    setSelectedDayMeals((prev) =>
      prev.map((meal) =>
        meal.id === id ? { ...meal, done: !meal.done } : meal
      )
    );
  };

  useEffect(() => {
    const selectedDayRecords = dates.find((day) => day.date === selectedDay);

    setSelectedDayMeals(selectedDayRecords ? selectedDayRecords.meals : null);
    setSelectedDayProgress(
      selectedDayRecords ? selectedDayRecords.progress : null
    );
  }, [selectedDay]);

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
          {selectedDayMeals ? (
            selectedDayMeals.map(
              ({ id, time, name, imageURL, protein, carbs, fat, done }) => (
                <MealCard
                  key={id}
                  id={id}
                  time={time}
                  name={name}
                  imageURL={imageURL}
                  protein={protein}
                  carbs={carbs}
                  fat={fat}
                  done={done}
                  onMealDone={handleMealDone}
                />
              )
            )
          ) : (
            <h4>No meals for this day</h4>
          )}
        </ul>

        <div className="summary">
          <TargetSummary progress={selectedDayProgress} userData={userData} />

          <div className="vertical-line" style={{ height: "308px" }}></div>

          <EnergySummary progress={selectedDayProgress} userData={userData} />
        </div>
      </div>
    </>
  );
}
