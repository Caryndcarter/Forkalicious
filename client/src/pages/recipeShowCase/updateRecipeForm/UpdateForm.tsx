import type { diet, RecipeDetails } from "@/types";
// import { dietOptions, intoleranceOptions } from "@/types";
import EditableHeading from "./EditableHeading";
import { useState } from "react";
import OnChangeDropDownMultiSelect from "@/components/forms/OnChangeDropDownMultiSelect";
import OnChangeInputMultiSelect from "@/components/forms/OnChangeInputMultiSelect";
import { dietOptions } from "@/types";
import Heading from "../Heading";
import localStorageService from "@/utils_graphQL/localStorageService";
import askService from "@/api/askService";
import AiFieldSuggestion from "@/components/AiFieldSuggestion";

interface updateFormProps {
  recipe: RecipeDetails;
  setRecipe: any;
  setUpdateVisible: any;
  updateRecipe: any;
}

export default function UpdateForm({
  recipe,
  setRecipe,
  setUpdateVisible,
  updateRecipe,
}: updateFormProps) {
  const [updatedRecipe, setUpdatedRecipe] = useState<RecipeDetails>(recipe);
  const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const listFields = ['ingredients', 'steps', 'diets'];

  const generateField = async (field: string) => {
    setLoading((prev) => ({ ...prev, [field]: true }));

    const preparedRecipe = {
      title: updatedRecipe.title,
      summary: updatedRecipe.summary,
      readyInMinutes: updatedRecipe.readyInMinutes.toString(),
      servings: updatedRecipe.servings.toString(),
      ingredients: updatedRecipe.ingredients.join('; '),
      instructions: updatedRecipe.instructions,
      steps: updatedRecipe.steps?.join('; ') || '',
      diets: updatedRecipe.diets?.join('; ') || '',
    };

    try {
      const value = await askService.generateComponent(field, preparedRecipe);
      setSuggestions((prev) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error(err);
    }

    setLoading((prev) => ({ ...prev, [field]: false }));
  };

  const applySuggestion = (field: string) => {
    const value = suggestions[field];
    if (listFields.includes(field)) {
      setUpdatedRecipe((prev) => ({
        ...prev,
        [field]: value.split('; ').map((s) => s.trim()).filter((s) => s),
      }));
    } else if (['readyInMinutes', 'servings'].includes(field)) {
      setUpdatedRecipe((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
    } else {
      setUpdatedRecipe((prev) => ({ ...prev, [field]: value }));
    }
    setSuggestions((prev) => {
      const newS = { ...prev };
      delete newS[field];
      return newS;
    });
  };

  const copySuggestion = (field: string) => {
    const value = suggestions[field];
    navigator.clipboard.writeText(value);
  };

  const submitRecipeUpdate = async (event: any) => {
    event.preventDefault();
    window.scrollTo(0, 0);

    setLoadingUpdate(true);
    const { data } = await updateRecipe({
      variables: {
        mongoID: recipe._id,
        update: {
          title: updatedRecipe.title,
          summary: updatedRecipe.summary,
          readyInMinutes: updatedRecipe.readyInMinutes,
          servings: updatedRecipe.servings,
          ingredients: updatedRecipe.ingredients,
          instructions: updatedRecipe.instructions,
          steps: updatedRecipe.steps,
          diet: updatedRecipe.diets,
          image: updatedRecipe.image,
          sourceUrl: updatedRecipe.sourceUrl,
          spoonacularId: updatedRecipe.spoonacularId,
          spoonacularSourceUrl: updatedRecipe.spoonacularSourceUrl,
        },
      },
    });

    if (!data) {
      console.error("Failed to update recipe");
      // error handling...
      return;
    }

    console.log(JSON.stringify(data.updateRecipe));

    setRecipe({
      ...recipe,
      ...data.updateRecipe,
    });

    localStorageService.setCurrentRecipe({ ...recipe, ...data.updateRecipe });

    setLoadingUpdate(false);
    setUpdateVisible(false);
    return;
    setRecipe;
  };

  if (loadingUpdate) {
    return (
      <>
        <Heading {...updatedRecipe} />
        <div className="flex justify-center mt-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </>
    );
  }

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
          suggestions={suggestions}
          loading={loading}
          generateField={generateField}
          applySuggestion={applySuggestion}
          copySuggestion={copySuggestion}
        ></EditableHeading>

        <button
          type="button"
          onClick={() => setUpdateVisible(false)}
          className="font-semibold py-2 px-4 rounded transition-colors duration-300 bg-red-500 hover:bg-red-600 text-white"
        >
          Cancel Edits
        </button>

        {/* Diets */}
        <OnChangeDropDownMultiSelect
          name="diets"
          placeholder="Select the diets"
          options={dietOptions}
          selection={updatedRecipe.diets ?? []}
          setSelection={(newDiets: diet[]) => {
            setUpdatedRecipe({ ...updatedRecipe, diets: newDiets });
          }}
        />

        {/* Summary */}
        <div>
          <AiFieldSuggestion
            fieldName="Summary"
            suggestion={suggestions['summary']}
            loading={loading['summary']}
            onGenerate={() => generateField('summary')}
            onApply={() => applySuggestion('summary')}
            onCopy={() => copySuggestion('summary')}
          />
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
        <div>
          <AiFieldSuggestion
            fieldName="Ingredients"
            suggestion={suggestions['ingredients']}
            loading={loading['ingredients']}
            onGenerate={() => generateField('ingredients')}
            onApply={() => applySuggestion('ingredients')}
            onCopy={() => copySuggestion('ingredients')}
          />
          <OnChangeInputMultiSelect
            name="Ingredient"
            placeholder="Enter the ingredients used in this recipe"
            selection={updatedRecipe.ingredients}
            setSelection={(ingredients: string[]) => {
              setUpdatedRecipe({ ...updatedRecipe, ingredients: ingredients });
            }}
          />
        </div>

        {/* Instructions */}
        <div>
          <AiFieldSuggestion
            fieldName="Instructions"
            suggestion={suggestions['instructions']}
            loading={loading['instructions']}
            onGenerate={() => generateField('instructions')}
            onApply={() => applySuggestion('instructions')}
            onCopy={() => copySuggestion('instructions')}
          />
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
        <div>
          <AiFieldSuggestion
            fieldName="Steps"
            suggestion={suggestions['steps']}
            loading={loading['steps']}
            onGenerate={() => generateField('steps')}
            onApply={() => applySuggestion('steps')}
            onCopy={() => copySuggestion('steps')}
          />
          <OnChangeInputMultiSelect
            name="Steps"
            placeholder="Enter the steps to make this recipe"
            selection={updatedRecipe.steps ?? []}
            setSelection={(steps: string[]) => {
              setUpdatedRecipe({ ...updatedRecipe, steps: steps });
            }}
          />
        </div>

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
