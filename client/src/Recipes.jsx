import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

import CreateRecipe from "./components/CreateRecipe";
import MealGroup from "./components/MealGroup";

import { SERVER_URL } from "./constants";

import "./Recipes.css";
import PlusIcon from "./icons/PlusIcon";
import SearchIcon from "./icons/SearchIcon";

export default function MealPlanGenerator() {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Fetch initial recipes data from the server
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;

        fetch(`${SERVER_URL}/api/recipes/${uid}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => {
            if (response.status === 404) {
              return [];
            }

            return response.json();
          })
          .then((data) => {
            setRecipes(data);
            setLoading(false);
          })
          .catch((error) => {
            setErrorMessage("Error fetching recipes");
            console.error("Error fetching recipes:", error);
          });
      } else {
        console.log("No user is signed in.");
      }
    })();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddRecipe = (newRecipe) => {
    setRecipes((prevRecipes) =>
      prevRecipes ? [...prevRecipes, newRecipe] : [newRecipe]
    );
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteRecipe = (recipeId) => {
    console.log("Delete recipe with ID:", recipeId);
    setRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.id !== recipeId)
    );
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="recipes-page">
        <div className="header">
          <h4>My Recipes</h4>
          <div className="actions">
            <div className="search-bar-container">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-bar"
              />
              <label htmlFor="search" className="search-label">
                <SearchIcon />
              </label>
            </div>
            <button className="btn" onClick={handleOpenModal}>
              <PlusIcon />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="meal-picker body-m">Loading...</p>
        ) : (
          <div className="meal-picker">
            <MealGroup
              title="Breakfast"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 1)
              }
              onDeleteRecipe={handleDeleteRecipe}
              applicationContext="recipes"
            />
            <MealGroup
              title="Lunch"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 2)
              }
              onDeleteRecipe={handleDeleteRecipe}
              applicationContext="recipes"
            />
            <MealGroup
              title="Dinner"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 3)
              }
              onDeleteRecipe={handleDeleteRecipe}
              applicationContext="recipes"
            />
            <MealGroup
              title="Snack"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 4)
              }
              onDeleteRecipe={handleDeleteRecipe}
              applicationContext="recipes"
            />
          </div>
        )}
        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <CreateRecipe
          onClose={handleCloseModal}
          onAddRecipe={handleAddRecipe}
        />
      )}
    </>
  );
}
