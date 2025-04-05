import "../index.css";
import RecipeCard from "../components/RecipeCard";
import type Recipe from "../types/recipe";
import apiService from "../api/apiService";
import { useState, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_SAVED_RECIPES } from "@/utils_graphQL/queries";
import Auth from "@/utils_graphQL/auth";

import { Button } from "@/components/ui/button";
import { LogIn, Search, BookOpen } from "lucide-react";

export default function RecipeBook() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const { loading, refetch } = useQuery(GET_SAVED_RECIPES);
  const navigate = useNavigate();
  const isLoggedIn = Auth.loggedIn();

  useEffect(() => {
    const loadRecipes = async () => {
      if (loading) return;

      if (isLoggedIn) {
        // Force refetch to get latest data
        const { data: refreshedData } = await refetch();

        if (refreshedData?.getRecipes?.length) {
          setRecipes(refreshedData.getRecipes);
          return; // Exit early if we have user recipes
        }
      }

      // If not logged in or no saved recipes, fetch random recipes
      if (!isLoggedIn) {
        try {
          const spoonRecipes = await apiService.forignRandomSearch();
          setRecipes(spoonRecipes);
        } catch (error) {
          console.error("Error fetching recipes:", error);
        }
      }
    };

    loadRecipes();
  }, [loading, refetch, isLoggedIn]);

  // trigger the query each time the page is visited
  useLayoutEffect(() => {
    if (isLoggedIn) {
      refetch();
    }
  }, [isLoggedIn, refetch]);

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <>
          <div className="max-w-md mx-auto mb-12 text-center">
            <p className="text-gray-700 mb-4">
              Log in to save and view your personal recipe collection
            </p>
            <Button
              onClick={() => navigate("/account")}
              className="bg-[#ff9e40] hover:bg-[#e7890c] text-white transition-colors"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log In to View Your Recipes
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipes.map((recipe, index) => (
              <RecipeCard key={recipe._id || index} recipe={recipe} />
            ))}
          </div>
        </>
      );
    }

    if (recipes.length === 0) {
      return (
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <BookOpen className="w-16 h-16 mx-auto text-[#a84e24] mb-4" />
            <h2 className="text-2xl font-bold text-[#a84e24] mb-2">
              Your Recipe Book is Empty
            </h2>
            <p className="text-gray-700 mb-6">
              Start building your collection by finding and saving your favorite
              recipes
            </p>
          </div>
          <Button
            onClick={() => navigate("/search")}
            className="bg-[#ff9e40] hover:bg-[#e7890c] text-white transition-colors"
            size="lg"
          >
            <Search className="w-4 h-4 mr-2" />
            Find Your First Recipe
          </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {recipes.map((recipe, index) => (
          <RecipeCard key={recipe._id || index} recipe={recipe} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#fef3d0] min-h-screen">
      {/* Content */}
      <div className="pt-20 px-4">
        <h1 className="text-4xl font-bold text-[#a84e24] mb-8 text-center">
          {isLoggedIn ? "My Recipe Book" : "Sample Recipe Book"}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a84e24]" />
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}
