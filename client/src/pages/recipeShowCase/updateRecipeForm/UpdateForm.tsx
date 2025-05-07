import type { RecipeDetails } from "@/types";
// import { DropDownMultiSelect, DropDownSelection } from "@/components/forms";
// import { dietOptions, intoleranceOptions } from "@/types";
import EditableHeading from "./EditableHeading";
import { useState } from "react";
import { DropDownMultiSelect } from "@/components/forms";
import { dietOptions } from "@/types";
import { InputMultiSelect } from "@/components/forms";

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

        {/* Diets */}
        <DropDownMultiSelect
          name="diets"
          placeholder="Select the diets"
          options={dietOptions}
          initialSelection={updatedRecipe.diets ?? []}
        />

        {/* Summary */}
        <div>
          <label className="block font-bold mb-1">Summary*</label>
          <textarea
            id="update-summary"
            value={updatedRecipe.summary}
            className="w-full h-full"
            onChange={(event) => {
              const text = event.target.value;
              setUpdatedRecipe({ ...updatedRecipe, summary: text });
            }}
          />
        </div>

        {/* Ingredients */}
        <InputMultiSelect
          name="Ingredient"
          placeholder="Enter the ingredients used in this recipe"
          initialSelection={updatedRecipe.ingredients}
        ></InputMultiSelect>

        {/* Instructions */}
        <div>
          <label className="block font-bold mb-1">Instructions*</label>
          <textarea
            id="update-instructions"
            value={updatedRecipe.instructions}
            className="w-full h-full"
            onChange={(event) => {
              const text = event.target.value;
              setUpdatedRecipe({ ...updatedRecipe, instructions: text });
            }}
          />
        </div>

        {/* Steps */}
        <InputMultiSelect
          name="Steps"
          placeholder="Enter the steps to make this recipe"
          initialSelection={updatedRecipe.ingredients}
        ></InputMultiSelect>

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
