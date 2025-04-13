import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import TargetSummary from "./components/TargetSummary";
import EnergySummary from "./components/EnergySummary";
import { SERVER_URL, MAX_WEEK, MIN_WEEK } from "./constants";

import "./Home.css";
import PlusIcon from "./icons/PlusIcon";

const defaultRecipe = {
  title: "Unavailable",
  image: "/images/placeholder.webp",
  done: false,
  nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
};

export default function Home() {
  const today = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [selectedDay, setSelectedDay] = useState(today);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [userData, setUserData] = useState({});
  const [selectedDayMeals, setSelectedDayMeals] = useState(null);
  const [selectedDayProgress, setSelectedDayProgress] = useState(null);
  const [invertedIndex, setInvertedIndex] = useState({});
  const [loading, setLoading] = useState(true);

  const getFormattedDate = (date) => date.toISOString().split("T")[0];

  const generateDays = (weekOffset) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const baseDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    );

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + i + weekOffset * 7);
      const dayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const dayDate = getFormattedDate(date);
      const displayDate = date.toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      days.push({ name: dayName, date: dayDate, displayDate });
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
      setSelectedDay(getFormattedDate(new Date(date)));
    }
  };

  const handleMealDone = (mealInstanceId) => {
    setSelectedDayMeals((prev) =>
      prev.map((meal) =>
        meal.mealInstanceId === mealInstanceId
          ? { ...meal, done: !meal.done }
          : meal
      )
    );
  };

  const updateRecipeId = (prevId, newId) => {
    setMealPlans((prev) =>
      prev.map((day) =>
        day.date === selectedDay
          ? {
              ...day,
              meals: day.meals.map((meal) =>
                meal.id === prevId ? { ...meal, id: newId } : meal
              ),
            }
          : day
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

            // Add unique mealInstanceId to each meal
            mealPlans?.forEach((day) => {
              day.meals?.forEach((meal, index) => {
                meal.mealInstanceId = `${meal.id}-${index}-${day.date}`;
              });
            });
          }

          // Extract unique recipe IDs from meal plans
          const mealRecipeIds = new Set();
          mealPlans?.forEach((day) =>
            day.meals?.forEach((meal) => mealRecipeIds.add(meal.id))
          );

          // Process recipes response
          let recipeList = [];
          if (recipesResponse.status !== 404) {
            recipeList = await recipesResponse.json();
          }

          // Update state
          setMealPlans(mealPlans);
          setRecipes(recipeList);
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
    console.log("Updating selectedDayMeals:", {
      selectedDay,
      mealPlans,
      recipes,
    });
    const selectedDayRecords = mealPlans.find(
      (day) => day.date === selectedDay
    );

    if (selectedDayRecords) {
      const mealsWithRecipes = selectedDayRecords.meals.map((meal) => {
        const recipe = recipes.find((r) => r.id === meal.id);

        return recipe
          ? {
              ...meal,
              ...recipe,
            }
          : { ...meal, defaultRecipe };
      });

      setSelectedDayMeals(mealsWithRecipes);
      setSelectedDayProgress(selectedDayRecords.progress);
    } else {
      setSelectedDayMeals(null);
      setSelectedDayProgress(null);
    }
  }, [selectedDay, mealPlans, recipes]);

  useEffect(() => {
    if (recipes.length > 0) {
      const index = buildInvertedIndex(recipes);
      setInvertedIndex(index);
    }
  }, [recipes]);

  const buildInvertedIndex = (recipes) => {
    const ingredientIndex = {};

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ingredient) => {
        if (!ingredientIndex[ingredient]) {
          ingredientIndex[ingredient] = [];
        }
        ingredientIndex[ingredient].push(recipe.id);
      });
    });

    return ingredientIndex;
  };

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
          <h4>Loading...</h4>
        ) : (
          <ul className="meals">
            {selectedDayMeals ? (
              [...selectedDayMeals].map((meal, index) => (
                <MealCard
                  key={meal.mealInstanceId}
                  id={meal.id}
                  mealGroup={index + 1}
                  meal={meal}
                  date={selectedDay}
                  onMealDone={handleMealDone}
                  allRecipes={recipes}
                  applicationContext="home"
                  onReplaceRecipeId={updateRecipeId}
                  invertedIndex={invertedIndex}
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
