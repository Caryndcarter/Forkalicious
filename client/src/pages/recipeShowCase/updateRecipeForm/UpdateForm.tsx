import type { RecipeDetails } from "@/types";
// import { DropDownMultiSelect, DropDownSelection } from "@/components/forms";
// import { dietOptions, intoleranceOptions } from "@/types";
import EditableHeading from "./EditableHeading";
import { useState } from "react";

interface updateFormProps {
  recipe: RecipeDetails;
  setRecipe: any;
  setUpdateVisible: any;
}

export default function UpdateForm({
  recipe,
  setRecipe,
  setUpdateVisible,
}: updateFormProps) {
  const [updatedRecipe, setUpdatedRecipe] = useState<RecipeDetails>(recipe);

  const submitRecipeUpdate = (event: any) => {
    event.preventDefault();
    setUpdateVisible(false);
    return;
    setRecipe;
  };

  return (
    <>
      <form
        id="update-recipe-form"
        onSubmit={submitRecipeUpdate}
        className="space-y-6"
      >
        <EditableHeading
          recipe={updatedRecipe}
          setRecipe={setUpdatedRecipe}
        ></EditableHeading>

        <button
          onClick={() => setUpdateVisible(false)}
          className="font-semibold py-2 px-4 rounded transition-colors duration-300 bg-red-500 hover:bg-red-600 text-white"
        >
          Cancel Edits
        </button>

        <button
          type="submit"
          id="update-recipe"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          Update Recipe
        </button>
      </form>
    </>
  );
}
