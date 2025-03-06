import "./MealGroup.css";

export default function MealGroup({ title, recipes, onCreateNew }) {
  return (
    <div className="meal-group">
      <h6>{title}</h6>

      <div className="picker">
        <div className="create-new-btn" onClick={onCreateNew}>
          <div>
            <img
              className="create-icon"
              src="/icons/circle-dashed-plus.svg"
              alt="Create New"
            />
          </div>
          <p className="body-s">+ Create New</p>
        </div>
        <ul>
          {recipes.length > 0 &&
            recipes.map((recipe, idx) => (
              <li className="picker__item" key={idx}>
                <img
                  src={`data:image/png;base64,${recipe.image}`}
                  alt={recipe.title}
                />
                <p className="body-s">{recipe.title}</p>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
