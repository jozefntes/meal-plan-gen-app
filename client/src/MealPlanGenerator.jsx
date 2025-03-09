import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

import Sidenav from "./components/Sidenav";
import CreateRecipe from "./components/CreateRecipe";
import WeekPicker from "./components/WeekSelector";
import MealGroup from "./components/MealGroup";

import { SERVER_URL } from "./constants";

// import { recipes } from "./fakedata.json";
import "./MealPlanGenerator.css";

export default function MealPlanGenerator() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealGroup, setSelectedMealGroup] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  useEffect(() => {
    // Fetch initial recipes data from the server
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;

        console.log(uid);

        fetch(`${SERVER_URL}/api/recipes/${uid}`, {
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
          .then((data) => setRecipes(data))
          .catch((error) => console.error("Error fetching recipes:", error));
        console.log(recipes);
      } else {
        console.log("No user is signed in.");
      }
    })();
  }, []);

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

  const handleAddRecipe = (newRecipe) => {
    setRecipes((prevRecipes) =>
      prevRecipes ? [...prevRecipes, newRecipe] : [newRecipe]
    );
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

      const selectedRecipeIds = [
        ...selectedRecipes.breakfast,
        ...selectedRecipes.lunch,
        ...selectedRecipes.dinner,
        ...selectedRecipes.snack,
      ];

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

      fetch(`${SERVER_URL}/api/generate_meal_plan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          selectedMeals: selectedRecipeIds,
          weekNumber: 0,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setErrorMessage(data.error);
          } else {
            console.log("Meal plan generated:", data);
            setErrorMessage(null);
          }
        })
        .catch((error) => console.error("Error generating meal plan:", error));
    } else {
      console.log("No user is signed in.");
    }
  };

  return (
    <>
      <Sidenav />
      <div className="generate-page">
        <div className="header">
          <h4>Generate Meal Plan</h4>
        </div>

        <WeekPicker
          selectedWeek={selectedWeek}
          onWeekSelect={handleWeekSelect}
        />

        <div className="meal-picker">
          <MealGroup
            title="Breakfast"
            recipes={
              recipes.length > 0 &&
              recipes.filter((recipe) => recipe.mealGroup === 1)
            }
            onCreateNew={() => handleOpenModal(1)}
            onSelectRecipe={(recipeId, isSelected) =>
              handleSelectRecipe("breakfast", recipeId, isSelected)
            }
          />
          <MealGroup
            title="Lunch"
            recipes={
              recipes.length > 0 &&
              recipes.filter((recipe) => recipe.mealGroup === 2)
            }
            onCreateNew={() => handleOpenModal(2)}
            onSelectRecipe={(recipeId, isSelected) =>
              handleSelectRecipe("lunch", recipeId, isSelected)
            }
          />
          <MealGroup
            title="Dinner"
            recipes={
              recipes.length > 0 &&
              recipes.filter((recipe) => recipe.mealGroup === 3)
            }
            onCreateNew={() => handleOpenModal(3)}
            onSelectRecipe={(recipeId, isSelected) =>
              handleSelectRecipe("dinner", recipeId, isSelected)
            }
          />
          <MealGroup
            title="Snack"
            recipes={
              recipes.length > 0 &&
              recipes.filter((recipe) => recipe.mealGroup === 4)
            }
            onCreateNew={() => handleOpenModal(4)}
            onSelectRecipe={(recipeId, isSelected) =>
              handleSelectRecipe("snack", recipeId, isSelected)
            }
          />
        </div>
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
        <button className="btn" onClick={handleGenerateMealPlan}>
          <p className="btn-text">Generate 🔀</p>
        </button>
      </div>
      {isModalOpen && (
        <CreateRecipe
          onClose={handleCloseModal}
          mealGroup={selectedMealGroup}
          onAddRecipe={handleAddRecipe}
        />
      )}
    </>
  );
}
