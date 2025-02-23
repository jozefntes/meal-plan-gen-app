import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    response_mime_type: "application/json",
  },
});

const app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

app.post("/api/generate_recipe", async (req, res) => {
  const { ingredients, minProtein, maxCarbs, maxFat } = req.body;

  if (!ingredients || !minProtein || !maxCarbs || !maxFat) {
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

    const recipe = JSON.parse(recipeText);

    res.status(200).json({
      message: "Recipe generated successfully",
      recipe: recipe[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => console.log(`Server listening on port ${port}`));
