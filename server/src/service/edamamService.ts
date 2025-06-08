// server\src\service\edamamService.ts
import dotenv from "dotenv";
import recipe from "../types/recipe.js";
dotenv.config({ path: "../.env" });
// import searchInput from "../types/searchInput";

class EdamamService {
  private baseURL?: string;
  private appId?: string;
  private appKey?: string;

  constructor() {
    this.baseURL = process.env.EDAMAM_BASE_URL || "https://api.edamam.com";
    this.appId = process.env.EDAMAM_APP_ID || "";
    this.appKey = process.env.EDAMAM_APP_KEY || "";
  }

  async findRecipes(searchQuery: string) {
    try {
      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${this.baseURL}/api/recipes/v2?type=public&${fieldParams}&q=${searchQuery}&app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);

      const recipesData = await response.json();

      const parsedRecipes = recipesData.hits.map((hit: any) => {
        return this.parseRandom(hit);
      });

      return parsedRecipes;
    } catch (error) {
      console.error("Error fetching random recipes from Edamam API:", error);
      return []; // Return an empty array on error for consistency
    }
  }

  async findRandomRecipes(): Promise<any> {
    try {
      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${this.baseURL}/api/recipes/v2?type=public&${fieldParams}&q=food&random=true&app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);

      const recipesData = await response.json();

      const parsedRecipes = recipesData.hits.map((hit: any) => {
        return this.parseRandom(hit);
      });

      return parsedRecipes;
    } catch (error) {
      console.error("Error fetching random recipes from Edamam API:", error);
      return []; // Return an empty array on error for consistency
    }
  }

  parseRandom(hit: any): any {
    if (!hit || !hit.recipe) {
      console.warn("Invalid hit object provided for parsing:", hit);
      return { spoonacularId: "", image: "", title: "" };
    }

    const uriParts = hit.recipe.uri.split("_");
    const id = uriParts.length > 1 ? uriParts[uriParts.length - 1] : "";

    return {
      spoonacularId: id,
      image: hit.recipe.image,
      title: hit.recipe.label,
    };
  }

  async findInformation(id: string): Promise<recipe | null> {
    try {
      const searchURL = `${this.baseURL}/api/recipes/v2/${id}?app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);
      const recipeData = await response.json();

      if (!recipeData) return null;

      return this.parseInformation(recipeData.recipe);
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
