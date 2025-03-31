// import 'dotenv/config';
import { Recipe } from "@/types";

export const fetchRecipes = async (query: string): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=30&apiKey=${
        import.meta.env.VITE_SPOONACULAR_API_KEY
      }`
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    return data.results as Recipe[]; // Returns an array of recipes
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
};
