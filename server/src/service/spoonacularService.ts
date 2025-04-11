import dotenv from "dotenv";
import recipe from "../types/recipe.js";
dotenv.config();
import searchInput from "../types/searchInput";

class spoonacularService {
  private baseURL?: string;
  private apiKey?: string;

  constructor() {
    if (!process.env.API_BASE_URL || !process.env.SPOONACULAR_API_KEY) {
      console.error('Missing required environment variables:', {
        API_BASE_URL: !!process.env.API_BASE_URL,
        SPOONACULAR_API_KEY: !!process.env.SPOONACULAR_API_KEY
      });
    }
    this.baseURL = process.env.API_BASE_URL;
    this.apiKey = process.env.SPOONACULAR_API_KEY;
    console.log('SpoonacularService initialized with:', {
      baseURL: this.baseURL,
      hasApiKey: !!this.apiKey
    });
  }

  async findRecipes(input: searchInput) {
    try {
      let searchURL = `${this.baseURL}/recipes/complexSearch?number=9&apiKey=${this.apiKey}`;

      Object.entries(input).forEach(([key, value]) => {
        searchURL += `&${key}=${value}`;
      });

      const response = await fetch(searchURL);
      const recipes = await response.json();
      const parsedRecipes = recipes.results.map((recipe: any) => {
        return {
          spoonacularId: recipe.id,
          image: recipe.image,
          title: recipe.title,
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
      console.log('Starting findRandomRecipes with baseURL:', this.baseURL);
      
      // First API call for 10 recipes
      const firstBatchURL = `${this.baseURL}/recipes/random?number=10&apiKey=${this.apiKey}`;
      console.log('Making first request to:', firstBatchURL.replace(this.apiKey || '', '[REDACTED]'));
      const firstResponse = await fetch(firstBatchURL);
      console.log('First response status:', firstResponse.status);

      // Second API call for 2 recipes
      const secondBatchURL = `${this.baseURL}/recipes/random?number=2&apiKey=${this.apiKey}`;
      console.log('Making second request to:', secondBatchURL.replace(this.apiKey || '', '[REDACTED]'));
      const secondResponse = await fetch(secondBatchURL);
      console.log('Second response status:', secondResponse.status);

      // Check if either request fails
      if (firstResponse.status !== 200 || secondResponse.status !== 200) {
        const firstBody = await firstResponse.text();
        const secondBody = await secondResponse.text();
        console.error('API Error responses:', {
          firstStatus: firstResponse.status,
          firstBody,
          secondStatus: secondResponse.status,
          secondBody
        });
        return { error: "Failed to fetch recipes" };
      }

      // Parse both responses
      const firstBatch = await firstResponse.json();
      const secondBatch = await secondResponse.json();

      // Combine the recipes into one array
      const combinedRecipes = {
        recipes: [...firstBatch.recipes, ...secondBatch.recipes]
      };

      const recipes = this.parseRandomRecipes(combinedRecipes);
      return recipes;
    } catch (error) {
      console.error('Error in findRandomRecipes:', error);
      return error;
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
      const searchURL = `${this.baseURL}/recipes/${id}/information?apiKey=${this.apiKey}`;
      const response = await fetch(searchURL);
      const information = await response.json();
      const parsedInformation: recipe | null =
        this.parseInformation(information);
      return parsedInformation;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  parseInformation(information: any): recipe {
    return {
      title: information.title,
      summary: information.summary,
      readyInMinutes: information.readyInMinutes,
      servings: information.servings,
      ingredients: information.extendedIngredients.map((ingredient: any) => {
        return `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`;
      }),
      instructions: information.instructions,
      steps: information.instructions.split("."),
      diet: information.diets,
      image: information.image,
      sourceUrl: information.sourceUrl,
      spoonacularSourceUrl: information.spoonacularSourceUrl,
      spoonacularId: information.id,
    };
  }
}

export default new spoonacularService();
