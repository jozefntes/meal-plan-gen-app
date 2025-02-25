import { useState } from "react";

import Sidenav from "./components/Sidenav";
import CreateRecipe from "./components/CreateRecipe";
import WeekPicker from "./components/WeekSelector";
import MealGroup from "./components/MealGroup";

import { recipes } from "./fakedata.json";
import "./MealPlanGenerator.css";

export default function MealPlanGenerator() {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMealGroup, setSelectedMealGroup] = useState(null);

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
            recipes={recipes}
            onCreateNew={() => handleOpenModal(0)}
          />
          <MealGroup
            title="Lunch"
            recipes={recipes}
            onCreateNew={() => handleOpenModal(1)}
          />
          <MealGroup
            title="Dinner"
            recipes={recipes}
            onCreateNew={() => handleOpenModal(2)}
          />
          <MealGroup
            title="Snack"
            recipes={recipes}
            onCreateNew={() => handleOpenModal(3)}
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
        />
      )}
    </>
  );
}
