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
      // Validate required configuration
      if (!this.appId || !this.appKey || !this.baseURL) {
        console.error("Edamam API configuration missing");
        return [];
      }

      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${
        this.baseURL
      }/api/recipes/v2?type=public&${fieldParams}&q=${encodeURIComponent(
        searchQuery
      )}&app_id=${this.appId}&app_key=${this.appKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(searchURL, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Dockalicious-Recipe-App/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `Edamam API error: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const recipesData = await response.json();

      // Validate response structure
      if (
        !recipesData ||
        !recipesData.hits ||
        !Array.isArray(recipesData.hits)
      ) {
        console.error("Invalid response structure from Edamam API");
        return [];
      }

      const slicedHits = recipesData.hits.slice(0, maxHits);

      const parsedRecipes = await Promise.all(
        slicedHits.map(async (hit: any) => {
          try {
            return await this.parseRandom(hit);
          } catch (parseError) {
            console.error("Error parsing individual recipe:", parseError);
            return null;
          }
        })
      );

      // Filter out null results from failed parsing
      const validRecipes = parsedRecipes.filter((recipe) => recipe !== null);

      if (validRecipes.length === 0) {
        console.warn("No valid recipes parsed from Edamam response");
        return [];
      }

      try {
        const imageUrls = await imageService.processMultipleImages(
          validRecipes
        );
        const finishedRecipies = validRecipes.map((recipe, index) => {
          return { ...recipe, image: imageUrls[index] || recipe.image };
        });
        return finishedRecipies;
      } catch (imageError) {
        console.error(
          "Error processing images, returning recipes with original images:",
          imageError
        );
        return validRecipes;
      }
    } catch (error) {
      console.error("Error fetching recipes from Edamam API:", error);
      return [];
    }
  }

  async findRandomRecipes(maxHits = 5): Promise<any> {
    try {
      // Validate required configuration
      if (!this.appId || !this.appKey || !this.baseURL) {
        console.error("Edamam API configuration missing for random recipes");
        return [];
      }

      const fieldParams = "field=image&field=uri&field=label";
      const searchURL = `${this.baseURL}/api/recipes/v2?type=public&${fieldParams}&q=food&random=true&app_id=${this.appId}&app_key=${this.appKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(searchURL, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Dockalicious-Recipe-App/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `Edamam API error for random recipes: ${response.status} ${response.statusText}`
        );
        return [];
      }

      console.log("received response from edamam");

      const recipesData = await response.json();

      // Validate response structure
      if (
        !recipesData ||
        !recipesData.hits ||
        !Array.isArray(recipesData.hits)
      ) {
        console.error(
          "Invalid response structure from Edamam API for random recipes"
        );
        return [];
      }

      const slicedHits = recipesData.hits.slice(0, maxHits);

      const parsedRecipes = await Promise.all(
        slicedHits.map(async (hit: any) => {
          try {
            return await this.parseRandom(hit);
          } catch (parseError) {
            console.error(
              "Error parsing individual random recipe:",
              parseError
            );
            return null;
          }
        })
      );

      // Filter out null results from failed parsing
      const validRecipes = parsedRecipes.filter((recipe) => recipe !== null);

      if (validRecipes.length === 0) {
        console.warn("No valid random recipes parsed from Edamam response");
        return [];
      }

      console.log("parsed the recipes");

      try {
        const imageUrls = await imageService.processMultipleImages(
          validRecipes
        );
        console.log("stored the images in my bucket");

        const finishedRecipies = validRecipes.map((recipe, index) => {
          return { ...recipe, image: imageUrls[index] || recipe.image };
        });

        return finishedRecipies;
      } catch (imageError) {
        console.error(
          "Error processing images for random recipes, returning recipes with original images:",
          imageError
        );
        return validRecipes;
      }
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
      // Validate required configuration and input
      if (!this.appId || !this.appKey || !this.baseURL) {
        console.error(
          "Edamam API configuration missing for recipe information"
        );
        return null;
      }

      if (!id || typeof id !== "string") {
        console.error("Invalid recipe ID provided to Edamam findInformation");
        return null;
      }

      const searchURL = `${this.baseURL}/api/recipes/v2/${encodeURIComponent(
        id
      )}?app_id=${this.appId}&app_key=${this.appKey}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(searchURL, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Dockalicious-Recipe-App/1.0",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(
          `Edamam API error for recipe information: ${response.status} ${response.statusText}`
        );
        return null;
      }

      const recipeData = await response.json();

      if (!recipeData || !recipeData.recipe) {
        console.error("Invalid recipe data structure from Edamam API");
        return null;
      }

      return this.parseInformation(recipeData.recipe);
    } catch (error) {
      console.error(
        "Error fetching recipe information from Edamam API:",
        error
      );
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
