const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");
const dotenv = require("dotenv");

const { GoogleGenerativeAI } = require("@google/generative-ai");
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    response_mime_type: "application/json",
  },
});

// connect to db
let db;
(async () => {
  db = await open({
    filename: "db/data.sqlite",
    driver: sqlite3.Database,
  });
})();

app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  const name = process.env.NAME || "World";
  res.send(`Hello ${name}!`);
});

app.post("/api/generate_recipe", async (req, res) => {
  const { ingredients, minProtein, maxCarbs, maxFat } = req.body;

  console.log("Request body:", req.body);
  console.log(ingredients, minProtein, maxCarbs, maxFat);

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
    console.log("Text: ", recipeText);
    console.log("Full Array: ", recipe);
    console.log("First: ", recipe[0]);
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
