import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import page from "page";

import CreateRecipe from "./components/CreateRecipe";
import MealGroup from "./components/MealGroup";
import ConfirmationModal from "./components/ConfirmationModal";

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
  const [recipeIdForDeletion, setRecipeIdForDeletion] = useState(null);

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

  const promptDeleteConfirmation = (recipeId) => {
    setRecipeIdForDeletion(recipeId);
  };

  const handleConfirmDelete = () => {
    if (recipeIdForDeletion !== null) {
      const recipeToDelete = recipes.find(
        (recipe) => recipe.id === recipeIdForDeletion
      );

      // Optimistically update the state
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeIdForDeletion)
      );

      (async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const idToken = await user.getIdToken();

          try {
            const response = await fetch(
              `${SERVER_URL}/api/recipes/${recipeIdForDeletion}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${idToken}`,
                },
              }
            );

            if (!response.ok) {
              console.error("Error deleting recipe");
              // Revert the state if the delete operation fails
              setRecipes((prevRecipes) => [...prevRecipes, recipeToDelete]);
            } else {
              console.log("Recipe deleted successfully");
            }
          } catch (error) {
            console.error("Error deleting recipe:", error);
            // Revert the state if an error occurs
            setRecipes((prevRecipes) => [...prevRecipes, recipeToDelete]);
          }
        } else {
          console.log("No user is signed in.");
          page("/");
        }
      })();
    }
    setRecipeIdForDeletion(null);
  };

  const handleCancelDelete = () => {
    setRecipeIdForDeletion(null);
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
              onDeleteRecipe={promptDeleteConfirmation}
              applicationContext="recipes"
            />
            <MealGroup
              title="Lunch"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 2)
              }
              onDeleteRecipe={promptDeleteConfirmation}
              applicationContext="recipes"
            />
            <MealGroup
              title="Dinner"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 3)
              }
              onDeleteRecipe={promptDeleteConfirmation}
              applicationContext="recipes"
            />
            <MealGroup
              title="Snack"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 4)
              }
              onDeleteRecipe={promptDeleteConfirmation}
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
      {recipeIdForDeletion !== null && (
        <ConfirmationModal
          message="Are you sure you want to delete this recipe?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
}
