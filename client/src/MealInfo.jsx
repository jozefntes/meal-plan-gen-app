import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

import Sidenav from "./components/Sidenav";

import { SERVER_URL } from "./constants";

import "./MealInfo.css";

export default function MealPlanGenerator({ id }) {
  const [meal, setMeal] = useState(null);

  useEffect(() => {
    // Fetch initial recipes data from the server
    (async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        const idToken = await user.getIdToken();

        fetch(`${SERVER_URL}/api/recipe/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
          .then((response) => {
            if (response.status === 404) {
              return null;
            }

            return response.json();
          })
          .then((data) => setMeal(data))
          .catch((error) => console.error("Error fetching recipe:", error));
      } else {
        console.log("No user is signed in.");
      }
    })();
  }, [id]);

  return (
    <>
      <Sidenav />
      <div className="meal-info-page">
        <img
          src={`data:image/png;base64,${meal.image}`}
          alt={meal.title}
          className="recipe-img"
        />
        <div className="meal-title">
          <h4>{meal.title}</h4>
          <div className="nutrition">
            <p className="body-s">{`${meal.nutrition.calories}cal, ${meal.nutrition.protein}p, ${meal.nutrition.carbs}c, ${meal.nutrition.fat}f (per meal)`}</p>
            <p>{meal.mealGroup}</p>
          </div>
        </div>
        <hr></hr>
        <div className="ingredients">
          <div className="ingredients-header">
            <h6>Ingredients</h6>
          </div>
          <ul>
            {meal.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <hr></hr>
        <div className="instructions">
          <div className="instructions-header">
            <h6>Instructions</h6>
          </div>
          <ol>
            {meal.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}
