import { useState, useEffect } from "react";
import useTheme from "./hooks/useTheme";
import page from "page";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { SERVER_URL } from "./constants";

import Home from "./Home";
import MealPlanGenerator from "./MealPlanGenerator";
import Recipes from "./Recipes";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Profile from "./Profile";
import MealInfo from "./MealInfo";
import ProtectedRoute from "./components/ProtectedRoute";
import Forbidden from "./components/Forbidden";
import Sidenav from "./components/Sidenav";

function App() {
  const [route, setRoute] = useState("home");
  const { theme, toggleTheme } = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        const uid = user.uid;

        try {
          const response = await fetch(`${SERVER_URL}/api/recipes/${uid}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (response.status === 404) {
            setRecipes([]);
          } else if (!response.ok) {
            throw new Error("Failed to fetch recipes");
          } else {
            const data = await response.json();
            setRecipes(data);
          }
        } catch (error) {
          if (error.message !== "Failed to fetch recipes") {
            console.error("Error fetching recipes:", error);
          }
          setErrorMessage("Error fetching recipes");
        } finally {
          setLoadingRecipes(false);
        }
      } else {
        setRecipes([]);
        setLoadingRecipes(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddRecipe = (newRecipe) => {
    setRecipes((prevRecipes) =>
      prevRecipes ? [...prevRecipes, newRecipe] : [newRecipe]
    );
  };

  const handleDeleteRecipe = (recipeId) => {
    setRecipes((prevRecipes) =>
      prevRecipes.filter((recipe) => recipe.id !== recipeId)
    );
  };

  useEffect(() => {
    page("/", () => setRoute("home"));
    page("/generate", () => setRoute("generate"));
    page("/signin", () => setRoute("signin"));
    page("/register", () => setRoute("register"));
    page("/profile", () => setRoute("profile"));
    page("/recipe/:id", (ctx) =>
      setRoute({ name: "recipe", id: ctx.params.id })
    );
    page("/myrecipes", () => setRoute("myrecipes"));
    page("/forbidden", () => setRoute("forbidden"));
    page("*", () => setRoute("home"));
    page.start();
  }, []);

  return (
    <>
      {route === "home" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <Home recipes={recipes} loading={loadingRecipes} />
        </ProtectedRoute>
      )}
      {route === "profile" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <Profile />
        </ProtectedRoute>
      )}
      {route === "generate" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <MealPlanGenerator
            recipes={recipes}
            loading={loadingRecipes}
            onAddRecipe={handleAddRecipe}
          />
        </ProtectedRoute>
      )}
      {route === "myrecipes" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <Recipes
            recipes={recipes}
            loadingRecipes={loadingRecipes}
            onAddRecipe={handleAddRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            errorMessage={errorMessage}
          />
        </ProtectedRoute>
      )}
      {route === "signin" && <SignIn />}
      {route === "register" && <SignUp />}
      {route.name === "recipe" && (
        <ProtectedRoute>
          <Sidenav onToggleTheme={toggleTheme} />
          <MealInfo id={route.id} />
        </ProtectedRoute>
      )}
      {route === "forbidden" && (
        <ProtectedRoute>
          <Forbidden />
        </ProtectedRoute>
      )}
    </>
  );
}

export default App;
