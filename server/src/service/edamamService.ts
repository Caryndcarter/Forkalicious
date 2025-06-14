// server\src\service\edamamService.ts
import dotenv from "dotenv";
import recipe from "../types/recipe.js";
import imageService from "./imageService.js";
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

  async findRecipes(searchQuery: string, maxHits = 5) {
    try {
      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${this.baseURL}/api/recipes/v2?type=public&${fieldParams}&q=${searchQuery}&app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);

      const recipesData = await response.json();

      const slicedHits = recipesData.hits.slice(0, maxHits);

      const parsedRecipes = await Promise.all(
        slicedHits.map(async (hit: any) => {
          return await this.parseRandom(hit);
        })
      );

      const imageUrls = await imageService.processMultipleImages(parsedRecipes);

      const finishedRecipies = parsedRecipes.map((recipe, index) => {
        return { ...recipe, image: imageUrls[index] };
      });

      return finishedRecipies;
    } catch (error) {
      console.error("Error fetching random recipes from Edamam API:", error);
      return [];
    }
  }

  async findRandomRecipes(maxHits = 5): Promise<any> {
    try {
      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${this.baseURL}/api/recipes/v2?type=public&${fieldParams}&q=food&random=true&app_id=${this.appId}&app_key=${this.appKey}`;
      const response = await fetch(searchURL);

      console.log("recieved response from edamamn");

      const recipesData = await response.json();

      const slicedHits = recipesData.hits.slice(0, maxHits);

      const parsedRecipes = await Promise.all(
        slicedHits.map(async (hit: any) => {
          return await this.parseRandom(hit);
        })
      );

      console.log("parsed the recipies");

      const imageUrls = await imageService.processMultipleImages(parsedRecipes);

      console.log("stored the images in my bucket");

      const finishedRecipies = parsedRecipes.map((recipe, index) => {
        return { ...recipe, image: imageUrls[index] };
      });

      return finishedRecipies;
    } catch (error) {
      console.error("Error fetching random recipes from Edamam API:", error);
      return []; // Return an empty array on error for consistency
    }
  }

  async parseRandom(hit: any): Promise<any> {
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

  async parseInformation(information: any): Promise<recipe> {
    const id = information.uri.split("_")[1];
    // Process the image URL through our image service
    const processedImageUrl = await imageService.processImageUrl(
      information.image,
      id
    );

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
      image: processedImageUrl,
      sourceUrl: information.url,
      spoonacularSourceUrl: "", // Not applicable for Edamam
      spoonacularId: undefined, // Not applicable
      edamamId: id,
    };
  }
}

export default new EdamamService();
