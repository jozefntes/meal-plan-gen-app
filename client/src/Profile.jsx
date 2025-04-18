import { useState } from "react";
import useTheme from "./hooks/useTheme";
import "./Profile.css";

export default function Profile() {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    startingWeight: "",
    goalWeight: "",
    fitnessGoals: [],
    dietaryPreferences: [],
    profilePicture: "",
  });

  const [editMode, setEditMode] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if ((name === "weight" || name === "age" || name === "startingWeight") && isNaN(value)) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.startingWeight) {
      setFormData((prev) => ({ ...prev, startingWeight: prev.weight }));
    }
    console.log("User data saved", formData);
    setEditMode(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const progressPercent =
    formData.weight && formData.goalWeight && formData.startingWeight &&
    parseFloat(formData.startingWeight) !== parseFloat(formData.goalWeight)
      ? Math.max(
          0,
          Math.min(
            100,
            ((formData.startingWeight - formData.weight) /
              (formData.startingWeight - formData.goalWeight)) *
              100
          )
        )
      : 0;

  const goalReached =
    formData.goalWeight &&
    formData.weight &&
    parseFloat(formData.weight) <= parseFloat(formData.goalWeight);

  return (
    <div className="generate-page profile-layout">
      <div className="header">
        <h4>Profile</h4>
        <div className="profile-picture">
          <label htmlFor="profile-upload">
            <img
              src={formData.profilePicture || "/logo-light.svg"}
              alt="Profile"
              className="profile-img"
              style={{ cursor: "pointer" }}
            />
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            style={{ display: "none" }}
          />
        </div>
      </div>
      <div className="profile-content">
        <div className="profile-form body-s">
          <label>
            Name:
            {editMode ? (
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                type="text"
                className="input-field"
              />
            ) : (
              <span>{formData.name || "—"}</span>
            )}
          </label>

          <label>
            Age:
            {editMode ? (
              <input
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                type="number"
                className="input-field"
                min="1"
              />
            ) : (
              <span>{formData.age || "—"}</span>
            )}
          </label>

          <label>
            Height:
            {editMode ? (
              <div className="height-input">
                <select
                  name="heightFeet"
                  value={formData.heightFeet}
                  onChange={handleInputChange}
                  className="height-dropdown"
                >
                  <option value="">Feet</option>
                  {[...Array(10)].map((_, index) => (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
                <select
                  name="heightInches"
                  value={formData.heightInches}
                  onChange={handleInputChange}
                  className="height-dropdown"
                >
                  <option value="">Inches</option>
                  {[...Array(12)].map((_, index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span>
                {formData.heightFeet && formData.heightInches
                  ? `${formData.heightFeet} ft ${formData.heightInches} in`
                  : "—"}
              </span>
            )}
          </label>

          <label>
            Current Weight:
            {editMode ? (
              <div className="weight-input">
                <input
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  type="number"
                  className="input-field"
                  min="0"
                />
                <span className="lbs">lbs</span>
              </div>
            ) : (
              <span>{formData.weight ? `${formData.weight} lbs` : "—"}</span>
            )}
          </label>

          <label>
            Goal Weight:
            {editMode ? (
              <div className="weight-input">
                <input
                  name="goalWeight"
                  value={formData.goalWeight}
                  onChange={handleInputChange}
                  type="number"
                  className="input-field"
                  min="0"
                />
                <span className="lbs">lbs</span>
              </div>
            ) : (
              <span>{formData.goalWeight ? `${formData.goalWeight} lbs` : "—"}</span>
            )}
          </label>

          <div className="profile-actions">
            {editMode ? (
              <>
                <button className="btn" onClick={handleSave}>Save</button>
                <button className="btn-outline" onClick={() => setEditMode(false)}>Cancel</button>
              </>
            ) : (
              <button className="btn" onClick={() => setEditMode(true)}>Edit</button>
            )}
          </div>
        </div>

        <div className="side-column body-s">
          <div className="weight-tracker body-s">
            <h5>Weight Progress</h5>
            <p>Starting Weight: {formData.startingWeight || "—"} lbs</p>
            <p>Current Weight: {formData.weight || "—"} lbs</p>
            <p>Goal Weight: {formData.goalWeight || "—"} lbs</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            {goalReached && (
              <p className="goal-message"> Congrats! You've reached your goal weight!</p>
            )}
          </div>

          <div className="fitness-goals-section">
            <h5>Fitness Goals</h5>
            {editMode ? (
              <div className="fitness-goals-dropdown">
                {["Lose weight", "Build muscle", "Eat healthier", "Gain weight"].map((goal) => (
                  <label key={goal} className="goal-option">
                    <input
                      type="checkbox"
                      value={goal}
                      checked={formData.fitnessGoals.includes(goal)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => {
                          const goals = prev.fitnessGoals || [];
                          return {
                            ...prev,
                            fitnessGoals: checked
                              ? [...goals, goal]
                              : goals.filter((g) => g !== goal),
                          };
                        });
                      }}
                    />
                    {goal}
                  </label>
                ))}
              </div>
            ) : formData.fitnessGoals.length > 0 ? (
              <ul className="goal-list">
                {formData.fitnessGoals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>

          <div className="fitness-goals-section">
            <h5>Dietary Preferences</h5>
            {editMode ? (
              <div className="fitness-goals-dropdown">
                {["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free", "Low-Carb", "High-Protein"].map((pref) => (
                  <label key={pref} className="goal-option">
                    <input
                      type="checkbox"
                      value={pref}
                      checked={formData.dietaryPreferences.includes(pref)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData((prev) => {
                          const prefs = prev.dietaryPreferences || [];
                          return {
                            ...prev,
                            dietaryPreferences: checked
                              ? [...prefs, pref]
                              : prefs.filter((p) => p !== pref),
                          };
                        });
                      }}
                    />
                    {pref}
                  </label>
                ))}
              </div>
            ) : formData.dietaryPreferences.length > 0 ? (
              <ul className="goal-list">
                {formData.dietaryPreferences.map((pref) => (
                  <li key={pref}>{pref}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
}
