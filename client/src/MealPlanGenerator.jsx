import { useState, useEffect } from "react";

import Sidenav from "./components/Sidenav";
import CreateRecipe from "./components/CreateRecipe";
import WeekPicker from "./components/WeekSelector";
import MealGroup from "./components/MealGroup";

import { SERVER_URL } from "./constants";

// import { recipes } from "./fakedata.json";
import "./MealPlanGenerator.css";

export default function MealPlanGenerator() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealGroup, setSelectedMealGroup] = useState(null);
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    // Fetch initial recipes data from the server
    fetch(`${SERVER_URL}/api/recipes/79`)
      .then((response) => response.json())
      .then((data) => setRecipes(data))
      .catch((error) => console.error("Error fetching recipes:", error));
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
    setRecipes((prevRecipes) => [...prevRecipes, newRecipe]);
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
            recipes={recipes.filter((recipe) => recipe.mealGroup === 1)}
            onCreateNew={() => handleOpenModal(1)}
          />
          <MealGroup
            title="Lunch"
            recipes={recipes.filter((recipe) => recipe.mealGroup === 2)}
            onCreateNew={() => handleOpenModal(2)}
          />
          <MealGroup
            title="Dinner"
            recipes={recipes.filter((recipe) => recipe.mealGroup === 3)}
            onCreateNew={() => handleOpenModal(3)}
          />
          <MealGroup
            title="Snack"
            recipes={recipes.filter((recipe) => recipe.mealGroup === 4)}
            onCreateNew={() => handleOpenModal(4)}
          />
        </div>
        <button className="btn">
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
