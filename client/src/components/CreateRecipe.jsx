import { getAuth } from "firebase/auth";
import { SERVER_URL } from "../constants";

import "./CreateRecipe.css";

const CreateRecipe = ({ onClose, mealGroup, onAddRecipe }) => {
  const createRecipe = async (event) => {
    event.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const idToken = await user.getIdToken();
      const uid = user.uid;

      const ingredients = document.getElementById("ingredients").value;
      const minProtein = document.getElementById("min-protein").value;
      const maxCarbs = document.getElementById("max-carbs").value;
      const maxFat = document.getElementById("max-fat").value;

      if (
        minProtein < 0 ||
        minProtein > 60 ||
        maxCarbs < 5 ||
        maxCarbs > 100 ||
        maxFat < 5 ||
        maxFat > 100
      ) {
        alert("Please ensure all values are within the specified limits.");
        return;
      }

      console.log("Creating new recipe with the following data:");
      console.log("Meal Group:", mealGroup);
      console.log("User ID:", 79);
      console.log("Ingredients:", ingredients);
      console.log("Min Protein:", minProtein);
      console.log("Max Carbs:", maxCarbs);
      console.log("Max Fat:", maxFat);

      const response = await fetch(
        "http://localhost:8080/api/generate_recipe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid,
            ingredients,
            minProtein: parseInt(minProtein),
            maxCarbs: parseInt(maxCarbs),
            maxFat: parseInt(maxFat),
            mealGroup,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate recipe");
      }

      const data = await response.json();
      console.log(data);
      console.log("Generated recipe:", data.recipe);

      onAddRecipe(data.recipe);

      onClose();
    } else {
      console.log("User not signed in");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h6>Create New Recipe</h6>
        <form>
          <div className="form-group">
            <label htmlFor="ingredients" className="body-s">
              Ingredients
            </label>
            <input type="text" id="ingredients" name="ingredients" required />
          </div>
          <div className="form-group">
            <label htmlFor="min-protein" className="body-s">
              Min Protein (g) - Min 0, Max 60
            </label>
            <input
              type="number"
              id="min-protein"
              name="min-protein"
              min="0"
              max="60"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="max-carbs" className="body-s">
              Max Carbs (g) - Min 5, Max 100
            </label>
            <input
              type="number"
              id="max-carbs"
              name="max-carbs"
              min="5"
              max="100"
              required
            ></input>
          </div>
          <div className="form-group">
            <label htmlFor="max-fat" className="body-s">
              Max Fat (g) - Min 5, Max 100
            </label>
            <input
              type="number"
              id="max-fat"
              name="max-fat"
              min="5"
              max="100"
              required
            ></input>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-text">
              Cancel
            </button>
            <button type="submit" onClick={createRecipe} className="btn-text">
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
