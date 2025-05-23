import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import page from "page";

import DaySelector from "./components/DaySelector";
import MealCard from "./components/MealCard";
import TargetSummary from "./components/TargetSummary";
import EnergySummary from "./components/EnergySummary";
import { SERVER_URL, MAX_WEEK, MIN_WEEK } from "./constants";

import "./Home.css";
import SearchIcon from "./icons/SearchIcon";

const defaultRecipe = {
  title: "Unavailable",
  image: "/images/placeholder.webp",
  done: false,
  nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 },
};

export default function Home({ recipes }) {
  const today = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .split("T")[0];

  const [selectedDay, setSelectedDay] = useState(today);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [mealPlans, setMealPlans] = useState([]);
  const [userData, setUserData] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      page(`/myrecipes?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleMealDone = (mealInstanceId) => {
    setSelectedDayMeals((prev) => {
      const updatedMeals = prev.map((meal) =>
        meal.mealInstanceId === mealInstanceId
          ? { ...meal, done: !meal.done }
          : meal
      );

      const updatedMeal = updatedMeals.find(
        (meal) => meal.mealInstanceId === mealInstanceId
      );

      const updateMealStatus = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;

          try {
            const response = await fetch(`${SERVER_URL}/api/meal_done`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
              body: JSON.stringify({
                uid,
                date: selectedDay,
                mealInstanceId: updatedMeal.mealInstanceId,
                done: updatedMeal.done,
              }),
            });

            console.log("Sending meal update:", {
              uid,
              date: selectedDay,
              mealInstanceId: updatedMeal.mealInstanceId,
              done: updatedMeal.done,
            });

            if (!response.ok) {
              throw new Error("Failed to update meal status");
            }

            const data = await response.json();
            console.log("Meal updated successfully:", data);
          } catch (error) {
            console.error("Error updating meal status:", error);
          }
        }
      };

      updateMealStatus();

      const progress = {
        energy: {
          current: updatedMeals.reduce(
            (sum, meal) => sum + (meal.done ? meal.nutrition.calories || 0 : 0),
            0
          ),
          percentage: Math.floor(
            (updatedMeals.reduce(
              (sum, meal) =>
                sum + (meal.done ? meal.nutrition.calories || 0 : 0),
              0
            ) /
              (userData?.targets?.energy || 1)) *
              100
          ),
        },
        protein: {
          current: updatedMeals.reduce(
            (sum, meal) => sum + (meal.done ? meal.nutrition.protein || 0 : 0),
            0
          ),
          percentage: Math.floor(
            (updatedMeals.reduce(
              (sum, meal) =>
                sum + (meal.done ? meal.nutrition.protein || 0 : 0),
              0
            ) /
              (userData?.targets?.protein || 1)) *
              100
          ),
        },
        carbs: {
          current: updatedMeals.reduce(
            (sum, meal) => sum + (meal.done ? meal.nutrition.carbs || 0 : 0),
            0
          ),
          percentage: Math.floor(
            (updatedMeals.reduce(
              (sum, meal) => sum + (meal.done ? meal.nutrition.carbs || 0 : 0),
              0
            ) /
              (userData?.targets?.carbs || 1)) *
              100
          ),
        },
        fat: {
          current: updatedMeals.reduce(
            (sum, meal) => sum + (meal.done ? meal.nutrition.fat || 0 : 0),
            0
          ),
          percentage: Math.floor(
            (updatedMeals.reduce(
              (sum, meal) => sum + (meal.done ? meal.nutrition.fat || 0 : 0),
              0
            ) /
              (userData?.targets?.fat || 1)) *
              100
          ),
        },
      };

      setSelectedDayProgress(progress);

      return updatedMeals;
    });
  };

  const updateRecipeId = (prevMealInstanceId, newId) => {
    let newMealInstanceId = null;

    setMealPlans((prev) =>
      prev.map((day) => {
        if (day.date === selectedDay) {
          return {
            ...day,
            meals: day.meals.map((meal, index) => {
              if (meal.mealInstanceId === prevMealInstanceId) {
                newMealInstanceId = `${newId}-${index}-${day.date}`; // Generate the new mealInstanceId
                return {
                  ...meal,
                  id: newId,
                  mealInstanceId: newMealInstanceId,
                };
              }
              return meal;
            }),
          };
        }
        return day;
      })
    );

    return newMealInstanceId; // Return the new mealInstanceId
  };

  useEffect(() => {
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;

        try {
          const mealPlansResponse = await fetch(
            `${SERVER_URL}/api/meal_plans/${uid}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

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

          setMealPlans(mealPlans);
        } catch (error) {
          console.error("Error fetching meal plans:", error);
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
    if (recipes.length > 0 && mealPlans.length > 0) {
      const selectedDayRecords = mealPlans.find(
        (day) => day.date === selectedDay
      );

      if (selectedDayRecords) {
        const mealsWithRecipes = selectedDayRecords.meals.map((meal) => {
          const recipe = recipes.find((r) => r.id === meal.id);

          return recipe
            ? { ...meal, ...recipe }
            : { ...meal, ...defaultRecipe };
        });

        // Recalculate progress
        const progress = {
          energy: {
            current: mealsWithRecipes.reduce(
              (sum, meal) =>
                sum + (meal.done ? meal.nutrition.calories || 0 : 0),
              0
            ),
            percentage: Math.floor(
              (mealsWithRecipes.reduce(
                (sum, meal) =>
                  sum + (meal.done ? meal.nutrition.calories || 0 : 0),
                0
              ) /
                (userData?.targets?.energy || 1)) *
                100
            ),
          },
          protein: {
            current: mealsWithRecipes.reduce(
              (sum, meal) =>
                sum + (meal.done ? meal.nutrition.protein || 0 : 0),
              0
            ),
            percentage: Math.floor(
              (mealsWithRecipes.reduce(
                (sum, meal) =>
                  sum + (meal.done ? meal.nutrition.protein || 0 : 0),
                0
              ) /
                (userData?.targets?.protein || 1)) *
                100
            ),
          },
          carbs: {
            current: mealsWithRecipes.reduce(
              (sum, meal) => sum + (meal.done ? meal.nutrition.carbs || 0 : 0),
              0
            ),
            percentage: Math.floor(
              (mealsWithRecipes.reduce(
                (sum, meal) =>
                  sum + (meal.done ? meal.nutrition.carbs || 0 : 0),
                0
              ) /
                (userData?.targets?.carbs || 1)) *
                100
            ),
          },
          fat: {
            current: mealsWithRecipes.reduce(
              (sum, meal) => sum + (meal.done ? meal.nutrition.fat || 0 : 0),
              0
            ),
            percentage: Math.floor(
              (mealsWithRecipes.reduce(
                (sum, meal) => sum + (meal.done ? meal.nutrition.fat || 0 : 0),
                0
              ) /
                (userData?.targets?.fat || 1)) *
                100
            ),
          },
        };

        setSelectedDayMeals(mealsWithRecipes);
        setSelectedDayProgress(progress);
      } else {
        setSelectedDayMeals(null);
        setSelectedDayProgress(null);
      }
    }
  }, [selectedDay, mealPlans, recipes, userData]);

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
          <div className="actions">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="search-bar body-s"
              />
              <label htmlFor="search" className="search-label">
                <SearchIcon />
              </label>
              <button
                className="search-btn btn btn-text"
                onClick={handleSearch}
              >
                <SearchIcon size={28} />
              </button>
            </div>
          </div>
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

        <div className="home-ingredient-list">
          <h6 className="home-ingredient-list-title">Ingredient List</h6>
          <ul className="home-ingredient-list-items two-columns">
            {selectedDayMeals?.flatMap((meal) =>
              meal.ingredients?.map((ingredient, index) => (
                <li
                  key={`${meal.mealInstanceId}-${index}`}
                  className="home-ingredient-list-item body-s"
                >
                  {ingredient}
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
