const dotenv = require("dotenv"); //setup your own .env file with API_KEY=*YOUR_API_KEY*, from gemini studio to be able to generate AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
let age = "21";
let weight = "205";
let height = "5'9";
let goal = "lose weight";
let favorites = "pizza, burgers, chicken nuggets, quesadillas";

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    const prompt = `Generate a dish, Return your response in this format, Calories: ,Ingredients: ,Protien: ,Carbs: , Sodium: ,Sugar: . Dont say anymore after that`

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // This is the response from the AI about the prompt

    // console.log("AI response", text);

    const nutrition = extractNutritionData(text);

    console.log("Extracted Nutrition Data:", nutrition);

    // console.log(text);
}


function extractNutritionData(input) {
  const nutritionData = {};
  
  const regexPatterns = {
    calories: /Calories:\s*(\d+)/,
    ingredients: /Ingredients:\s*(.*)/,
    protein: /Protein:\s*(\d+g)/,
    carbs: /Carbs:\s*(\d+g)/,
    sodium: /Sodium:\s*(\d+mg)/,
    sugar: /Sugar:\s*(\d+g)/
  };
  
  for (const [key, regex] of Object.entries(regexPatterns)) {
    const match = input.match(regex);
    if (match) {
      nutritionData[key] = match[1].trim();
    }
  }
  
  return nutritionData;
}

run();