import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import { applicationDefault } from "firebase-admin/app";
import { readFile } from "fs/promises";
import { HfInference } from "@huggingface/inference";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    response_mime_type: "application/json",
  },
});

const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
  generationConfig: {
    responseModalities: ["Text", "Image"],
  },
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

try {
  const usingEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    process.env.FIRESTORE_EMULATOR_HOST;

  if (usingEmulator) {
    // Local development: Use emulator
    admin.initializeApp({
      projectId: "mealplangenerator-2c4bb",
      storageBucket: "mealplangenerator-2c4bb.firebasestorage.app",
    });

    console.log("Firebase Admin SDK initialized (local development).");
  } else {
    // Cloud Run: Use ADC (Application Default Credentials)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "mealplangenerator-2c4bb",
      storageBucket: "mealplangenerator-2c4bb.firebasestorage.app",
    });
    console.log("Firebase Admin SDK initialized using ADC (Cloud Run).");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

const app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cors());

// Middleware to verify the Firebase ID token
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

app.get("/api/recipes/:uid", verifyToken, async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  // Verify that the uid from the token matches the uid parameter
  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const q = db.collection("recipes").where("uid", "==", uid);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ error: "No recipes found for this user" });
    }

    const recipes = [];
    querySnapshot.forEach((doc) => {
      recipes.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes: ", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// Fetch a specific recipe by document ID
app.get("/api/recipe/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    const docRef = db.collection("recipes").doc(recipeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = doc.data();

    // Verify that the uid from the token matches the uid in the recipe
    if (req.user.uid !== recipe.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe: ", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
});

app.get("/api/meal_plans/:uid", verifyToken, async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const q = db.collection("plans").doc(uid).collection("dates");
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return res
        .status(404)
        .json({ error: "No meal plans found for this user" });
    }

    const mealPlans = [];
    for (const doc of querySnapshot.docs) {
      const dateData = { id: doc.id, ...doc.data() };
      mealPlans.push(dateData);
    }

    res.status(200).json(mealPlans);
  } catch (error) {
    console.error("Error fetching meal plans: ", error);
    res.status(500).json({ error: "Failed to fetch meal plans" });
  }
});

app.get("/api/users/:uid", verifyToken, async (req, res) => {
  const uid = req.params.uid;

  if (!uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const userDocRef = db.collection("users").doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user data: ", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.post("/api/generate_meal_plan", verifyToken, async (req, res) => {
  const { uid, selectedMeals, weekNumber } = req.body;

  if (
    !uid ||
    !selectedMeals ||
    weekNumber === undefined ||
    weekNumber === null
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof weekNumber !== "number" || weekNumber < 0 || weekNumber > 3) {
    return res.status(400).json({ error: "Invalid week number" });
  }

  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Calculate the start date based on the weekNumber
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diffToMonday = (dayOfWeek + 6) % 7; // Calculate the difference to Monday
  const mondayOfCurrentWeek = new Date(today);
  mondayOfCurrentWeek.setDate(today.getDate() - diffToMonday);
  const weekStartDate = new Date(mondayOfCurrentWeek);
  weekStartDate.setDate(mondayOfCurrentWeek.getDate() + weekNumber * 7);
  const formattedWeekStartDate = weekStartDate.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // Get unique meal IDs
  const uniqueMealIds = [...new Set(Object.values(selectedMeals).flat())];

  console.debug("Unique Meal IDs:", uniqueMealIds);

  try {
    const recipes = [];
    for (const mealId of uniqueMealIds) {
      const docRef = db.collection("recipes").doc(mealId);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      if (doc.data().uid !== uid) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const recipe = doc.data();
      recipe.id = doc.id;
      recipes.push(recipe);
    }

    // Create a map of recipes for quick lookup
    const recipeMap = recipes.reduce((map, recipe) => {
      map[recipe.id] = recipe;
      return map;
    }, {});

    // Associate recipes with their respective meal groups
    const breakfastRecipes = selectedMeals.breakfast
      .map((id) => recipeMap[id])
      .filter((recipe) => recipe !== undefined);
    const lunchRecipes = selectedMeals.lunch
      .map((id) => recipeMap[id])
      .filter((recipe) => recipe !== undefined);
    const dinnerRecipes = selectedMeals.dinner
      .map((id) => recipeMap[id])
      .filter((recipe) => recipe !== undefined);
    const snackRecipes = selectedMeals.snack
      .map((id) => recipeMap[id])
      .filter((recipe) => recipe !== undefined);

    console.log("Breakfast Recipes:", breakfastRecipes);
    console.log("Lunch Recipes:", lunchRecipes);
    console.log("Dinner Recipes:", dinnerRecipes);
    console.log("Snack Recipes:", snackRecipes);

    try {
      const prompt = `Generate a meal plan for the week starting on ${formattedWeekStartDate} in MM/DD/YYYY format (a Monday)
                    using the following meals:
                    Breakfast - ${breakfastRecipes
                      .map(
                        (r) =>
                          `${r.id}: ${r.title} (${r.nutrition.calories}cal, ${r.nutrition.protein}p, ${r.nutrition.carbs}c, ${r.nutrition.fat}f)`
                      )
                      .join(" | ")}
                    Lunch - ${lunchRecipes
                      .map(
                        (r) =>
                          `${r.id}: ${r.title} (${r.nutrition.calories}cal, ${r.nutrition.protein}p, ${r.nutrition.carbs}c, ${r.nutrition.fat}f)`
                      )
                      .join(" | ")}
                    Dinner - ${dinnerRecipes
                      .map(
                        (r) =>
                          `${r.id}: ${r.title} (${r.nutrition.calories}cal, ${r.nutrition.protein}p, ${r.nutrition.carbs}c, ${r.nutrition.fat}f)`
                      )
                      .join(" | ")}
                    Snack - ${snackRecipes
                      .map(
                        (r) =>
                          `${r.id}: ${r.title} (${r.nutrition.calories}cal, ${r.nutrition.protein}p, ${r.nutrition.carbs}c, ${r.nutrition.fat}f)`
                      )
                      .join(" | ")}
                    The meal plan should be balanced using the nutritional values included.
                    The date should be in YYYY-MM-DD format
                    The response should be a JSON object with the following schema:
                    dates: [
                      {
                        date: string,
                        meals: [
                          {
                            id: string,
                          }
                        ]
                      }
                    ]`;

      const result = await model.generateContent(prompt);
      const mealPlanText = await result.response.text();

      const mealPlan = JSON.parse(mealPlanText);

      const populatedMealPlan = mealPlan.dates.map(({ date, meals }) => ({
        date: new Date(date).toISOString().split("T")[0],
        meals: meals.map(({ id }, index) => ({
          id,
          mealInstanceId: `${id}-${index}-${date}`,
          done: false,
        })),
      }));

      // Save meal plan to Firebase
      try {
        const userDocRef = db.collection("plans").doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
          await userDocRef.set({ uid });
        }

        const datesCollectionRef = userDocRef.collection("dates");

        for (const day of populatedMealPlan) {
          const dateDocRef = await datesCollectionRef.doc(day.date);

          await dateDocRef.set({
            date: day.date,
            meals: day.meals,
          });
        }
      } catch (error) {
        console.error("Error saving meal plan:", error);
        return res.status(500).json({ error: "Failed to save meal plan" });
      }

      res.status(200).json({
        message: "Meal plan generated successfully",
      });
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ error: "Failed to generate meal plan" });
    }
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

app.post("/api/generate_recipe", verifyToken, async (req, res) => {
  const { uid, ingredients, minProtein, maxCarbs, maxFat } = req.body;

  const validMinProtein = minProtein >= 0 && minProtein <= 60;
  const validMaxCarbs = maxCarbs >= 0 && maxCarbs <= 100;
  const validMaxFat = maxFat >= 0 && maxFat <= 100;

  if (
    !uid ||
    !ingredients ||
    !validMinProtein ||
    !validMaxCarbs ||
    !validMaxFat
  ) {
    return res.status(400).json({
      error: "All fields are required and fall within the specified ranges",
    });
  }

  // Verify that the uid from the token matches the uid parameter
  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const prompt = `Generate a recipe using the following ingredients: ${ingredients}. The recipe should have at least ${minProtein} g of protein, and as much as ${maxCarbs} g of carbs, and ${maxFat} g of fat. Using this JSON schema:
    
      Recipe = {
        title: string,
        readyInMinutes: number,
        ingredients: string[],
        instructions: string[],
        nutrition: {
          calories: number,
          protein: number,
          carbs: number,
          fat: number
        }
      }
      Return: Recipe
    `;

    const result = await model.generateContent(prompt);
    const recipeText = await result.response.text();

    const parsedRecipe = JSON.parse(recipeText);
    let recipe;

    // Check if returned recipe is an array or object and extract recipe
    if (Array.isArray(parsedRecipe)) {
      recipe = parsedRecipe[0];
    } else {
      recipe = parsedRecipe;
    }

    recipe.uid = uid;
    recipe.image = null;

    // Generate an image for the recipe
    try {
      const contents = `Generate an image of ${recipe.title}`;

      const response = await imageModel.generateContent(contents);
      for (const part of response.response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageData = part.inlineData.data;
          const buffer = Buffer.from(imageData, "base64");

          const fileName = `images/${uuidv4()}.png`;
          const file = bucket.file(fileName);
          await file.save(buffer, {
            metadata: {
              contentType: "image/png",
              metadata: {
                description: recipe.title,
              },
            },
          });

          const [url] = await file.getSignedUrl({
            action: "read",
            expires: "03-01-2500",
          });

          recipe.image = url;
          break;
        }
      }
    } catch (error) {
      console.error("Error generating content:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
    }

    // Save recipe to database
    try {
      const docRef = await db.collection("recipes").add(recipe);
      recipe.id = docRef.id;
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    res.status(200).json({
      message: "Recipe generated successfully",
      recipe,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// Update a meal plan for a specific date
app.post("/api/replace_recipe", verifyToken, async (req, res) => {
  const { uid, date, currentMealId, newMealId } = req.body;

  if (!uid || !date || !currentMealId || !newMealId) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Verify that the newMealId is not the same as the currentMealId
  if (currentMealId === newMealId) {
    return res
      .status(400)
      .json({ error: "New meal ID must differ from the current meal ID" });
  }

  // Verify that the date is in YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  // Verify that the newMealId is valid
  const docRef = db.collection("recipes").doc(newMealId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return res.status(404).json({ error: "New meal not found" });
  }

  try {
    const userDocRef = db.collection("plans").doc(uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }
    const datesCollectionRef = userDocRef.collection("dates");
    const dateDocRef = datesCollectionRef.doc(date);
    const dateDoc = await dateDocRef.get();
    if (!dateDoc.exists) {
      return res.status(404).json({ error: "Meal plan not found" });
    }
    const mealPlan = dateDoc.data();
    const meals = mealPlan.meals;

    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: "Invalid meal plan format" });
    }

    const mealIndex = meals.findIndex((meal) => meal.id === currentMealId);
    if (mealIndex === -1) {
      return res.status(404).json({ error: "Current meal not found" });
    }

    meals[mealIndex] = {
      id: newMealId,
      mealInstanceId: `${newMealId}-${mealIndex}-${date}`,
      done: false,
    };

    // Save the updated meal plan back to Firestore
    await dateDocRef.set({ meals }, { merge: true });

    res.status(200).json({ message: "Meal plan updated successfully" });
  } catch (error) {
    console.error("Error updating meal plan:", error);
    res.status(500).json({ error: "Failed to update meal plan" });
  }
});

app.post("/api/users", verifyToken, async (req, res) => {
  const {
    uid,
    name,
    age,
    gender,
    baselineActivity,
    height,
    currentWeight,
    goalWeight,
    weightGoalRate,
    dietaryPreferences,
  } = req.body;

  if (
    !uid ||
    !name ||
    !age ||
    !gender ||
    !baselineActivity ||
    !height ||
    !currentWeight ||
    !goalWeight ||
    !weightGoalRate
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  if (typeof name !== "string" || name.length < 1 || name.length > 25) {
    return res
      .status(400)
      .json({ error: "Name must be a string between 1 and 25 characters" });
  }
  if (typeof age !== "number" || age < 0) {
    return res.status(400).json({ error: "Invalid age" });
  }
  if (typeof height !== "number" || height < 0) {
    return res.status(400).json({ error: "Invalid height" });
  }
  if (typeof currentWeight !== "number" || currentWeight < 0) {
    return res.status(400).json({ error: "Invalid current weight" });
  }
  if (typeof goalWeight !== "number" || goalWeight < 0) {
    return res.status(400).json({ error: "Invalid goal weight" });
  }
  if (!Array.isArray(dietaryPreferences)) {
    return res
      .status(400)
      .json({ error: "Dietary preferences must be an array" });
  }
  if (dietaryPreferences.length > 8) {
    return res
      .status(400)
      .json({ error: "Dietary preferences must be between 0 and 8" });
  }

  const weightInKg = currentWeight * 0.453592;

  let BMR;
  if (gender === "male") {
    BMR = 88.362 + 13.397 * weightInKg + 4.799 * height - 5.677 * age;
  } else if (gender === "female") {
    BMR = 447.593 + 9.247 * weightInKg + 3.098 * height - 4.33 * age;
  } else {
    return res.status(400).json({ error: "Invalid gender" });
  }

  switch (baselineActivity) {
    case "none":
      break;
    case "sedentary":
      BMR *= 1.2;
      break;
    case "lightly-active":
      BMR *= 1.375;
      break;
    case "moderately-active":
      BMR *= 1.5;
      break;
    case "very-active":
      BMR *= 1.9;
      break;
    default:
      return res.status(400).json({ error: "Invalid activity level" });
  }

  let calorieChange;
  switch (weightGoalRate) {
    case "slow":
      calorieChange = 125;
      break;
    case "medium":
      calorieChange = 250;
      break;
    case "fast":
      calorieChange = 375;
      break;
    case "very-fast":
      calorieChange = 500;
      break;
    default:
      return res.status(400).json({ error: "Invalid weight goal rate" });
  }

  let energyTarget;
  let goalDirection;
  if (goalWeight < currentWeight) {
    goalDirection = 1; // weight loss
  } else if (goalWeight > currentWeight) {
    goalDirection = 2; // weight gain
  } else {
    goalDirection = 3; // maintenance
  }

  switch (goalDirection) {
    case 1:
      energyTarget = BMR - calorieChange;
      break;
    case 2:
      energyTarget = BMR + calorieChange;
      break;
    case 3:
      energyTarget = BMR;
      break;
  }

  try {
    if (req.user.uid !== uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const userDocRef = db.collection("users").doc(uid);
    await userDocRef.set(
      {
        name,
        age,
        gender,
        height,
        baselineActivity,
        currentWeight,
        goalWeight,
        weightGoalRate,
        dietaryPreferences,
        targets: {
          energy: Math.round(energyTarget),
          protein: Math.round((energyTarget * 0.3) / 4),
          carbs: Math.round((energyTarget * 0.4) / 4),
          fat: Math.round((energyTarget * 0.3) / 9),
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.status(200).json({ message: "User details saved successfully" });
  } catch (error) {
    console.error("Error saving user details:", error);
    res.status(500).json({ error: "Failed to save user details" });
  }
});

app.patch("/api/meal_done", verifyToken, async (req, res) => {
  const { uid, date, mealInstanceId, done } = req.body;

  if (!uid || !date || !mealInstanceId || typeof done !== "boolean") {
    return res
      .status(400)
      .json({ error: "All fields are required and 'done' must be a boolean" });
  }

  if (req.user.uid !== uid) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const dateDocRef = db
      .collection("plans")
      .doc(uid)
      .collection("dates")
      .doc(date);
    const dateDoc = await dateDocRef.get();

    if (!dateDoc.exists) {
      return res
        .status(404)
        .json({ error: "Meal plan for the specified date not found" });
    }

    const mealPlan = dateDoc.data();
    const meals = mealPlan.meals;

    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: "Invalid meal plan format" });
    }

    const mealIndex = meals.findIndex(
      (meal) => meal.mealInstanceId === mealInstanceId
    );

    if (mealIndex === -1) {
      return res.status(404).json({ error: "Meal not found" });
    }

    meals[mealIndex].done = done;

    await dateDocRef.set({ meals }, { merge: true });

    res
      .status(200)
      .json({ message: "Meal updated successfully", meal: meals[mealIndex] });
  } catch (error) {
    console.error("Error updating meal:", error);
    res.status(500).json({ error: "Failed to update meal" });
  }
});

// Delete a specific recipe by document ID
app.delete("/api/recipes/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;

  if (!recipeId) {
    return res.status(400).json({ error: "Recipe ID is required" });
  }

  try {
    const docRef = db.collection("recipes").doc(recipeId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const recipe = doc.data();

    // Verify that the uid from the token matches the uid in the recipe
    if (req.user.uid !== recipe.uid) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await docRef.delete();

    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe: ", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

const port = parseInt(process.env.PORT) || 8080;
const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

// Increase server timeout to 5 minutes (300000 milliseconds)
server.timeout = 300000;
