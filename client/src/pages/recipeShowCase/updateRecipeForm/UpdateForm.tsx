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
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy } from "lucide-react";

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
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Summary*</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateField('summary')}
              disabled={loading['summary']}
            >
              {loading['summary'] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {suggestions['summary'] && (
            <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
              <span>{suggestions['summary']}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(event) => {
                    event.preventDefault();
                    copySuggestion('summary')
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('summary')}
                >
                  Replace
                </Button>
              </div>
            </div>
          )}
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
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Ingredients*</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateField('ingredients')}
              disabled={loading['ingredients']}
            >
              {loading['ingredients'] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {suggestions['ingredients'] && (
            <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
              <span>{suggestions['ingredients']}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => copySuggestion('ingredients')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('ingredients')}
                >
                  Replace
                </Button>
              </div>
            </div>
          )}
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
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Instructions*</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateField('instructions')}
              disabled={loading['instructions']}
            >
              {loading['instructions'] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {suggestions['instructions'] && (
            <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
              <span>{suggestions['instructions']}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySuggestion('instructions')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('instructions')}
                >
                  Replace
                </Button>
              </div>
            </div>
          )}
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
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Steps*</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateField('steps')}
              disabled={loading['steps']}
            >
              {loading['steps'] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {suggestions['steps'] && (
            <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
              <span>{suggestions['steps']}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySuggestion('steps')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('steps')}
                >
                  Replace
                </Button>
              </div>
            </div>
          )}
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
