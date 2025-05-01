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
    <div className="meal-info-page">
      {loading ? (
        <h4>Loading...</h4>
      ) : (
        <>
          <button className="back-btn" onClick={() => window.history.back()}>
            <img src="/icons/chevron-left-white.svg" alt="Back" />
          </button>
          <img
            src={meal?.image ?? "/images/placeholder.webp"}
            alt={meal?.title ?? "Meal Image"}
            className="recipe-img"
            loading="lazy"
          />
          <div className="meal-title">
            <h4>{meal?.title ?? "Meal Title"}</h4>
            <div className="nutrition">
              <p className="body-s">{`${meal?.nutrition?.calories ?? 0}cal, ${
                meal?.nutrition?.protein ?? 0
              }p, ${meal?.nutrition?.carbs ?? 0}c, ${
                meal?.nutrition?.fat ?? 0
              }f (per meal)`}</p>
              <p className="body-s">{getMealLabel(meal?.mealGroup)}</p>
            </div>
          </div>
          <hr />
          <div className="ingredients">
            <div className="ingredients-header">
              <h6>Ingredients</h6>
            </div>
            <ul className="list body-s">
              {meal?.ingredients?.map((ingredient, index) => (
                <li className="list-item" key={index}>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          <hr />
          <div className="instructions">
            <div className="instructions-header">
              <h6>Instructions</h6>
            </div>
            <ol className="list body-s">
              {meal?.instructions?.map((instruction, index) => (
                <li className="list-item" key={index}>
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
