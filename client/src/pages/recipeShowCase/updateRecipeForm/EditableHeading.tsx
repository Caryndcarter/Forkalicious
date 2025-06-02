import { RecipeDetails } from "@/types";
import { Pencil, Sparkles, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import defaultImage from "/src/assets/Untitled design.jpg"

interface editableHeadingProps {
  recipe: RecipeDetails;
  setRecipe: any;
  suggestions: Record<string, string>;
  loading: Record<string, boolean>;
  generateField: (field: string) => Promise<void>;
  applySuggestion: (field: string) => void;
  copySuggestion: (field: string) => void;
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
  suggestions,
  loading,
  generateField,
  applySuggestion,
  copySuggestion,
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
      <div id="editable-recipe-image" className="relative group cursor-pointer" onClick={handleImageClick}>
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
      <div id="editable-recipe-title" className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-[#a84e24]">Title</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateField('title')}
            disabled={loading['title']}
          >
            {loading['title'] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        {suggestions['title'] && (
          <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
            <span className="text-sm">{suggestions['title']}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySuggestion('title')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion('title')}
              >
                Replace
              </Button>
            </div>
          </div>
        )}
        <input
          type="text"
          value={recipe.title || ""}
          onChange={(event) => {
            setRecipe({ ...recipe, title: event.target.value });
          }}
          className="text-3xl font-bold text-[#a84e24] w-full bg-transparent border-b border-[#a84e24] focus:outline-none focus:border-[#a84e24] px-1"
          placeholder="Recipe Title"
        />
      </div>

      {/* Ready in Minutes */}
      <div id="editable-recipe-ready-in-minutes" className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-[#a84e24]">Ready in Minutes</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateField('readyInMinutes')}
            disabled={loading['readyInMinutes']}
          >
            {loading['readyInMinutes'] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        {suggestions['readyInMinutes'] && (
          <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
            <span className="text-sm">{suggestions['readyInMinutes']}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySuggestion('readyInMinutes')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion('readyInMinutes')}
              >
                Replace
              </Button>
            </div>
          </div>
        )}
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
      </div>

      {/* Servings */}
      <div id="editable-recipe-servings" className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-bold text-[#a84e24]">Servings</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => generateField('servings')}
            disabled={loading['servings']}
          >
            {loading['servings'] ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
        {suggestions['servings'] && (
          <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
            <span className="text-sm">{suggestions['servings']}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copySuggestion('servings')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => applySuggestion('servings')}
              >
                Replace
              </Button>
            </div>
          </div>
        )}
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
      </div>
    </>
  );
}
