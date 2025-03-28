import { useState, useCallback, useEffect, useContext } from "react";
import RecipeCard from "@/components/RecipeCard";
import type Recipe from "@/types/recipe";
import apiService from "@/api/apiService";
import SearchCard from "./SearchCard";
import RecipeBookCard from "./RecipeBookCard";
import RecipeMakerCard from "./RecipeMakerCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { userContext } from "@/App";

// Storage keys
const STORAGE_KEYS = {
  RECIPES: "saved_recipes",
  TIMESTAMP: "recipes_timestamp",
};

const HomePage = () => {
  const { userStatus } = useContext(userContext);
  const loggedIn = userStatus !== "visiter";
  // const [loginCheck, setLoginCheck] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recipes from localStorage or fetch new ones
  const loadRecipes = useCallback(async () => {
    // Try to get recipes from localStorage first
    const savedRecipes = localStorage.getItem(STORAGE_KEYS.RECIPES);

    if (savedRecipes) {
      try {
        const parsedRecipes = JSON.parse(savedRecipes);
        setRecipes(parsedRecipes);
        return; // Exit early if we have saved recipes
      } catch (error) {
        console.error("Failed to parse saved recipes:", error);
        // Continue to fetch new recipes if parsing fails
      }
    }

    // If no saved recipes, fetch new ones
    await getRandomRecipes();
  }, []);

  // Fetch new random recipes
  const getRandomRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const newRecipes = await apiService.forignRandomSearch();
      setRecipes(newRecipes);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(newRecipes));
      localStorage.setItem(STORAGE_KEYS.TIMESTAMP, Date.now().toString());
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const RefreshButton = () => (
    <Button
      onClick={getRandomRecipes}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#a84e24] border-[#a84e24] hover:text-[#a84e24] transition-all"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Generating..." : "Generate New Recipes"}
    </Button>
  );

  // Optional: Display when recipes were last refreshed
  const LastRefreshed = () => {
    const timestamp = localStorage.getItem(STORAGE_KEYS.TIMESTAMP);
    if (!timestamp) return null;

    const date = new Date(Number.parseInt(timestamp));
    return (
      <div className="text-sm text-gray-500 mt-2">
        Last refreshed: {date.toLocaleString()}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fef3d0]">
      {/* Main Content */}
      {!loggedIn ? (
        <div className="pt-20 px-4">
          {/* Card Components */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SearchCard />
            <RecipeBookCard />
            <RecipeMakerCard />
          </div>

          {/* Sample Recipes Section */}
          <div className="pt-20 px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-[#a84e24] mb-4 text-center">
                Sample Recipes
              </h1>
              <div className="flex flex-col items-center">
                <RefreshButton />
                <LastRefreshed />
              </div>
            </div>
            <div
              id="sample-recipies"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-20 px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SearchCard />
            <RecipeBookCard />
            <RecipeMakerCard />
          </div>

          {/* Content */}
          <div className="pt-20 px-4">
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-4xl font-bold text-[#a84e24] mb-4 text-center">
                Save New Recipes to Your Recipe Book
              </h1>
              <div className="flex flex-col items-center">
                <RefreshButton />
                <LastRefreshed />
              </div>
            </div>
            <div
              id="sample-recipies"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {recipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
