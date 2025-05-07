import { RecipeDetails } from "@/types";

interface editableHeadingProps {
  recipe: RecipeDetails;
  setRecipe: any;
}

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
      <div className="mb-6 space-y-6">
        <img
          src={recipe.image ?? "./placeholder.svg"}
          alt="Recipe"
          className="w-full h-64 object-cover rounded-md"
          onClick={handleImageClick}
        />
      </div>

      {/* Recipe Title */}
      <h2 className="text-3xl font-bold text-[#a84e24] mb-4">{recipe.title}</h2>

      {/* Ready in Minutes */}
      {recipe.readyInMinutes && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Ready in:{" "}
          <span className="text-black font-medium">
            {recipe.readyInMinutes} minutes
          </span>
        </h4>
      )}

      {/* Servings */}
      {recipe.servings && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Servings:{" "}
          <span className="text-black font-medium">{recipe.servings}</span>
        </h4>
      )}

      {/* Diets */}
      {recipe.diets && recipe.diets.length > 0 && (
        <h4 className="text-lg font-bold text-[#a84e24]">
          Diets:{" "}
          <span className="text-black font-medium">
            {recipe.diets.join(", ")}
          </span>
        </h4>
      )}
    </>
  );
}
