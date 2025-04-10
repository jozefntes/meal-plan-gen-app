// Helper function to find similar recipes
export const findSimilarRecipes = (
  currentRecipe,
  invertedIndex,
  allRecipes
) => {
  const ingredientMatches = new Map();

  currentRecipe.ingredients.forEach((ingredient) => {
    if (invertedIndex[ingredient]) {
      invertedIndex[ingredient].forEach((recipeId) => {
        if (recipeId !== currentRecipe.id) {
          ingredientMatches.set(
            recipeId,
            (ingredientMatches.get(recipeId) || 0) + 1
          );
        }
      });
    }
  });

  // Sort recipes by the number of matching ingredients (descending)
  const sortedRecipeIds = [...ingredientMatches.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([recipeId]) => recipeId);

  // Return the full recipe objects for the sorted IDs
  return sortedRecipeIds
    .map((id) => allRecipes.find((recipe) => recipe.id === id))
    .filter((recipe) => recipe !== undefined);
};
