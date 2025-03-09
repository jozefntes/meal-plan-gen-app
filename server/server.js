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

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

try {
  const usingEmulator =
    process.env.FUNCTIONS_EMULATOR === "true" ||
    process.env.FIRESTORE_EMULATOR_HOST;

  if (usingEmulator) {
    // Local development: Use emulator
    admin.initializeApp({
      projectId: "mealplangenerator-2c4bb",
    });

    console.log("Firebase Admin SDK initialized (local development).");
  } else {
    // Cloud Run: Use ADC (Application Default Credentials)
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: "mealplangenerator-2c4bb",
    });
    console.log("Firebase Admin SDK initialized using ADC (Cloud Run).");
  }
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
}

const db = admin.firestore();

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

  try {
    const recipes = [];
    for (const mealId of selectedMeals) {
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

    // filter recipes by meal group
    const breakfastRecipes = recipes.filter((recipe) => recipe.mealGroup === 1);
    const lunchRecipes = recipes.filter((recipe) => recipe.mealGroup === 2);
    const dinnerRecipes = recipes.filter((recipe) => recipe.mealGroup === 3);
    const snackRecipes = recipes.filter((recipe) => recipe.mealGroup === 4);

    try {
      const prompt = `Generate a meal plan for the week starting on ${formattedWeekStartDate} (a Monday)
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

      // Populate the mealPlan array with the required format
      const populatedMealPlan = mealPlan.dates.map((day) => ({
        date: day.date,
        meals: day.meals.map((meal) => {
          const recipe = recipes.find((r) => r.id === meal.id);
          return {
            id: recipe.id,
            groupMeal: recipe.mealGroup,
            title: recipe.title,
            image: recipe.image || "",
            nutrition: {
              calories: recipe.nutrition.calories,
              protein: recipe.nutrition.protein,
              carbs: recipe.nutrition.carbs,
              fat: recipe.nutrition.fat,
            },
            done: false,
          };
        }),
      }));

      // Save meal plan to Firebase
      const userDocRef = db.collection("plans").doc(uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        await userDocRef.set({ uid: uid });
      }

      const datesCollectionRef = userDocRef.collection("dates");

      for (const day of populatedMealPlan) {
        const dateDocRef = await datesCollectionRef.add({ date: day.date });
        const mealsCollectionRef = dateDocRef.collection("meals");

        for (const meal of day.meals) {
          const mealDocRef = mealsCollectionRef.doc();
          await mealDocRef.set(meal);
        }

        await dateDocRef.set({
          date: day.date,
        });
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

app.post("/api/generate_recipe", async (req, res) => {
  const { uid, ingredients, minProtein, maxCarbs, maxFat, mealGroup } =
    req.body;

  if (
    !uid ||
    !ingredients ||
    !minProtein ||
    !maxCarbs ||
    !maxFat ||
    !mealGroup
  ) {
    return res.status(400).json({ error: "All fields are required" });
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

    recipe.mealGroup = mealGroup;
    recipe.uid = uid;

    // Generate an image for the recipe
    try {
      const imageBlob = await hf.textToImage({
        model: "black-forest-labs/FLUX.1-dev",
        inputs: recipe.title,
      });

      const arrayBuffer = await imageBlob.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);

      // Convert the image buffer to a base64 string
      const base64Image = imageBuffer.toString("base64");

      // Add the base64 image to the recipe object
      recipe.image = base64Image;
    } catch (error) {
      console.error("Error generating image:", error);
      recipe.image = null;
    }

    // Save recipe to database
    try {
      const docRef = await db.collection("recipes").add(recipe);
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

const port = parseInt(process.env.PORT) || 8080;
const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

// Increase server timeout to 5 minutes (300000 milliseconds)
server.timeout = 300000;
