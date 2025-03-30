"use client";

import type Recipe from "../types/recipe";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { currentRecipeContext, userContext } from "../App";
import apiService from "../api/apiService";
import { useQuery } from "@apollo/client";
import { GET_RECIPE } from "@/utils_graphQL/queries";
import type { RecipeDetails } from "@/types";
import localData from "@/utils_graphQL/localStorageService";
import localStorageService from "@/utils_graphQL/localStorageService";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({
  recipe: { _id, spoonacularId, title, image },
}: RecipeCardProps) {
  const { setCurrentRecipeDetails } = useContext(currentRecipeContext);
  const [skipQuery, setSkipQuery] = useState<boolean>(true);
  const { userStatus } = useContext(userContext);
  const loggedIn = userStatus !== "visiter";
  const { data, loading } = useQuery(GET_RECIPE, {
    variables: { mongoID: _id, spoonacularId: spoonacularId },
    skip: skipQuery,
  });
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const currentRecipe = localStorageService.getCurrentRecipe();

    if (currentRecipe.spoonacularId !== spoonacularId) {
      localStorageService.removeCurrentRecipe();
      localStorageService.setRecipePreview({
        _id,
        spoonacularId,
        title,
        image,
      });
    }

    navigate("/recipe-showcase");
    return;

    if (currentRecipe.spoonacularId !== spoonacularId) {
      navigate("/recipe-showcase");
    } else {
      navigate("/recipe-showcase");
    }

    console.log(`CURRENT RECIPE DETAILS: ${JSON.stringify(currentRecipe)}`);

    console.log(`THIS CARD'S ID: ${_id}`);

    console.log(`THIS CARD'S SPOONACULAR ID: ${spoonacularId}`);
    return;

    // if logged in, trigger the query
    if (loggedIn) {
      setSkipQuery(false);
    }

    // else, skip the query and go with spoonacular search
    else {
      const response = await apiService.forignInformationSearch(spoonacularId);
      localData.setCurrentRecipe(response);
      setCurrentRecipeDetails(response);
      navigate("/recipe-showcase");
    }
  };

  // this effect will wait for the querry to finish executing, then proceed.
  useEffect(() => {
    // wait for the query to finish
    if (loading || skipQuery) {
      return;
    }

    // proceed after the data is retrived, continue
    handleRecipeSearch();
  }, [loading, skipQuery]);

  const handleRecipeSearch = async () => {
    let response: RecipeDetails;

    // if a valid response is obtained from the query, use that as the
    // recipe to showcase.
    if (data?.getRecipe?.recipe) {
      response = data.getRecipe.recipe;
    }

    // otherwise, make a spoonacular API call to find the recipe
    else {
      response = await apiService.forignInformationSearch(spoonacularId);
    }

    // update the context with the recipe, then go to the recipe showcase page.
    localData.setCurrentRecipe(response);
    setCurrentRecipeDetails(response);
    navigate("/recipe-showcase");

    return;
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105 h-full">
      {/* Recipe Image */}
      <div className="w-full h-56 flex-shrink-0 relative overflow-hidden">
        {image ? (
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Content Area - Using flex-grow to fill remaining space */}
      <div className="flex flex-col flex-grow p-6 bg-gradient-to-r from-[#f5d3a4] to-white">
        {/* Recipe Title */}
        <h2 className="text-2xl font-bold text-[#a84e24] mb-3">{title}</h2>

        {/* Spacer to push button to bottom */}
        <div className="flex-grow"></div>

        {/* View Recipe Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#ff9e40] text-white py-2 rounded-lg shadow hover:bg-[#e7890c] transition-colors duration-200"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}
