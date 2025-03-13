import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import TargetSummary from "./components/TargetSummary";
import EnergySummary from "./components/EnergySummary";
import { userData } from "./fakedata.json";
import { SERVER_URL, MAX_WEEK, MIN_WEEK } from "./constants";

import "./Home.css";
import PlusIcon from "./icons/PlusIcon";

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
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedDayMeals, setSelectedDayMeals] = useState(null);
  const [selectedDayProgress, setSelectedDayProgress] = useState(null);
  const [loading, setLoading] = useState(true);

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
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;
        // Fetch all meal plans when the component mounts
        fetch(`${SERVER_URL}/api/meal_plans/${uid}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => {
            if (response.status === 404) {
              return [];
            }
            return response.json();
          })
          .then((data) => {
            setMealPlans(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching meal plans:", error);
            setLoading(false);
          });
      }
    })();
  }, []);

  useEffect(() => {
    const selectedDayRecords = mealPlans.find(
      (day) => day.date === selectedDay
    );

    setSelectedDayMeals(selectedDayRecords ? selectedDayRecords.meals : null);
    setSelectedDayProgress(
      selectedDayRecords ? selectedDayRecords.progress : null
    );
  }, [selectedDay, mealPlans]);

  return (
    <>
      <div className="content">
        <div className="header">
          <h4>Personal Meal Plan</h4>
          <a className="btn" href="/generate">
            <PlusIcon />
            <p className="btn-text">Create Plan</p>
          </a>
        </div>

        <DaySelector
          days={days}
          selectedDate={selectedDay}
          onDaySelect={handleDaySelect}
          currentWeek={currentWeek}
        />

        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <ul className="meals">
            {selectedDayMeals ? (
              [...selectedDayMeals]
                .sort((a, b) => a.groupMeal - b.groupMeal)
                .map(({ id, groupMeal, title, image, nutrition, done }) => (
                  <MealCard
                    key={id}
                    id={id}
                    groupMeal={groupMeal}
                    title={title}
                    image={image}
                    nutrition={nutrition}
                    done={done}
                    onMealDone={handleMealDone}
                  />
                ))
            ) : (
              <h4>No meals for this day</h4>
            )}
          </ul>
        )}

        <div className="summary">
          <TargetSummary progress={selectedDayProgress} userData={userData} />

          <div className="vertical-line" style={{ height: "308px" }}></div>

          <EnergySummary progress={selectedDayProgress} userData={userData} />
        </div>
      </div>
    </>
  );
}
