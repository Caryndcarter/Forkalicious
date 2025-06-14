import dotenv from "dotenv";
import recipe from "../types/recipe.js";
dotenv.config({ path: "../.env" });
import searchInput from "../types/searchInput";

class spoonacularService {
  private baseURL?: string;
  private apiKey?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || "";
    this.apiKey = process.env.SPOONACULAR_API_KEY || "";
  }

  async findRecipes(input: searchInput) {
    try {
      // Validate required configuration
      if (!this.apiKey || !this.baseURL) {
        console.error("Spoonacular API configuration missing");
        return [];
      }

      if (!input || typeof input !== "object") {
        console.error(
          "Invalid search input provided to Spoonacular findRecipes"
        );
        return [];
      }

      let searchURL = `${this.baseURL}/recipes/complexSearch?number=9&apiKey=${this.apiKey}`;

      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchURL += `&${encodeURIComponent(key)}=${encodeURIComponent(
            String(value)
          )}`;
        }
      });

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
          `Spoonacular API error: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const recipes = await response.json();

      // Validate response structure
      if (!recipes || !recipes.results || !Array.isArray(recipes.results)) {
        console.error("Invalid response structure from Spoonacular API");
        return [];
      }

      const parsedRecipes = recipes.results
        .map((recipe: any) => {
          try {
            return {
              spoonacularId: recipe.id || 0,
              image: recipe.image || "",
              title: recipe.title || "Untitled Recipe",
            };
          } catch (parseError) {
            console.error(
              "Error parsing individual Spoonacular recipe:",
              parseError
            );
            return null;
          }
        })
        .filter((recipe: any) => recipe !== null);

      return parsedRecipes;
    } catch (error) {
      console.error("Error fetching recipes from Spoonacular API:", error);
      return [];
    }
  }

  async findRandomRecipes(maxHits = 5) {
    try {
      // Validate required configuration
      if (!this.apiKey || !this.baseURL) {
        console.error(
          "Spoonacular API configuration missing for random recipes"
        );
        return [];
      }

      const maxPerRequest = 10;
      const recipes: any[] = [];
      let remaining = maxHits;
      let attempts = 0;
      const maxAttempts = 3; // Prevent infinite loops

      // Fetch in batches of up to 10 until we have enough
      while (remaining > 0 && attempts < maxAttempts) {
        attempts++;
        const batchSize = Math.min(remaining, maxPerRequest);
        const url = `${this.baseURL}/recipes/random?number=${batchSize}&apiKey=${this.apiKey}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Dockalicious-Recipe-App/1.0",
            },
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            console.error(
              `Spoonacular API error for random recipes (attempt ${attempts}): ${response.status} ${response.statusText}`
            );
            if (attempts >= maxAttempts) {
              return [];
            }
            continue; // Try again
          }

          const data = await response.json();

          // Validate response structure
          if (!data || !data.recipes || !Array.isArray(data.recipes)) {
            console.error(
              "Invalid response structure from Spoonacular random API"
            );
            if (attempts >= maxAttempts) {
              return [];
            }
            continue; // Try again
          }

          recipes.push(...data.recipes);
          remaining -= data.recipes.length;
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.error(
            `Error fetching random recipes batch (attempt ${attempts}):`,
            fetchError
          );
          if (attempts >= maxAttempts) {
            break;
          }
        }
      }

      if (recipes.length === 0) {
        console.warn("No random recipes retrieved from Spoonacular API");
        return [];
      }

      try {
        const parsedRecipes = this.parseRandomRecipes({ recipes });
        return parsedRecipes;
      } catch (parseError) {
        console.error(
          "Error parsing random recipes from Spoonacular:",
          parseError
        );
        return [];
      }
    } catch (error) {
      console.error(
        "Error fetching random recipes from Spoonacular API:",
        error
      );
      return [];
    }
  }

  parseRandomRecipes(randomRecipes: any) {
    const recipes = randomRecipes.recipes;
    const parsedRecipes = recipes.map((recipe: any) => {
      return {
        spoonacularId: recipe.id,
        image: recipe.image,
        title: recipe.title,
      };
    });
    return parsedRecipes;
  }

  async findInformation(id: number): Promise<recipe | null> {
    try {
      // Validate required configuration and input
      if (!this.apiKey || !this.baseURL) {
        console.error(
          "Spoonacular API configuration missing for recipe information"
        );
        return null;
      }

      if (!id || typeof id !== "number" || id <= 0) {
        console.error(
          "Invalid recipe ID provided to Spoonacular findInformation"
        );
        return null;
      }

      const searchURL = `${this.baseURL}/recipes/${id}/information?apiKey=${this.apiKey}`;

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
          `Spoonacular API error for recipe information: ${response.status} ${response.statusText}`
        );
        return null;
      }

      const information = await response.json();

      if (!information || typeof information !== "object") {
        console.error(
          "Invalid recipe information structure from Spoonacular API"
        );
        return null;
      }

      const parsedInformation: recipe | null =
        this.parseInformation(information);
      return parsedInformation;
    } catch (error) {
      console.error(
        "Error fetching recipe information from Spoonacular API:",
        error
      );
      return null;
    }
  }

  parseInformation(information: any): recipe {
    try {
      // Provide safe defaults for all fields
      const safeIngredients = Array.isArray(information.extendedIngredients)
        ? information.extendedIngredients.map((ingredient: any) => {
            try {
              const amount = ingredient.amount || 0;
              const unit = ingredient.unit || "";
              const name = ingredient.name || "Unknown ingredient";
              return `${amount} ${unit} ${name}`.trim();
            } catch (ingredientError) {
              console.warn("Error parsing ingredient:", ingredientError);
              return "Unknown ingredient";
            }
          })
        : [];

      const safeInstructions = information.instructions || "";
      const safeSteps = safeInstructions
        ? safeInstructions
            .split(".")
            .filter((step: string) => step.trim().length > 0)
        : [];

      return {
        title: information.title || "Untitled Recipe",
        summary: information.summary || "",
        readyInMinutes: information.readyInMinutes || 0,
        servings: information.servings || 1,
        ingredients: safeIngredients,
        instructions: safeInstructions,
        steps: safeSteps,
        diet: Array.isArray(information.diets) ? information.diets : [],
        image: information.image || "",
        sourceUrl: information.sourceUrl || "",
        spoonacularSourceUrl: information.spoonacularSourceUrl || "",
        spoonacularId: information.id || 0,
      };
    } catch (error) {
      console.error("Error parsing Spoonacular recipe information:", error);
      // Return a minimal valid recipe object
      return {
        title: "Recipe Parse Error",
        summary: "Unable to parse recipe information",
        readyInMinutes: 0,
        servings: 1,
        ingredients: [],
        instructions: "",
        steps: [],
        diet: [],
        image: "",
        sourceUrl: "",
        spoonacularSourceUrl: "",
        spoonacularId: 0,
      };
    }
  }
}

export default new spoonacularService();
