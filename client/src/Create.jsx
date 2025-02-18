import { useState } from "react";

import Sidenav from "./components/Sidenav";
import { recipes } from "./fakedata.json";

import "./Create.css";
import WeekPicker from "./components/WeekSelector";

export default function About() {
  const [selectedWeek, setSelectedWeek] = useState(0);

  const handleWeekSelect = (index) => {
    setSelectedWeek(index);
    console.log(index);
  };

  return (
    <>
      <Sidenav />
      <div className="generate-page">
        <div className="header">
          <h4>Generate Meal Plan</h4>
        </div>

        <WeekPicker
          selectedWeek={selectedWeek}
          onWeekSelect={handleWeekSelect}
        />

        <div className="meal-picker">
          <div className="meal-group">
            <h6>Breakfast</h6>

            <div className="picker">
              <div className="create-new-btn">
                <div>
                  <img
                    className="create-icon"
                    src="/icons/circle-dashed-plus.svg"
                  />
                </div>
                <p className="body-s">+ Create New</p>
              </div>
              <ul>
                {recipes.map((recipe) => (
                  <li className="picker__item" key={recipe.id}>
                    <img src={recipe.imageURL} />
                    <p className="body-s">{recipe.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="meal-group">
            <h6>Lunch</h6>

            <div className="picker">
              <div className="create-new-btn">
                <div>
                  <img
                    className="create-icon"
                    src="/icons/circle-dashed-plus.svg"
                  />
                </div>
                <p className="body-s">+ Create New</p>
              </div>
              <ul>
                {recipes.map((recipe) => (
                  <li className="picker__item" key={recipe.id}>
                    <img src={recipe.imageURL} />
                    <p className="body-s">{recipe.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="meal-group">
            <h6>Dinner</h6>

            <div className="picker">
              <div className="create-new-btn">
                <div>
                  <img
                    className="create-icon"
                    src="/icons/circle-dashed-plus.svg"
                  />
                </div>
                <p className="body-s">+ Create New</p>
              </div>
              <ul>
                {recipes.map((recipe) => (
                  <li className="picker__item" key={recipe.id}>
                    <img src={recipe.imageURL} />
                    <p className="body-s">{recipe.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="meal-group">
            <h6>Snack</h6>

            <div className="picker">
              <div className="create-new-btn">
                <div>
                  <img
                    className="create-icon"
                    src="/icons/circle-dashed-plus.svg"
                  />
                </div>
                <p className="body-s">+ Create New</p>
              </div>
              <ul>
                {recipes.map((recipe) => (
                  <li className="picker__item" key={recipe.id}>
                    <img src={recipe.imageURL} />
                    <p className="body-s">{recipe.title}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <button className="btn">
          <p className="btn-text">Generate 🔀</p>
        </button>
      </div>
    </>
  );
}
