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
  const [recipeToDelete, setRecipeToDelete] = useState(null);

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

  const handleDeleteRecipeClick = (recipeId) => {
    setRecipeToDelete(recipeId);
  };

  const handleConfirmDelete = () => {
    if (recipeToDelete) {
      const previousRecipes = recipes;
      setRecipes((prevRecipes) =>
        prevRecipes.filter((recipe) => recipe.id !== recipeToDelete)
      );

      (async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const idToken = await user.getIdToken();

          fetch(`${SERVER_URL}/api/recipes/${recipeToDelete}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          })
            .then((response) => {
              if (response.ok) {
                console.log("Recipe deleted successfully");
              } else {
                console.error("Error deleting recipe");
                setRecipes(previousRecipes);
              }
            })
            .catch((error) => {
              console.error("Error deleting recipe:", error);
              setRecipes(previousRecipes);
            });
        } else {
          console.log("No user is signed in.");
          page("/");
        }
      })();
    }
    setRecipeToDelete(null);
  };

  const handleCancelDelete = () => {
    setRecipeToDelete(null);
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
              onDeleteRecipe={handleDeleteRecipeClick}
              applicationContext="recipes"
            />
            <MealGroup
              title="Lunch"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 2)
              }
              onDeleteRecipe={handleDeleteRecipeClick}
              applicationContext="recipes"
            />
            <MealGroup
              title="Dinner"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 3)
              }
              onDeleteRecipe={handleDeleteRecipeClick}
              applicationContext="recipes"
            />
            <MealGroup
              title="Snack"
              recipes={
                filteredRecipes.length > 0 &&
                filteredRecipes.filter((recipe) => recipe.mealGroup === 4)
              }
              onDeleteRecipe={handleDeleteRecipeClick}
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
      {recipeToDelete && (
        <ConfirmationModal
          message="Are you sure you want to delete this recipe?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          onClose={handleCancelDelete}
        />
      )}
    </>
  );
}
