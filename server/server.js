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

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Local development: Use the service account file
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const serviceAccount = JSON.parse(
      await readFile(serviceAccountPath, "utf8")
    );

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
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

app.post("/api/generate_meal_plan", verifyToken, async (req, res) => {
  const { uid, selectedMeals, weekNumber } = req.body;

  if (!uid || !selectedMeals || weekNumber === undefined) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Calculate the start date based on the weekNumber
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diffToMonday = (dayOfWeek + 6) % 7; // Calculate the difference to Monday
  const mondayOfCurrentWeek = new Date(today.setDate(today.getDate() - diffToMonday));
  const weekStartDate = new Date(mondayOfCurrentWeek.setDate(mondayOfCurrentWeek.getDate() + weekNumber * 7)).toISOString().split("T")[0];

  try {
    const prompt = `Generate a meal plan for the week starting on ${weekStartDate} 
                    using the following meals: ${JSON.stringify(selectedMeals)}. 
                    The meal plan should be balanced and include breakfast, lunch, 
                    dinner, and snacks for each day.
                    The response should be a JSON object with the following schema:
                    dates: [
                      {
                        date: string,
                        meals: {
                          breakfast: string,
                          lunch: string,
                          dinner: string,
                          snack: string
                        }
                      }
                    ]`;

    const result = await model.generateContent(prompt);
    const mealPlanText = await result.response.text();

    const mealPlan = JSON.parse(mealPlanText);

    // Save meal plan to Firebase
    const userDocRef = db.collection("plans").doc(uid);
    const datesCollectionRef = userDocRef.collection("dates");

    for (const day of mealPlan.dates) {
      const dateDocRef = datesCollectionRef.doc(day.date);
      const mealsCollectionRef = dateDocRef.collection("meals");

      for (const [mealType, mealTitle] of Object.entries(day.meals)) {
        const mealDocRef = mealsCollectionRef.doc();
        await mealDocRef.set({
          title: mealTitle,
          mealGroup: getMealGroup(mealType),
          done: false,
        });
      }

      await dateDocRef.set({
        date: day.date,
      });
    }

    await userDocRef.set({
      uid: uid,
    });

    res.status(200).json({ message: "Meal plan generated successfully", mealPlan });
  } catch (error) {
    console.error("Error generating meal plan:", error);
    res.status(500).json({ error: "Failed to generate meal plan" });
  }
});

function getMealGroup(mealType) {
  switch (mealType) {
    case "breakfast":
      return 1;
    case "lunch":
      return 2;
    case "dinner":
      return 3;
    case "snack":
      return 4;
    default:
      return 0;
  }
}

app.post("/api/generate_recipe", verifyToken, async (req, res) => {
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

  try {
    const prompt = `Generate a recipe using the following ingredients: ${ingredients}. The recipe should have at least ${minProtein} g of protein, and as much as ${maxCarbs} g of carbs, and ${maxFat} g of fat. Using this JSON schema:
    
      Recipe = {
        title: string,
        readyInMinutes: number,
        ingredients: string[],
        instructions: string[],
        nutrition: {
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
app.listen(port, () => console.log(`Server listening on port ${port}`));
