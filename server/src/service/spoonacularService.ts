import dotenv from "dotenv";
import recipe from "../types/recipe.js";
dotenv.config();
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
      // First API call for 10 recipes (spoonacular service only allows a max of 10 recipes in one call)
      const firstBatchURL = `${this.baseURL}/recipes/random?number=10&apiKey=${this.apiKey}`;
      const firstResponse = await fetch(firstBatchURL);

      // Second API call for 2 recipes (so that there are a total of 12 recipes displayed)
      const secondBatchURL = `${this.baseURL}/recipes/random?number=2&apiKey=${this.apiKey}`;
      const secondResponse = await fetch(secondBatchURL);

      // Check if either request fails
      if (firstResponse.status !== 200 || secondResponse.status !== 200) {
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
      console.log(error);
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
