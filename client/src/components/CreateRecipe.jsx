import { useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { SERVER_URL } from "../constants";

import "./CreateRecipe.css";

const ingredientLists = {
  1: [
    "Eggs", "Bacon", "Sausage", "Toast", "Bagel", "Pancakes", "Waffles", "Oatmeal", 
    "Cereal", "Milk", "Yogurt", "Banana", "Apple", "Orange Juice", "Cheese",
    "Peanut Butter", "Avocado", "Tomato", "Spinach", "Mushrooms"
  ], 

  2: [
    "Chicken", "Rice", "Pasta", "Turkey", "Beef", "Lettuce", "Tomato", "Onion",
    "Cheese", "Avocado", "Tuna", "Beans", "Bread", "Mayonnaise", "Spinach",
    "Carrots", "Cucumber", "Hummus", "Corn", "Pickles"
  ], 

  3: [
    "Salmon", "Steak", "Pork", "Shrimp", "Broccoli", "Cauliflower", "Zucchini", 
    "Garlic", "Olive Oil", "Soy Sauce", "Rice", "Quinoa", "Potatoes", "Mushrooms",
    "Bell Peppers", "Tomato Sauce", "Cheese", "Noodles", "Tofu", "Eggplant"
  ], 

  4: [
    "Almonds", "Cashews", "Yogurt", "Granola", "Peanut Butter", "Dark Chocolate",
    "Popcorn", "Crackers", "Cheese", "Hummus", "Carrots", "Celery", "Fruit",
    "Nuts", "Smoothie", "Protein Bar", "Boiled Eggs", "Cottage Cheese", "Seeds",
    "Greek Yogurt"
  ], 
};


const CreateRecipe = ({ onClose, mealGroup, onAddRecipe }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredientList, setShowIngredientList] = useState(false);
  const ingredientBoxRef = useRef(null);

  const filteredIngredients = ingredientLists[mealGroup]?.filter((ingredient) =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleIngredientSelect = (ingredient) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setShowIngredientList(true); 
  };

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
            ingredients: selectedIngredients,
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

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
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
          <div className="form-group" ref={ingredientBoxRef} 
          onMouseEnter={() => setShowIngredientList(true)}
          onMouseLeave={() => setShowIngredientList(false)}
          >
         <label htmlFor="ingredient-search" className="body-s">
          Ingredients
        </label>
        <input 
          type = "text"
          id="ingredient-search"
          placeholder="Select ingredients"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setShowIngredientList(true)}
        />

        {showIngredientList ? (
          <div className="ingredient-list">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ingredient) => (
                <label key={ingredient} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => handleIngredientSelect(ingredient)}
                  />
                  {ingredient}
                </label>
              ))
            ) : (
              <p>No matching ingredients found.</p>
            )}
        </div>
      ) : (
            <div className="selected-ingredients">
              {selectedIngredients.length > 0
                ? selectedIngredients.join(", ")
                : "No ingredients selected"}
            </div>
          )}
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
