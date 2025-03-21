import { useState } from "react";
import page from "page";
import { getMealLabel } from "../utils/mealUtils";

import "./MealCard.css";

export default function MealCard({
  id,
  mealGroup,
  title,
  image,
  nutrition,
  done,
  onMealDone,
  applicationContext,
  onDeleteRecipe,
}) {
  const [deleteIcon, setDeleteIcon] = useState("../icons/trash-filled.svg");

  const backgroundStyle = {
    background: `linear-gradient(rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 50%), linear-gradient(45deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 50%),
        url(data:image/png;base64,${image})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
  };

  const handleCardClick = () => {
    page(`/recipe/${id}`);
  };

  return (
    <>
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
              className="add-btn"
              onClick={(e) => {
                e.stopPropagation();
                onMealDone(id);
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
          <p className="body-s">{nutrition.calories} kcal</p>
          <p className="body-s">{nutrition.protein} g protein</p>
          <p className="body-s">{nutrition.carbs} g carbs</p>
          <p className="body-s">{nutrition.fat} g fat</p>
        </div>
      </li>
    </>
  );
}
