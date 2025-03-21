import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import page from "page";
import { getMealLabel } from "./utils/mealUtils";

import { SERVER_URL } from "./constants";

import "./MealInfo.css";

export default function MealInfo({ id }) {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);

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
              page("/");
              return null;
            } else if (response.status === 403) {
              console.error("Access forbidden: insufficient permissions.");
              page("/forbidden");
              return null;
            }

            return response.json();
          })
          .then((data) => {
            setMeal(data);
            setLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching recipe:", error);
            page("/");
          });
      } else {
        console.log("No user is signed in.");
        page("/");
      }
    })();
  }, [id]);

  return (
    <>
      <div className="meal-info-page">
        {loading ? (
          <p>Loading...</p> // Render loading indicator
        ) : (
          <>
            <img
              src={`data:image/png;base64,${meal && meal.image}`}
              alt={meal && meal.title}
              className="recipe-img"
            />
            <div className="meal-title">
              <h4>{meal && meal.title}</h4>
              <div className="nutrition">
                <p className="body-s">{`${
                  meal && meal.nutrition.calories
                }cal, ${meal && meal.nutrition.protein}p, ${
                  meal && meal.nutrition.carbs
                }c, ${meal && meal.nutrition.fat}f (per meal)`}</p>
                <p>{getMealLabel(meal?.mealGroup)}</p>
              </div>
            </div>
            <hr></hr>
            <div className="ingredients">
              <div className="ingredients-header">
                <h6>Ingredients</h6>
              </div>
              <ul>
                {meal &&
                  meal.ingredients.map((ingredient, index) => (
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
                {meal &&
                  meal.instructions.map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
              </ol>
            </div>
          </>
        )}
      </div>
    </>
  );
}
