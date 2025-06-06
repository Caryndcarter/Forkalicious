import { RecipeDetails } from "@/types";
import { Pencil } from "lucide-react";
import defaultImage from "/src/assets/Untitled design.jpg"

interface editableHeadingProps {
  recipe: RecipeDetails;
  setRecipe: any;
}

// Function to ensure image URL has a jpg extension
  const ensureJpgExtension = (imageUrl: string | undefined): string => {
    if (!imageUrl) return defaultImage;
    
    // Check if the URL ends with a file extension
    const hasFileExtension = /\.\w+$/.test(imageUrl);
    
    // If it has a period but no recognized image extension, append jpg
    if (imageUrl.includes('.') && !hasFileExtension) {
      return `${imageUrl}jpg`;
    }
    
    return imageUrl;
  };

export default function EditableHeading({
  recipe,
  setRecipe,
}: editableHeadingProps) {
  // Handle image click to update the image URL
  const handleImageClick = () => {
    const newImageUrl = prompt("Enter a new image URL:", recipe.image || "");
    if (newImageUrl !== null) {
      setRecipe({ ...recipe, image: newImageUrl });
    }
  };

  return (
    <>
      {/* Recipe Image */}
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        {Image ? (
            <img
              src={ensureJpgExtension(recipe.image || "")}
              alt={recipe.title}
              className="w-full h-64 object-cover rounded-md"
            />
          ) : (
            <img
              src={defaultImage}
              alt="Default recipe image"
              className="w-full h-64 object-cover rounded-md"
            />
          )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-md">
          <Pencil className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Recipe Title */}
      <input
        type="text"
        value={recipe.title || ""}
        onChange={(event) => {
          setRecipe({ ...recipe, title: event.target.value });
        }}
        className="text-3xl font-bold text-[#a84e24] mb-4 w-full bg-transparent border-b border-[#a84e24] focus:outline-none focus:border-[#a84e24] px-1"
        placeholder="Recipe Title"
      />

      {/* Ready in Minutes */}
      <h4 className="text-lg font-bold text-[#a84e24] flex items-center gap-2">
        Ready in:{" "}
        <span className="text-black font-medium flex items-center">
          <input
            type="number"
            min="1"
            value={recipe.readyInMinutes || ""}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value) || 0;
              setRecipe({ ...recipe, readyInMinutes: value > 0 ? value : 1 });
            }}
            className="w-16 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#a84e24] px-1"
          />
          {" minutes"}
        </span>
      </h4>

      {/* Servings */}
      <h4 className="text-lg font-bold text-[#a84e24] flex items-center gap-2">
        Servings:{" "}
        <span className="text-black font-medium">
          <input
            type="number"
            min="1"
            value={recipe.servings || ""}
            onChange={(event) => {
              const value = Number.parseInt(event.target.value) || 0;
              setRecipe({ ...recipe, servings: value > 0 ? value : 1 });
            }}
            className="w-16 bg-transparent border-b border-gray-300 focus:outline-none focus:border-[#a84e24] px-1"
          />
        </span>
      </h4>
    </>
  );
}
