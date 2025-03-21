export const getMealLabel = (mealCategory) => {
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
