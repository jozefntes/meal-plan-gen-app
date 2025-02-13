const dotenv = require("dotenv"); //setup your own .env file with API_KEY=*YOUR_API_KEY*, from gemini studio to be able to generate AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
let age = "21";
let weight = "205";
let height = "5'9";
let goal = "lose weight";
let favorites = "pizza, burgers, chicken nuggets, quesadillas";

// console.log("Using API Key:", process.env.API_KEY);

async function run() {
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    // const prompt = `Age: ${age},
    //                 Weight: ${weight} lbs,
    //                 Hieght: ${height}",
    //                 Goal: ${goal},
    //                 Favorite Foods: ${favorites}, 
    //                 Please generate 1 meal plan where the person can 
    //                 reach their goal and a meal that includes a little 
    //                 bit of similarity from their favorite foods.`; // This prompt gets sent to AI
    const prompt = `Can you read all the data off of this online api website, spoonacular.com by yourself to be able to suggest me pre made meal plans from there?`


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text(); // This is the response from the AI about the prompt
    console.log(text);
}

run();