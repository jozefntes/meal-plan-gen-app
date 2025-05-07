import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import page from "page";

import CreateRecipe from "./components/CreateRecipe";
import RecipeGrid from "./components/RecipeGrid";
import ConfirmationModal from "./components/ConfirmationModal";

import { SERVER_URL } from "./constants";

import "./Recipes.css";
import PlusIcon from "./icons/PlusIcon";
import SearchIcon from "./icons/SearchIcon";

export default function Recipes({
  recipes,
  loading,
  onAddRecipe,
  onDeleteRecipe,
  errorMessage,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [recipeIdForDeletion, setRecipeIdForDeletion] = useState(null);

  useEffect(() => {
    setFilteredRecipes(recipes); // Initialize filteredRecipes with the recipes prop
  }, [recipes]);

  useEffect(() => {
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const initialSearchQuery = params.get("search") || "";

    setSearchQuery(initialSearchQuery);

    filterRecipes(initialSearchQuery);
  }, [recipes]);

  const filterRecipes = (query) => {
    const lowerCaseQuery = query.toLowerCase();

    if (!lowerCaseQuery.trim()) {
      setFilteredRecipes(recipes);
      return;
    }

    const filtered = recipes.filter((recipe) => {
      const matchesTitle = recipe.title.toLowerCase().includes(lowerCaseQuery);
      const matchesIngredients = recipe.ingredients?.some((ingredient) =>
        ingredient.toLowerCase().includes(lowerCaseQuery)
      );
      return matchesTitle || matchesIngredients;
    });

    setFilteredRecipes(filtered);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    page(`/myrecipes?search=${encodeURIComponent(query)}`);

    filterRecipes(query);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const promptDeleteConfirmation = (recipeId) => {
    setRecipeIdForDeletion(recipeId);
  };

  const handleConfirmDelete = () => {
    if (recipeIdForDeletion !== null) {
      const recipeIndex = recipes.findIndex(
        (recipe) => recipe.id === recipeIdForDeletion
      );

      if (recipeIndex === -1) {
        console.error("Recipe not found in the current state.");
        setRecipeIdForDeletion(null);
        return;
      }

      const recipeToDelete = recipes[recipeIndex];

      // Optimistically update the state
      setFilteredRecipes((prevRecipes) =>
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
              setFilteredRecipes((prevRecipes) => {
                const updatedRecipes = [...prevRecipes];
                updatedRecipes.splice(recipeIndex, 0, recipeToDelete);
                return updatedRecipes;
              });
            } else {
              onDeleteRecipe(recipeIdForDeletion);
              console.log("Recipe deleted successfully");
            }
          } catch (error) {
            console.error("Error deleting recipe:", error);
            // Revert the state if an error occurs
            setFilteredRecipes((prevRecipes) => {
              const updatedRecipes = [...prevRecipes];
              updatedRecipes.splice(recipeIndex, 0, recipeToDelete);
              return updatedRecipes;
            });
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
                className="search-bar body-s"
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
            <RecipeGrid
              recipes={filteredRecipes.length > 0 && filteredRecipes}
              onDeleteRecipe={promptDeleteConfirmation}
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
        <CreateRecipe onClose={handleCloseModal} onAddRecipe={onAddRecipe} />
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
