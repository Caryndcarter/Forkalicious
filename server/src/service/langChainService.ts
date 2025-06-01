import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import dotenv from "dotenv";
import { dietValues } from "../types/index.js";
import { Request, Response } from "express";

// Retrive API key
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;

// Define response schema
const ResponseFormatter = z.object({
  title: z.string().describe("The title of the recipe (string)."),
  Summary: z.string().describe("A detailed summary of the recipe (string)."),
  ReadyInMinutes: z
    .string()
    .describe("The total preparation time in minutes (integer)."),
  Servings: z
    .string()
    .describe("Number of servings this recipe makes (integer)."),
  Ingredients: z
    .string()
    .describe("List of ingredients separated by semicolons (string)."),
  Instructions: z
    .string()
    .describe("Steps for making the recipe, formatted as a string."),
  Steps: z
    .string()
    .describe("Steps formatted as a semicolon-delimited list (string)."),
  Diets: z
    .string()
    .describe(
      `A list of applicable diets, chosen **only** from the following: ${dietValues}`
    ),
});

const ComponentFormatter = z.object({
  value: z.string().describe("The generated value for the component"),
});

// interface recipeResponse {
//   title: string;
//   summary: string;
//   ReadyInMinutes: string;
//   Servings: string;
//   Ingredients: string;
//   Steps: string;
//   Diets: string;
// }

// Create the system prompt
const systemPrompt = `You are a fun, helpful cooking expert. 
Your job is to provide high-quality recipies, adhearing to any of 
the user's instructions. If the question is unrelated to cooking, 
just create a template recipe.`;

let model: ReturnType<ChatOpenAI["withStructuredOutput"]>;
let componentModel: ReturnType<ChatOpenAI["withStructuredOutput"]>;

if (apiKey) {
  const chatModel = new ChatOpenAI({
    temperature: 1,
    openAIApiKey: apiKey,
    modelName: "gpt-4o-mini",
  });
  model = chatModel.withStructuredOutput(ResponseFormatter, {
    name: "extract_traits",
    strict: true,
  });
  componentModel = chatModel.withStructuredOutput(ComponentFormatter, {
    name: "generate_component",
    strict: true,
  });
}

// Define functions to generate the AI response
const parseAiMsg = (
  aiMsg: Record<string, any> | { raw: any; parsed: Record<string, any> }
) => {
  if ("raw" in aiMsg && "parsed" in aiMsg) {
    return aiMsg.parsed;
  } else {
    return aiMsg;
  }
};

const promptFunc = async (input: string): Promise<string> => {
  try {
    const aiMsg = await model.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: input,
      },
    ]);
    return parseAiMsg(aiMsg);
  } catch (err) {
    throw err;
  }
};

// Helper for component generation
const listComponents = ['ingredients', 'steps', 'diets'];

const generateComponentPrompt = (component: string, recipe: Record<string, any>): string => {
  let known = '';
  for (const [key, value] of Object.entries(recipe)) {
    if (value) {
      known += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
    }
  }
  let formatInstruction = '';
  if (listComponents.includes(component.toLowerCase())) {
    formatInstruction = 'Format as a semicolon-delimited list.';
  }
  return `Given the following recipe information:\n${known}\nGenerate only the ${component}. ${formatInstruction}`;
};

const generateComponentFunc = async (component: string, recipe: Record<string, any>): Promise<string> => {
  try {
    const prompt = generateComponentPrompt(component, recipe);
    const aiMsg = await componentModel.invoke([
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ]);
    return (parseAiMsg(aiMsg) as { value: string }).value;
  } catch (err) {
    throw err;
  }
};

// Handle the POST request to generate the AI response
export const askQuestion = async (req: Request, res: Response) => {
  try {
    const userQuestion: string = req.body.question;
    const aiAnswer: string = await promptFunc(userQuestion);
    res.json({
      question: userQuestion,
      formattedResponse: aiAnswer,
    });
  } catch (err) {
    res.status(500).json({
      response: "Error generating the AI Resposne",
    });
    console.error(err);
  }
};

export const generateComponent = async (req: Request, res: Response) => {
  try {
    const { component, recipe } = req.body;
    const value = await generateComponentFunc(component, recipe);
    res.json({
      component,
      value,
    });
  } catch (err) {
    res.status(500).json({
      response: "Error generating the component",
    });
    console.error(err);
  }
};
