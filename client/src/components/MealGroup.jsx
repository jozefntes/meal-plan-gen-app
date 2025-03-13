import "./MealGroup.css";
import CircledPlusIcon from "../icons/CircledPlusIcon";

export default function MealGroup({
  title,
  recipes,
  onCreateNew,
  onSelectRecipe,
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
          {recipes.length > 0 &&
            recipes.map((recipe) => (
              <li className="picker__item" key={recipe.id}>
                <input
                  type="checkbox"
                  className="hidden-checkbox"
                  id={`recipe-${recipe.id}`}
                  onChange={(e) => onSelectRecipe(recipe.id, e.target.checked)}
                />
                <label className="recipe-label" htmlFor={`recipe-${recipe.id}`}>
                  <img
                    src={`data:image/png;base64,${recipe.image}`}
                    alt={recipe.title}
                  />
                  <p className="body-s">{recipe.title}</p>
                </label>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
