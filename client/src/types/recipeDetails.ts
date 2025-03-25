export interface RecipeDetails {
  _id: string | null;
  author: string | null;
  title: string;
  summary: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string;
  steps: string[] | null;
  diets?: string[] | null;
  image?: string | null;
  sourceUrl?: string | null;
  spoonacularSourceUrl?: string | null;
  spoonacularId?: number | null;
  reviews?: string[];
}

export const defaultRecipe: RecipeDetails = {
  _id: null,
  title: "",
  author: null,
  summary: "",
  readyInMinutes: 0,
  servings: 0,
  ingredients: [],
  instructions: "",
  steps: [],
  diets: [],
  image: "",
  sourceUrl: "",
  spoonacularSourceUrl: "",
  spoonacularId: 0,
};
