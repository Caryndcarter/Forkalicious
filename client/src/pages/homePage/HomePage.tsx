import { useState, useCallback, useContext, useLayoutEffect } from "react";
import RecipeCard from "@/components/RecipeCard";
import { Recipe } from "@/types";
import apiService from "@/api/apiService";
import SearchCard from "./SearchCard";
import RecipeBookCard from "./RecipeBookCard";
import RecipeMakerCard from "./RecipeMakerCard";
import RefreshButton from "./RefreshButton";
import { userContext } from "@/App";
import localStorageService from "@/utils_graphQL/localStorageService";
import LastRefreshed from "./LastRefreshed";

export default function HomePage() {
  const { userStatus } = useContext(userContext);
  const loggedIn = userStatus !== "visiter";
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initial load
  useLayoutEffect(() => {
    const storedRecipes = localStorageService.getSavedRecipes();

    if (storedRecipes.length > 0) {
      setRecipes(storedRecipes);
    } else {
      getRandomRecipes();
    }
  }, []);

  const getRandomRecipes = useCallback(async () => {
    setIsLoading(true);
    try {
      const newRecipes = await apiService.forignRandomSearch();
      setRecipes(newRecipes);
      localStorageService.setSavedRecipes(newRecipes);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#fef3d0]">
      {/* Main Content */}
      <div className="pt-20 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SearchCard />
          <RecipeBookCard />
          <RecipeMakerCard />
        </div>

        {/* Sample Recipes Section */}
        <div className="pt-20 px-4">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-4xl font-bold text-[#a84e24] mb-4 text-center">
              {loggedIn
                ? "Save New Recipes to Your Recipe Book"
                : "Sample Recipes"}
            </h1>
            <div className="flex flex-col items-center">
              <RefreshButton
                getRandomRecipes={getRandomRecipes}
                isLoading={isLoading}
              />
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
    </div>
  );
}
