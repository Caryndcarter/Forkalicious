interface SaveRecipeButtonProps {
  isSaved: boolean;
  deleteCurrentRecipe: any;
  saveCurrentRecipe: any;
}

export default function SaveRecipeButton({
  isSaved,
  deleteCurrentRecipe,
  saveCurrentRecipe,
}: SaveRecipeButtonProps) {
  return (
    <button
      onClick={() => (isSaved ? deleteCurrentRecipe() : saveCurrentRecipe())}
      className={`font-semibold py-2 px-4 rounded transition-colors duration-300 ${
        isSaved
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-[#A84E24] hover:bg-green-600 text-white"
      }`}
    >
      {isSaved ? "Delete Recipe" : "Save Recipe"}
    </button>
  );
}
