import { useState } from "react";
import { getAuth } from "firebase/auth";
import page from "page";
import { getMealLabel } from "../utils/mealUtils";
import ReplaceRecipeModal from "./ReplaceRecipeModal";
import { SERVER_URL } from "../constants";

import "./MealCard.css";

export default function MealCard({
  mealGroup,
  meal,
  date,
  onMealDone,
  applicationContext,
  onDeleteRecipe,
  allRecipes,
  onReplaceRecipeId,
  invertedIndex,
}) {
  const [deleteIcon, setDeleteIcon] = useState("../icons/trash-filled.svg");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(
    meal.image || "/images/placeholder.webp"
  );
  const { id, title, nutrition, done, mealInstanceId } = meal;

  const backgroundStyle = {
    background: `linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(45deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%),
        url(${backgroundImage})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const handleImageError = () => {
    setBackgroundImage("/images/placeholder.webp");
  };

  const handleCardClick = () => {
    page(`/recipe/${id}`);
  };

  const openReplaceRecipeModal = (e) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleReplaceRecipe = async (recipeId) => {
    const formattedDate = new Date(date).toISOString().split("T")[0];

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      const uid = user.uid;

      // Optimistically update the UI
      onReplaceRecipeId(id, recipeId);

      try {
        const response = await fetch(`${SERVER_URL}/api/replace_recipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid,
            date: formattedDate,
            newMealId: recipeId,
            currentMealId: id,
          }),
        });
        if (!response.ok) {
          throw new Error("Failed to replace recipe");
        }
        const data = await response.json();
        console.log(data);
      } catch (error) {
        console.error("Error replacing recipe:", error);
        onReplaceRecipeId(recipeId, id);
      }
    }

    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <img
        src={meal.image || "/images/placeholder.webp"}
        alt="Hidden for error detection"
        style={{ display: "none" }}
        onError={handleImageError}
      />

      <li
        className="meal-card"
        style={backgroundStyle}
        onClick={handleCardClick}
      >
        <div className="meal-header">
          <div className="meal-info">
            {applicationContext !== "recipes" && (
              <p className="body-s meal-group-info">
                {getMealLabel(mealGroup)}
              </p>
            )}
            <p className="body-s">{title}</p>
          </div>
          {applicationContext !== "recipes" && (
            <button
              className="add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMealDone(mealInstanceId);
              }}
            >
              {done ? (
                <img src="../icons/check.svg" />
              ) : (
                <img src="../icons/plus.svg" />
              )}
            </button>
          )}
        </div>
        <div className="meal-footer">
          <div className="meal-footer-info">
            <p className="body-s">{nutrition.calories} kcal</p>
            <p className="body-s">{nutrition.protein} g protein</p>
            <p className="body-s">{nutrition.carbs} g carbs</p>
            <p className="body-s">{nutrition.fat} g fat</p>
          </div>
          {applicationContext === "recipes" ? (
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteRecipe(id);
              }}
              onMouseOver={() => setDeleteIcon("../icons/trash-x.svg")}
              onMouseOut={() => setDeleteIcon("../icons/trash-filled.svg")}
            >
              <img src={deleteIcon} alt="Delete" />
            </button>
          ) : (
            <button
              className="replace-recipe-btn"
              onClick={openReplaceRecipeModal}
            >
              <img src="../icons/arrows-exchange.svg" alt="Arrow Right" />
            </button>
          )}
        </div>
      </li>

      {isModalOpen && (
        <ReplaceRecipeModal
          mealGroup={mealGroup}
          allRecipes={allRecipes}
          onClose={handleCloseModal}
          onReplace={handleReplaceRecipe}
          currentRecipeId={id}
          invertedIndex={invertedIndex}
        />
      )}
    </>
  );
}
