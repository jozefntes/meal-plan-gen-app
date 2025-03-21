import { useState } from "react";
import { getAuth } from "firebase/auth";
import { SERVER_URL } from "../constants";

import "./CreateRecipe.css";

const CreateRecipe = ({ onClose, mealGroup, onAddRecipe }) => {
  const [loading, setLoading] = useState(false);

  const createRecipe = async (event) => {
    event.preventDefault();

    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const idToken = await user.getIdToken();
      const uid = user.uid;

      const selectedMealGroup = parseInt(
        document.getElementById("meal-group").value
      );
      const ingredients = document.getElementById("ingredients").value;
      const minProtein = parseInt(document.getElementById("min-protein").value);
      const maxCarbs = parseInt(document.getElementById("max-carbs").value);
      const maxFat = parseInt(document.getElementById("max-fat").value);

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

      setLoading(true);

      try {
        const response = await fetch(`${SERVER_URL}/api/generate_recipe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            uid,
            ingredients,
            minProtein,
            maxCarbs,
            maxFat,
            mealGroup: selectedMealGroup,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate recipe");
        }

        const data = await response.json();
        console.log(data);
        console.log("Generated recipe:", data.recipe);

        onAddRecipe(data.recipe);
        onClose();
      } catch (error) {
        console.error("Error generating recipe:", error);
        alert("Failed to generate recipe. Please try again.");
      } finally {
        setLoading(false);
      }
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
            <label htmlFor="meal-group" className="body-s">
              Meal Group
            </label>
            <select
              id="meal-group"
              name="meal-group"
              defaultValue={mealGroup}
              required
            >
              <option value="1">Breakfast</option>
              <option value="2">Lunch</option>
              <option value="3">Dinner</option>
              <option value="4">Snack</option>
            </select>
          </div>
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
            <button
              type="submit"
              onClick={createRecipe}
              className="btn-text"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipe;
