import type Recipe from "../types/recipe";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";
import localData from "@/utils_graphQL/localStorageService";

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({
  recipe: { _id, spoonacularId, title, image },
}: RecipeCardProps) {
  const navigate = useNavigate();

  const handleSubmit = useCallback(async () => {
    const thisCard = { _id, spoonacularId, title, image };
    const storedCard = localData.getCurrentCard();

    if (JSON.stringify(thisCard) != JSON.stringify(storedCard)) {
      localData.setCurrentCard(thisCard);
      localData.removeCurrentRecipe();
    }

    navigate("/recipe-showcase");
  }, []);

  // Function to ensure image URL has a jpg extension
  const ensureJpgExtension = (imageUrl: string | undefined): string => {
    if (!imageUrl) return "/public/Utitled design.jpg";
    
    // Check if the URL ends with a file extension
    const hasFileExtension = /\.\w+$/.test(imageUrl);
    
    // If it has a period but no recognized image extension, append jpg
    if (imageUrl.includes('.') && !hasFileExtension) {
      return `${imageUrl}jpg`;
    }
    
    return imageUrl;
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105 h-full">
      {/* Recipe Image */}
      <div className="w-full h-56 flex-shrink-0 relative overflow-hidden">
        {image ? (
          <img
            src={ensureJpgExtension(image)}
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