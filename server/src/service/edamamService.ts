// server\src\service\edamamService.ts
import dotenv from "dotenv";
import recipe from "../types/recipe.js";
dotenv.config({ path: "../.env" });
import searchInput from "../types/searchInput";

class EdamamService {
  private baseURL?: string;
  private appId?: string;
  private appKey?: string;

  constructor() {
    this.baseURL = process.env.EDAMAM_BASE_URL || "https://api.edamam.com";
    this.appId = process.env.EDAMAM_APP_ID || "";
    this.appKey = process.env.EDAMAM_APP_KEY || "";
  }

  async findRecipes(input: searchInput) {
    try {
      let searchURL = `${this.baseURL}/search?app_id=${this.appId}&app_key=${this.appKey}&from=0&to=9`;

      if (input.query) {
        searchURL += `&q=${encodeURIComponent(input.query)}`;
      }
      // Add other parameters as needed
      Object.entries(input).forEach(([key, value]) => {
        searchURL += `&${key}=${value}`;
      });

      const response = await fetch(searchURL);
      const recipes = await response.json();
      const parsedRecipes = recipes.hits.map((hit: any) => {
        return {
          edamamId: hit.recipe.uri.split("_")[1], // Extract ID from URI
          image: hit.recipe.image,
          title: hit.recipe.label,
          source: "edamam",
        };
      });

      return parsedRecipes;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async findRandomRecipes() {
    try {
      // Edamam doesn't have a direct random endpoint, so we'll use a generic search
      const searchURL = `${this.baseURL}/search?q=popular&app_id=${this.appId}&app_key=${this.appKey}&from=0&to=12`;
      const response = await fetch(searchURL);
      const recipesData = await response.json();

      const parsedRecipes = recipesData.hits.map((hit: any) => {
        return {
          edamamId: hit.recipe.uri.split("_")[1],
          image: hit.recipe.image,
          title: hit.recipe.label,
          source: "edamam",
        };
      });

      return parsedRecipes;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async findInformation(id: string): Promise<recipe | null> {
    try {
      // Edamam uses recipe URI for details, but since we extracted ID, we need to reconstruct
      const recipeUri = `http://www.edamam.com/ontologies/edamam.owl#recipe_${id}`;
      const searchURL = `${this.baseURL}/search?r=${encodeURIComponent(
        recipeUri
      )}&app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);
      const [recipeData] = await response.json();

      if (!recipeData) return null;

      return this.parseInformation(recipeData);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  parseInformation(information: any): recipe {
    return {
      title: information.label,
      summary: information.shareAs || "",
      readyInMinutes: information.totalTime || 0,
      servings: information.yield || 1,
      ingredients: information.ingredients.map((ingredient: any) => {
        return ingredient.text;
      }),
      instructions: information.instructions || "",
      steps: information.instructions
        ? information.instructions.split(".")
        : [],
      diet: information.dietLabels || [],
      image: information.image,
      sourceUrl: information.url,
      spoonacularSourceUrl: "", // Not applicable for Edamam
      spoonacularId: undefined, // Not applicable
      edamamId: information.uri.split("_")[1],
    };
  }
}

export default new EdamamService();
