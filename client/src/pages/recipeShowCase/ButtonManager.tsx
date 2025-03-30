import EditRecipeButton from "./EditButton";
import CopyRecipeButton from "./CopyButton";
import SaveRecipeButton from "./SaveButton";

// interface ActionManagerProps {}

export default function ButtonManager({
  isAuthor,
  editRecipe,
  isSaved,
  deleteCurrentRecipe,
  saveCurrentRecipe,
}: any) {
  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {isAuthor ? (
        <EditRecipeButton onClick={editRecipe} />
      ) : (
        <CopyRecipeButton onClick={editRecipe} />
      )}
      <SaveRecipeButton
        isSaved={isSaved}
        deleteCurrentRecipe={deleteCurrentRecipe}
        saveCurrentRecipe={saveCurrentRecipe}
      />
    </div>
  );
}
