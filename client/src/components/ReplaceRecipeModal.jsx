import { findSimilarRecipes } from "../utils/recipeUtils";

import "./ReplaceRecipeModal.css";

export default function ReplaceRecipeModal({
  mealGroup,
  allRecipes,
  currentRecipeId,
  onClose,
  onReplace,
  invertedIndex,
}) {
  const currentRecipe = allRecipes.find(
    (recipe) => recipe.id === currentRecipeId
  );

  // If no matching recipe is found, display a fallback message
  if (!currentRecipe) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-content">
          <h4>Replace Recipe</h4>
          <p className="no-recipes-message body-s">
            The current recipe could not be found.
          </p>
          <div className="modal-footer">
            <button className="btn btn-close" onClick={onClose}>
              <span className="btn-text">Close</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const similarRecipes = findSimilarRecipes(
    currentRecipe,
    invertedIndex,
    allRecipes
  );

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <h4>Replace Recipe</h4>
        {similarRecipes.length > 0 ? (
          <ul className="recipe-list">
            {similarRecipes.map((recipe) => (
              <li
                key={recipe.id}
                className="recipe-item"
                onClick={() => onReplace(recipe.id)}
              >
                <img
                  src={recipe.image || "/images/placeholder.webp"}
                  alt={recipe.title}
                />
                <p className="body-s">{recipe.title}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-recipes-message body-s">No similar recipes found.</p>
        )}
        <div className="modal-footer">
          <button className="btn btn-close" onClick={onClose}>
            <span className="btn-text">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
