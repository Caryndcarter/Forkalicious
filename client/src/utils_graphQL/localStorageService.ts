import {
  RecipeDetails,
  defaultRecipe,
  defaultPreview,
  DietaryNeeds,
  searchParamters,
  Recipe,
} from "@/types";

const expirationTimeMinutes = 1;

const currentRecipeID = "Current Recipe";
const recipePreviewID = "Recipe Preview";
const tokenID = "Authentication Token";
const accountDietID = "Dietary Needs",
  accountDietTimeStampID = `${accountDietID} Timestamp`;
const queryID = "Query";
const filterValueID = "Search Filter";
const savedRecipesID = "Saved Recipes",
  savedRecipesTimeStampID = `${savedRecipesID} Timestamp`;

// holds logic for managing variables in local storage
class LocalStorageService {
  cleanLocalStorage() {
    this.removeIDToken();
    this.removeAccountDiet();
    this.removeFilter();
  }

  getCurrentRecipe(): RecipeDetails {
    const stringyRecipe = localStorage.getItem(currentRecipeID);

    if (!stringyRecipe) {
      return defaultRecipe;
    }

    return JSON.parse(stringyRecipe);
  }

  setCurrentRecipe(recipe: RecipeDetails) {
    const stringyRecipe = JSON.stringify(recipe);
    localStorage.setItem(currentRecipeID, stringyRecipe);
  }

  removeCurrentRecipe() {
    localStorage.removeItem(currentRecipeID);
  }

  getRecipePreview(): Recipe {
    const stringyPreview = localStorage.getItem(recipePreviewID);

    if (!stringyPreview) {
      return defaultPreview;
    }

    return JSON.parse(stringyPreview);
  }

  setRecipePreview(preview: Recipe) {
    const stringyPreview = JSON.stringify(preview);
    localStorage.setItem(recipePreviewID, stringyPreview);
  }

  removeRecipePreview() {
    localStorage.removeItem(recipePreviewID);
  }

  getIDToken(): string {
    const token = localStorage.getItem(tokenID);

    if (!token) {
      return "";
    }

    return token;
  }

  setIDToken(token: string) {
    localStorage.setItem(tokenID, token);
  }

  removeIDToken() {
    localStorage.removeItem(tokenID);
  }

  getAccountDiet(): DietaryNeeds {
    const stringyDiet = localStorage.getItem(accountDietID);

    if (!stringyDiet) {
      return { diet: "", intolerances: [] };
    }

    return JSON.parse(stringyDiet);
  }

  isAccountDietExpired(): boolean {
    const stringyTimestamp = localStorage.getItem(accountDietTimeStampID);

    if (!stringyTimestamp) {
      return true;
    }

    const timestamp = new Date(stringyTimestamp);
    const now = new Date();

    const differenceInMilliseconds = now.getTime() - timestamp.getTime();
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

    return differenceInMinutes > expirationTimeMinutes;
  }

  setAccountDiet(dietaryNeeds: DietaryNeeds): void {
    const stringyDiet = JSON.stringify(dietaryNeeds);
    localStorage.setItem(accountDietID, stringyDiet);

    const timestamp = new Date().toISOString();
    localStorage.setItem(accountDietTimeStampID, timestamp);
  }

  removeAccountDiet() {
    localStorage.removeItem(accountDietID);
    localStorage.removeItem(accountDietTimeStampID);
  }

  getQuery(): string {
    const query = localStorage.getItem(queryID);

    if (!query) {
      return "";
    }

    return query;
  }

  setQuery(query: string) {
    localStorage.setItem(queryID, query);
  }

  removeQuery() {
    localStorage.removeItem(queryID);
  }

  getFilter(): searchParamters | null {
    const stringyFilter = localStorage.getItem(filterValueID);

    if (!stringyFilter) {
      return null;
    }

    return JSON.parse(stringyFilter);
  }

  setFilter(filter: searchParamters) {
    const stringyFilter = JSON.stringify(filter);
    localStorage.setItem(filterValueID, stringyFilter);
  }

  removeFilter() {
    localStorage.removeItem(filterValueID);
  }

  getSavedRecipes(): Recipe[] {
    const stringyRecipes = localStorage.getItem(savedRecipesID);

    if (!stringyRecipes) {
      return [];
    }

    return JSON.parse(stringyRecipes);
  }

  getSavedRecipesTimeStamp(): Date | null {
    const stringyTimestamp = localStorage.getItem(savedRecipesTimeStampID);

    if (!stringyTimestamp) {
      return null;
    }

    return new Date(stringyTimestamp);
  }

  isSavedRecipesExpired(): boolean {
    const stringyTimestamp = localStorage.getItem(savedRecipesTimeStampID);

    if (!stringyTimestamp) {
      return true;
    }

    const timestamp = new Date(stringyTimestamp);
    const now = new Date();

    const differenceInMilliseconds = now.getTime() - timestamp.getTime();
    const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

    return differenceInMinutes > expirationTimeMinutes;
  }

  setSavedRecipes(recipes: Recipe[]): void {
    const stringyRecipes = JSON.stringify(recipes);
    localStorage.setItem(savedRecipesID, stringyRecipes);

    const timestamp = new Date().toISOString();
    localStorage.setItem(savedRecipesTimeStampID, timestamp);
  }

  removeSavedRecipes() {
    localStorage.removeItem(savedRecipesID);
    localStorage.removeItem(savedRecipesTimeStampID);
  }
}

export default new LocalStorageService();
