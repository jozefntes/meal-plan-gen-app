import "./ReplaceRecipeModal.css";

export default function ReplaceRecipeModal({
  mealGroup,
  allRecipes,
  currentRecipeId,
  onClose,
  onReplace,
}) {
  const filteredRecipes = allRecipes.filter(
    (recipe) => recipe.mealGroup === mealGroup && recipe.id !== currentRecipeId
  );

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content">
        <h4>Replace Recipe</h4>
        <ul className="recipe-list">
          {filteredRecipes.map((recipe) => (
            <li key={recipe.id} className="recipe-item" onClick={onReplace}>
              <img
                src={recipe.image || "/images/placeholder.webp"}
                alt={recipe.title}
              />
              <p className="body-s">{recipe.title}</p>
            </li>
          ))}
        </ul>
        <div className="modal-footer">
          <button className="btn btn-close" onClick={onClose}>
            <span className="btn-text">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
