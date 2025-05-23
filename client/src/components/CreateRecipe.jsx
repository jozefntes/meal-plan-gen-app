import { useState, useRef, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { SERVER_URL } from "../constants";

import "./CreateRecipe.css";
import allIngredients from "./Ingredient_list";

const CreateRecipe = ({ onClose, onAddRecipe }) => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredientList, setShowIngredientList] = useState(false);

  const ingredientListRef = useRef(null);

  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate recipe");
        }

        const data = await response.json();
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        ingredientListRef.current &&
        !ingredientListRef.current.contains(event.target)
      ) {
        setShowIngredientList(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h6>Create New Recipe</h6>
        <form>
          <div className="form-group">
            <label htmlFor="ingredient-search" className="body-s">
              Ingredients
            </label>
            <input
              type="text"
              id="ingredient-list"
              placeholder="Select ingredients"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => setShowIngredientList(true)}
              className="body-s"
            />
            {showIngredientList && (
              <div className="ingredient-list body-s" ref={ingredientListRef}>
                {filteredIngredients.length > 0 ? (
                  filteredIngredients.map((ingredient) => (
                    <div key={ingredient} className="checkbox-wrapper">
                      <input
                        type="checkbox"
                        id={`ingredient-${ingredient}`}
                        checked={selectedIngredients.includes(ingredient)}
                        onChange={() => handleIngredientSelect(ingredient)}
                      />
                      <label
                        htmlFor={`ingredient-${ingredient}`}
                        className="checkbox-label body-s"
                      >
                        {ingredient}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="body-s">No matching ingredients found.</p>
                )}
              </div>
            )}
            {!showIngredientList && (
              <div className="selected-ingredients body-s">
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
