import { findSimilarRecipes } from "../utils/recipeUtils";
import { useState } from "react";

import "./ReplaceRecipeModal.css";

export default function ReplaceRecipeModal({
  allRecipes,
  currentRecipeId,
  onClose,
  onReplace,
  invertedIndex,
}) {
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredRecipes = searchQuery.trim()
    ? allRecipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : similarRecipes;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <h4>Replace Recipe</h4>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search for recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar body-s"
          />
        </div>
        {filteredRecipes.length > 0 ? (
          <ul className="recipe-list">
            {filteredRecipes.map((recipe) => (
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
          <>
            {!searchQuery.trim() ? (
              <>
                <p className="no-recipes-message body-s">
                  No similar recipes found.
                </p>
                <p className="no-recipes-message body-s">
                  Try searching for a recipe.
                </p>
              </>
            ) : (
              <p className="no-recipes-message body-s">
                No recipes match your search.
              </p>
            )}
          </>
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
