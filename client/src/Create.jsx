import Sidenav from "./components/Sidenav";
import { recipes } from "./fakedata.json";

import "./Create.css";

export default function About() {
  return (
    <>
      <Sidenav />
      <div className="content">
        <div className="header">
          <h4>Generate Meal Plan</h4>
        </div>

        <div className="meal-picker">
          <div className="meal-group breakfast">
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

          <div className="meal-group breakfast">
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

          <div className="meal-group breakfast">
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

          <div className="meal-group breakfast">
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
        <button className="btn">Generate 🔀</button>
      </div>
    </>
  );
}
