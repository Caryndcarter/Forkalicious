interface recipe {
  _id?: any;
  title: string;
  author?: any;
  summary: string;
  readyInMinutes: number;
  servings: number;
  ingredients: string[];
  instructions: string;
  steps: string[];
  diet?: string[];
  image?: string;
  sourceUrl?: string;
  spoonacularId?: number;
  spoonacularSourceUrl?: string;
  edamamId?: string;
  reviews?: string[];
}

export default recipe;
