import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import "./Profile.css";

import { SERVER_URL } from "./constants";

export default function Profile() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    height: {
      feet: "",
      inches: "",
    },
    weight: "",
    startingWeight: "",
    goalWeight: "",
    fitnessGoals: [],
    dietaryPreferences: [],
  });

  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const idToken = await user.getIdToken();
          const response = await fetch(`${SERVER_URL}/api/users/${user.uid}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });
          if (!response.ok) {
            throw new Error("Failed to fetch user data");
          }
          const data = await response.json();
          const totalCm = data.height || 0;
          const totalInches = totalCm / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);

          setFormData({
            name: data.name || "",
            age: data.age || "",
            height: {
              feet,
              inches,
            },
            weight: data.currentWeight || "",
            startingWeight: data.startingWeight || data.currentWeight,
            goalWeight: data.goalWeight || "",
            fitnessGoals: mapFitnessGoalToArray(data.fitnessGoal),
            dietaryPreferences: data.dietaryPreferences || [],
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      const lettersOnly = /^[A-Za-z\s]*$/;
      if (!lettersOnly.test(value)) return;

      if (value.length > 25) return;
    }

    if (name === "age") {
      if (isNaN(value) || value.length > 2) return;
    }

    if (
      (name === "weight" || name === "age" || name === "startingWeight") &&
      isNaN(value)
    ) {
      return;
    }

    if (
      (name === "weight" ||
        name === "startingWeight" ||
        name === "goalWeight") &&
      value.length > 3
    ) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeightChange = (e) => {
    const { name, value } = e.target;

    const newValue = value === "" ? 0 : parseInt(value, 10);

    setFormData((prevState) => ({
      ...prevState,
      height: {
        ...prevState.height,
        [name]: newValue,
      },
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.startingWeight) {
        setFormData((prev) => ({ ...prev, startingWeight: prev.weight }));
      }

      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const idToken = await user.getIdToken(true);

      const feet = Number(formData.height.feet);
      const inches = Number(formData.height.inches);

      console.log("Feet:", feet, "Inches:", inches);

      if (isNaN(feet) || feet < 0 || feet > 10) {
        throw new Error("Feet must be a valid number between 0 and 10");
      }

      if (isNaN(inches) || inches < 0 || inches > 11) {
        throw new Error("Inches must be a valid number between 0 and 11");
      }
      const heightCm = feet * 30.48 + inches * 2.54;

      const requestBody = {
        uid: user.uid,
        name: formData.name,
        age: Number(formData.age),
        height: heightCm,
        currentWeight: Number(formData.weight),
        startingWeight: formData.startingWeight
          ? Number(formData.startingWeight)
          : Number(formData.weight),
        goalWeight: Number(formData.goalWeight),
        fitnessGoal: mapFitnessGoalToNumber(formData.fitnessGoals),
        dietaryPreferences: formData.dietaryPreferences,
      };

      const response = await fetch(`${SERVER_URL}/api/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Sending to server:", requestBody);
      if (!response.ok) {
        let errorMessage = "Failed to save user data";

        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }
      console.log("User data saved", formData);
      setEditMode(false);
    } catch (error) {
      console.error("Error saving user data:", error.message);

      alert(`Error: ${error.message}`);
    }
  };

  const mapFitnessGoalToNumber = (goalsArray) => {
    if (goalsArray.includes("Lose weight")) return 1;
    if (goalsArray.includes("Build muscle")) return 2;
    if (goalsArray.includes("Maintain weight")) return 3;
    return null;
  };

  const mapFitnessGoalToArray = (goalNumber) => {
    switch (goalNumber) {
      case 1:
        return ["Lose weight"];
      case 2:
        return ["Build muscle"];
      case 3:
        return ["Maintain weight"];
      default:
        return [];
    }
  };

  const progressPercent =
    formData.weight && formData.goalWeight && formData.startingWeight
      ? formData.startingWeight > formData.goalWeight
        ? Math.max(
            0,
            Math.min(
              100,
              ((formData.startingWeight - formData.weight) /
                (formData.startingWeight - formData.goalWeight)) *
                100
            )
          )
        : Math.max(
            0,
            Math.min(
              100,
              ((formData.weight - formData.startingWeight) /
                (formData.goalWeight - formData.startingWeight)) *
                100
            )
          )
      : 0;

  const goalReached =
    formData.goalWeight && formData.weight
      ? formData.startingWeight > formData.goalWeight
        ? parseFloat(formData.weight) <= parseFloat(formData.goalWeight)
        : parseFloat(formData.weight) >= parseFloat(formData.goalWeight)
      : false;

  return (
    <div className="profile-page profile-layout">
      <div className="header">
        <h4>Profile</h4>
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
                maxLength={25}
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
                  name="feet"
                  value={formData.height.feet}
                  onChange={handleHeightChange}
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
                  name="inches"
                  value={formData.height.inches}
                  onChange={handleHeightChange}
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
                {formData.height.feet !== "" && formData.height.inches !== ""
                  ? `${formData.height.feet} ft ${formData.height.inches} in`

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
              <span>
                {formData.goalWeight ? `${formData.goalWeight} lbs` : "—"}
              </span>
            )}
          </label>

          <div className="profile-actions">
            {editMode ? (
              <>
                <button className="btn btn-text" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-text"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="btn btn-text"
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="side-column body-s">
          <div className="weight-tracker body-s">
            <h5>Weight Progress</h5>
            <p className="body-s">
              Starting Weight: {formData.startingWeight || "—"} lbs
            </p>
            <p>Current Weight: {formData.weight || "—"} lbs</p>
            <p>Goal Weight: {formData.goalWeight || "—"} lbs</p>
            <div className="profile-progress-bar">
              <div
                className="profile-progress-fill"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            {goalReached && (
              <p className="goal-message">
                {" "}
                Congrats! You&apos;ve reached your goal weight!
              </p>
            )}
          </div>

          <div className="fitness-goals-section">
            <h5>Fitness Goals</h5>
            {editMode ? (
              <div className="fitness-goals-dropdown">
                {["Lose weight", "Build muscle", "Maintain weight"].map(
                  (goal) => (
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
                  )
                )}
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
                {[
                  "Vegetarian",
                  "Vegan",
                  "Keto",
                  "Paleo",
                  "Gluten-Free",
                  "Dairy-Free",
                  "Low-Carb",
                  "High-Protein",
                ].map((pref) => (
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
