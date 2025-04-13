import "./MealGroup.css";
import CircledPlusIcon from "../icons/CircledPlusIcon";

export default function MealGroup({
  title,
  mealGroup,
  recipes,
  onCreateNew,
  onSelectRecipe,
  selectedRecipes,
}) {
  return (
    <div className="meal-group">
      <h6>{title}</h6>

      <div className="picker">
        <div className="create-new-btn" onClick={onCreateNew}>
          <div>
            <CircledPlusIcon size={80} />
          </div>
          <p className="body-s">+ Create New</p>
        </div>
        <ul>
          {recipes.length > 0 ? (
            recipes.map((recipe) => (
              <li className="picker__item" key={`${mealGroup}-${recipe.id}`}>
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  id={`recipe-${mealGroup}-${recipe.id}`}
                  checked={selectedRecipes.includes(recipe.id)}
                  onChange={(e) =>
                    onSelectRecipe(mealGroup, recipe.id, e.target.checked)
                  }
                />
                <label
                  className="recipe-label"
                  htmlFor={`recipe-${mealGroup}-${recipe.id}`}
                >
                  <img
                    src={recipe?.image ?? "/images/placeholder.webp"}
                    alt={recipe.title}
                    loading="lazy"
                  />
                  <p className="body-s">{recipe.title}</p>
                </label>
              </li>
            ))
          ) : (
            <p className="body-m">No recipes found</p>
          )}
        </ul>
      </div>
    </div>
  );
}
