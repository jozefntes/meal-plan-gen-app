import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase-admin/auth";
import {
  getFirestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

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

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsk_VUHx8tLbXVXhew-3zlQc_omJpPt6Y",
  authDomain: "mealplangenerator-2c4bb.firebaseapp.com",
  projectId: "mealplangenerator-2c4bb",
  storageBucket: "mealplangenerator-2c4bb.firebasestorage.app",
  messagingSenderId: "800241720030",
  appId: "1:800241720030:web:6ab7c20f179fb463c7804f",
  measurementId: "G-HV9PRZR3PZ",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Initialize Firebase Admin SDK with service account, required to access Firestore and verify auth post
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

app.get("/api/recipes/:uid", async (req, res) => {
  if (!req.params.uid) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const uid = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: "Invalid User ID" });
  }

  try {
    const q = query(collection(db, "recipes"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);

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

app.post("/api/authenticate", async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Save the UID to the database if needed
    // Example: Save to a "users" collection
    const userRef = collection(db, "users");
    await addDoc(userRef, { uid });

    res.status(200).json({ uid });
  } catch (error) {
    console.error("Error verifying token: ", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/generate_recipe", async (req, res) => {
  const { uid } = req.params;
  const { ingredients, minProtein, maxCarbs, maxFat, mealGroup } =
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
      const docRef = await addDoc(collection(db, "recipes"), recipe);
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
