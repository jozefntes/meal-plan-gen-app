import MealCard from "./MealCard";
import "./RecipeGrid.css";

export default function RecipeGrid({ recipes, onDeleteRecipe }) {
  return (
    <div className="recipe-grid">
      <ul className="grid">
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <MealCard
              key={recipe.id}
              id={recipe.id}
              meal={recipe}
              applicationContext="recipes"
              onDeleteRecipe={onDeleteRecipe}
            />
          ))
        ) : (
          <p className="body-m">No recipes found</p>
        )}
      </ul>
    </div>
  );
}
