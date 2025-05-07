import { useState } from "react";
import { getAuth } from "firebase/auth";
import page from "page";

import CreateRecipe from "./components/CreateRecipe";
import WeekPicker from "./components/WeekSelector";
import MealGroup from "./components/MealGroup";

import { SERVER_URL } from "./constants";

import "./MealPlanGenerator.css";
import ShuffleIcon from "./icons/Shuffle";

export default function MealPlanGenerator({
  recipes,
  loadingRecipes,
  onAddRecipe,
}) {
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealGroup, setSelectedMealGroup] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [generatingMealPlan, setGeneratingMealPlan] = useState(false);

  const handleWeekSelect = (index) => {
    setSelectedWeek(index);
    console.log(index);
  };

  const handleOpenModal = (mealGroup) => {
    setSelectedMealGroup(mealGroup);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMealGroup(null);
  };

  const handleSelectRecipe = (mealGroup, recipeId, isSelected) => {
    setSelectedRecipes((prevSelectedRecipes) => {
      const updatedRecipes = { ...prevSelectedRecipes };
      if (isSelected) {
        if (!updatedRecipes[mealGroup].includes(recipeId)) {
          updatedRecipes[mealGroup].push(recipeId);
        }
      } else {
        updatedRecipes[mealGroup] = updatedRecipes[mealGroup].filter(
          (id) => id !== recipeId
        );
      }
      console.log(updatedRecipes);
      return updatedRecipes;
    });
  };

  const handleGenerateMealPlan = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const idToken = await user.getIdToken();
      const uid = user.uid;

      // Validation logic
      const mealGroups = ["breakfast", "lunch", "dinner", "snack"];
      for (const group of mealGroups) {
        const count = selectedRecipes[group].length;
        if (count < 2 || count > 3) {
          setErrorMessage(
            `Please select between 2 and 3 recipes for ${group}.`
          );
          return;
        }
      }

      setGeneratingMealPlan(true);

      fetch(`${SERVER_URL}/api/generate_meal_plan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          selectedMeals: selectedRecipes,
          weekNumber: selectedWeek,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
          } else {
            console.log("Meal plan generated:", data);
            setErrorMessage(null);
            page("/");
          }
        })
        .catch((error) => console.error("Error generating meal plan:", error))
        .finally(() => {
          setGeneratingMealPlan(false);
        });
    } else {
      console.log("No user is signed in.");
    }
  };

  return (
    <>
      <div className="generate-page">
        <div className="header">
          <h4>Generate Meal Plan</h4>
        </div>

        <WeekPicker
          selectedWeek={selectedWeek}
          onWeekSelect={handleWeekSelect}
        />

        {loadingRecipes ? (
          <p className="meal-picker body-m">Loading...</p>
        ) : (
          <div className="meal-picker">
            <MealGroup
              title="Breakfast"
              mealGroup="breakfast"
              recipes={recipes}
              selectedRecipes={selectedRecipes.breakfast}
              onCreateNew={() => handleOpenModal(1)}
              onSelectRecipe={handleSelectRecipe}
            />
            <MealGroup
              title="Lunch"
              mealGroup="lunch"
              recipes={recipes}
              selectedRecipes={selectedRecipes.lunch}
              onCreateNew={() => handleOpenModal(2)}
              onSelectRecipe={handleSelectRecipe}
            />
            <MealGroup
              title="Dinner"
              mealGroup="dinner"
              recipes={recipes}
              selectedRecipes={selectedRecipes.dinner}
              onCreateNew={() => handleOpenModal(3)}
              onSelectRecipe={handleSelectRecipe}
            />
            <MealGroup
              title="Snack"
              mealGroup="snack"
              recipes={recipes}
              selectedRecipes={selectedRecipes.snack}
              onCreateNew={() => handleOpenModal(4)}
              onSelectRecipe={handleSelectRecipe}
            />
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
        <button
          className="btn"
          onClick={handleGenerateMealPlan}
          disabled={generatingMealPlan}
        >
          {generatingMealPlan ? (
            <p className="btn-text">Generating...</p>
          ) : (
            <div className="btn-content">
              <p className="btn-text">Generate</p>
              <ShuffleIcon size={24} />
            </div>
          )}
        </button>
      </div>
      {isModalOpen && (
        <CreateRecipe
          onClose={handleCloseModal}
          mealGroup={selectedMealGroup}
          onAddRecipe={onAddRecipe}
        />
      )}
    </>
  );
}
