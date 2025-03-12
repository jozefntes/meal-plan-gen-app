import page from "page";

import "./MealCard.css";

export default function MealCard({
  id,
  groupMeal,
  title,
  image,
  nutrition,
  done,
  onMealDone,
}) {
  const getMealLabel = (mealCategory) => {
    switch (mealCategory) {
      case 1:
        return "Breakfast";
      case 2:
        return "Lunch";
      case 3:
        return "Dinner";
      case 4:
        return "Snack";
      default:
        return "Meal";
    }
  };

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
            <p className="body-s">{getMealLabel(groupMeal)}</p>
            <p className="body-s">{title}</p>
          </div>
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
        </div>
        <div className="meal-footer">
          <p className="body-s">{nutrition.protein} g protein</p>
          <p className="body-s">{nutrition.carbs} g carbs</p>
          <p className="body-s">{nutrition.fat} g fat</p>
        </div>
      </li>
    </>
  );
}
