import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import TargetSummary from "./components/TargetSummary";
import EnergySummary from "./components/EnergySummary";
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
  const [recipes, setRecipes] = useState([]);
  const [userData, setUserData] = useState();
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

        try {
          // Fetch meal plans and recipes in parallel
          const [mealPlansResponse, recipesResponse] = await Promise.all([
            fetch(`${SERVER_URL}/api/meal_plans/${uid}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }),
            fetch(`${SERVER_URL}/api/recipes/${uid}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }),
          ]);

          // Process meal plans response
          let mealPlans = [];
          if (mealPlansResponse.status !== 404) {
            mealPlans = await mealPlansResponse.json();
          }

          // Extract unique recipe IDs from meal plans
          const mealRecipeIds = new Set();
          mealPlans?.forEach((day) =>
            day.meals?.forEach((meal) => mealRecipeIds.add(meal.id))
          );

          // Process recipes response
          let recipes = [];
          if (recipesResponse.status !== 404) {
            recipes = await recipesResponse.json();
          }

          // Filter recipes to only include the ones in meal plans
          const filteredRecipes = recipes.filter((recipe) =>
            mealRecipeIds.has(recipe.id)
          );

          // Update state
          setMealPlans(mealPlans);
          setRecipes(filteredRecipes);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;

        fetch(`${SERVER_URL}/api/users/${uid}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => response.json())
          .then((data) => {
            setUserData(data);
          })
          .catch((error) => console.error("Error fetching user data:", error));
      }
    })();
  }, []);

  useEffect(() => {
    const selectedDayRecords = mealPlans.find(
      (day) => day.date === selectedDay
    );

    if (selectedDayRecords) {
      const mealsWithRecipes = selectedDayRecords.meals.map((meal) => {
        const recipe = recipes.find((r) => r.id === meal.id);
        const defaultRecipe = {
          title: "Recipe Deleted",
          image: null,
          nutrition: null,
        };

        return recipe ? { ...meal, ...recipe } : defaultRecipe;
      });

      setSelectedDayMeals(mealsWithRecipes);
      setSelectedDayProgress(selectedDayRecords.progress);
    } else {
      setSelectedDayMeals(null);
      setSelectedDayProgress(null);
    }
  }, [selectedDay, mealPlans, recipes]);

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
                .sort((a, b) => a.mealGroup - b.mealGroup)
                .map(({ id, mealGroup, title, image, nutrition, done }) => (
                  <MealCard
                    key={id}
                    id={id}
                    mealGroup={mealGroup}
                    title={title}
                    image={image}
                    nutrition={
                      nutrition ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
                    }
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
