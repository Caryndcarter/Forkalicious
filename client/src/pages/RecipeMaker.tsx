import { useState, useContext, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { defaultRecipe, type RecipeDetails } from "@/types";
import askService from "../api/askService";
import { editingContext, userContext } from "@/App";
import Auth from "@/utils_graphQL/auth";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { useMutation } from "@apollo/client";
import { CREATE_RECIPE } from "@/utils_graphQL/mutations";
import { SAVE_RECIPE } from "@/utils_graphQL/mutations";
import localData from "@/utils_graphQL/localStorageService";
import GenerateButton from "@/components/recipe-ai/GenerateButton";
import SuggestionBox from "@/components/recipe-ai/SuggestionBox";

const LOCAL_STORAGE_KEY = "recipeFormProgress";

const RecipeMaker = () => {
  // const currentRecipeDetails = localData.getCurrentRecipe() || defaultRecipe;
  const { isEditing, setIsEditing } = useContext(editingContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [prompt, setPrompt] = useState<string>("");
  const [AILoading, setAILoading] = useState<boolean>(false);
  const [createRecipe] = useMutation(CREATE_RECIPE);
  const [saveRecipe] = useMutation(SAVE_RECIPE);
  const isLoggedIn = Auth.loggedIn();
const [validationErrors, setValidationErrors] = useState<
  Record<string, boolean>
>({});

const [suggestions, setSuggestions] = useState<Record<string, string>>({});
const [loading, setLoading] = useState<Record<string, boolean>>({});

const { userStatus } = useContext(userContext);
  const loggedIn = userStatus !== "visiter";

  // Initialize recipe state with empty values
  const emptyRecipe: RecipeDetails = {
    _id: null,
    title: "",
    author: null,
    summary: "",
    readyInMinutes: 0,
    servings: 0,
    ingredients: [""],
    instructions: "",
    steps: [],
    diets: [],
    image: "",
  };

  const [recipe, setRecipe] = useState<RecipeDetails>(emptyRecipe);

  // Load saved form data from localStorage on component mount
  // Only if we're not editing an existing recipe
  useEffect(() => {
    // Skip loading from localStorage if we're editing a recipe
    if (isEditing) {
      return;
    }
    
    const savedFormData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setRecipe(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, [isEditing]);

  // Save form data to localStorage whenever recipe state changes
  useEffect(() => {
    // Only save if the form has some content (avoid overwriting with empty form)
    if (recipe.title || recipe.summary || recipe.ingredients[0]) {
      const dataToSave = {
        ...recipe,
        // Remove savedPrompt from being stored
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    }
  }, [recipe]);

  // If the user is editing an existing recipe, import that recipe's information
  useLayoutEffect(() => {
    // exits if the user isn't editing
    if (!isEditing) {
      return;
    }

    // Get the current recipe from local storage instead of context
    const currentRecipeDetails = localData.getCurrentRecipe() || defaultRecipe;
    
    // grab profile information
    const userProfile = Auth.getProfile();

    // if the user is the author of the recipe, import normally
    if (userProfile._id == currentRecipeDetails.author) {
      setRecipe(currentRecipeDetails);
      // Clear saved form data when importing a recipe to edit
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // if the user is adapting someone else's recipe, add their username
    else {
      setRecipe({
        ...currentRecipeDetails,
        title: `${userProfile.userName}'s ${currentRecipeDetails.title}`,
      });
      // Clear saved form data when adapting a recipe
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    // turn off editing
    setIsEditing(false);
  }, []);


  const listFields = ['ingredients', 'steps', 'diets'];

  const generateField = async (field: string) => {
    setLoading((prev) => ({ ...prev, [field]: true }));

    const preparedRecipe = {
      title: recipe.title,
      summary: recipe.summary,
      readyInMinutes: recipe.readyInMinutes.toString(),
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients.join('; '),
      instructions: recipe.instructions,
      steps: recipe.steps?.join('; ') || '',
      diets: recipe.diets?.join('; ') || '',
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
      setRecipe((prev) => ({
        ...prev,
        [field]: value.split('; ').map((s) => s.trim()).filter((s) => s),
      }));
    } else if (['readyInMinutes', 'servings'].includes(field)) {
      setRecipe((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
    } else {
      setRecipe((prev) => ({ ...prev, [field]: value }));
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
    // Optionally, show a toast or something
  };

  const handleChange = (field: keyof RecipeDetails, value: any) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleListChange = (
    field: keyof RecipeDetails,
    index: number,
    value: string
  ) => {
    const updatedList = [...(recipe[field] as string[])];
    updatedList[index] = value;
    setRecipe((prev) => ({
      ...prev,
      [field]: updatedList,
    }));
  };

  const handleAddItem = (field: keyof RecipeDetails) => {
    setRecipe((prev) => ({
      ...prev,
      [field]: [...(recipe[field] as string[]), ""],
    }));
  };

  const handleRemoveItem = (field: keyof RecipeDetails, index: number) => {
    const updatedList = [...(recipe[field] as string[])];
    updatedList.splice(index, 1);
    setRecipe((prev) => ({
      ...prev,
      [field]: updatedList,
    }));
  };

  const getInputClasses = (fieldName: string) => {
    return `w-full p-2 border rounded ${
      validationErrors[fieldName]
        ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.6)]"
        : ""
    }`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!recipe.title.trim()) errors.title = true;
    if (!recipe.summary.trim()) errors.summary = true;
    if (recipe.readyInMinutes <= 0) errors.readyInMinutes = true;
    if (recipe.servings <= 0) errors.servings = true;
    if (!recipe.ingredients[0]?.trim()) errors.ingredients = true;
    if (!recipe.instructions.trim()) errors.instructions = true;
    if (!recipe.steps || recipe.steps.length === 0 || !recipe.steps[0]?.trim())
      errors.steps = true;

    // If there are validation errors, update state and stop submission
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to the first error
      const firstErrorField = document.querySelector(".error-field");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    // ensure the author's ID value can be tracked:
    const authorID: string | null = Auth.getProfile()?._id;
    if (!authorID) {
      setErrorMessage("could not validate you identity. Please log in again.");
    }

    // Clear any previous validation errors
    setValidationErrors({});

    if (recipe.image) {
      if (recipe.image.length > 250) {
        setErrorMessage("Error: URL is too long");
        return;
      }
    }

    const { data } = await createRecipe({
      variables: {
        recipeInput: {
          title: recipe.title,
          summary: recipe.summary,
          author: authorID,
          readyInMinutes: recipe.readyInMinutes,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          steps: recipe.steps,
          diet: recipe.diets,
          image: recipe.image,
        },
      },
    });

    if (data?.createRecipe) {
      await saveRecipe({
        variables: {
          recipeId: data.createRecipe._id,
        },
      });

      // Clear the saved form data after successful creation
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }

    navigate("/recipe-book");
  };

  const handleAiCall = async (e: any) => {
    e.preventDefault();
    setAILoading(true);
    const response = await askService.askForRecipe(prompt);
    const recipe = response.formattedResponse;
    setRecipe((prev) => ({
      ...prev,
      title: recipe.title,
      summary: recipe.Summary,
      readyInMinutes: Number.parseInt(recipe.ReadyInMinutes),
      servings: Number.parseInt(recipe.Servings),
      ingredients: recipe.Ingredients.split(";"),
      instructions: recipe.Instructions,
      diets: recipe.Diets.split(";"),
      steps: recipe.Steps.split(";"),
    }));
    setAILoading(false);
  };

  // Function to clear saved form data
  const clearSavedFormData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRecipe(emptyRecipe);
    setPrompt("");
    setErrorMessage("");
    setValidationErrors({});
  };

  return (
    <div className="bg-[#fef3d0] min-h-screen pt-24 px-6">
      <h1 className="text-3xl font-bold text-center mb-8">Create a Recipe</h1>

      {/* Show a notification if there was saved data loaded */}
      {(recipe.title || recipe.summary || recipe.ingredients[0] !== "") && (
        <div className="w-full max-w-3xl mx-auto mb-4 p-4 bg-[#ffe8b3] border border-[#e7890c] rounded-lg flex justify-between items-center">
          <p className="text-[#a84e24] font-medium">
            Your progress has been saved.
          </p>
          <button
            onClick={clearSavedFormData}
            className="text-sm bg-[#ff9e40] text-white px-3 py-1 rounded hover:bg-[#e7890c] transition-colors"
          >
            Start Fresh
          </button>
        </div>
      )}

      {loggedIn ? (
        <form
          onSubmit={handleAiCall}
          className="w-full max-w-3xl mx-auto p-6 bg-[#fadaae] rounded-lg shadow-lg space-y-4 border border-[#e7890c]/20 mb-6"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#a84e24]" />
              <Label
                htmlFor="prompt"
                className="font-bold text-lg text-[#a84e24]"
              >
                Recipe AI Assistant
              </Label>
            </div>

            <p className="text-[#8e4220] text-sm">
              Describe the recipe you want to create and our AI will generate it
              for you!
            </p>

            <div className="relative mt-2">
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full min-h-[150px] pr-24 bg-white/80 border-[#e7890c]/30 focus:border-[#e7890c] focus:ring-[#ff9e40]/20"
                placeholder="Try: 'A gluten-free chocolate cake with raspberry filling' or 'A quick weeknight pasta dish with ingredients I likely have at home'"
              />

              {AILoading && (
                <div className="absolute left-3 bottom-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#a84e24]" />
                </div>
              )}

              <Button
                type="submit"
                className="absolute right-3 bottom-3 bg-[#a84e24] hover:bg-[#8e4220] text-white"
                disabled={AILoading || !prompt.trim()}
              >
                {AILoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Recipe
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8e4220]/70 mt-1">
              <p>Examples:</p>
              <button
                type="button"
                onClick={() =>
                  setPrompt("A healthy vegetarian dinner that's quick to make")
                }
                className="underline hover:text-[#a84e24]"
              >
                Vegetarian dinner
              </button>
              <button
                type="button"
                onClick={() => setPrompt("A fancy dessert for a dinner party")}
                className="underline hover:text-[#a84e24]"
              >
                Fancy dessert
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="w-full max-w-3xl mx-auto p-6 bg-[#fadaae] rounded-lg shadow-lg space-y-4 border border-[#e7890c]/20 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-[#a84e24]" />
            <h3 className="font-bold text-lg text-[#a84e24]">
              Recipe AI Assistant
            </h3>
          </div>

          <div className="bg-white/80 p-4 rounded-md border border-[#e7890c]/30">
            <p className="text-[#8e4220] text-center">
              Log in to use our AI recipe generator and create amazing recipes
              instantly!
            </p>
          </div>

          <Button
            onClick={() => navigate("/account")}
            className="w-full bg-[#ff9e40] hover:bg-[#e7890c] text-white"
          >
            Log In to Use AI
          </Button>
        </div>
      )}

      <form
        id="recipe-maker-form"
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-[#fadaae] p-6 shadow-lg rounded-lg space-y-4 border border-gray-200"
      >
        <div id="maker-input-title">
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Title*</label>
            <GenerateButton field="title" loading={loading} generateField={generateField} />
          </div>
          <SuggestionBox
            field="title"
            suggestions={suggestions}
            copySuggestion={copySuggestion}
            applySuggestion={applySuggestion}
          />
          <input
            type="text"
            value={recipe.title}
            onChange={(e) => {
              handleChange("title", e.target.value);
              if (e.target.value.trim()) {
                setValidationErrors((prev) => ({ ...prev, title: false }));
              }
            }}
            className={
              getInputClasses("title") +
              (validationErrors.title ? " error-field" : "")
            }
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm mt-1">Title is required</p>
          )}
        </div>

        <div id="maker-input-summary">
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Summary*</label>
            <GenerateButton field="summary" loading={loading} generateField={generateField} />
          </div>
          <SuggestionBox
            field="summary"
            suggestions={suggestions}
            copySuggestion={copySuggestion}
            applySuggestion={applySuggestion}
          />
          <textarea
            value={recipe.summary}
            onChange={(e) => {
              handleChange("summary", e.target.value);
              if (e.target.value.trim()) {
                setValidationErrors((prev) => ({ ...prev, summary: false }));
              }
            }}
            className={
              getInputClasses("summary") +
              (validationErrors.summary ? " error-field" : "")
            }
          />
          {validationErrors.summary && (
            <p className="text-red-500 text-sm mt-1">Summary is required</p>
          )}
        </div>

        <div id="maker-input-ready-in-minutes">
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Ready In Minutes*</label>
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
              <span>{suggestions['readyInMinutes']}</span>
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
          <input
            type="number"
            min="0"
            value={recipe.readyInMinutes}
            onChange={(e) => {
              const value = e.target.value === "" ? 0 : +e.target.value;
              handleChange("readyInMinutes", value);
              if (value > 0) {
                setValidationErrors((prev) => ({
                  ...prev,
                  readyInMinutes: false,
                }));
              }
            }}
            onKeyDown={(e) => {
              // Allow: backspace, delete, tab, escape, enter, decimal point
              if (
                ["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(
                  e.key
                ) ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (["a", "c", "v", "x"].includes(e.key.toLowerCase()) &&
                  (e.ctrlKey || e.metaKey)) ||
                // Allow: home, end, left, right
                ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)
              ) {
                return;
              }
              // Ensure that it's a number or stop the keypress
              if (
                (e.shiftKey || e.key < "0" || e.key > "9") &&
                !["ArrowUp", "ArrowDown"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className={
              getInputClasses("readyInMinutes") +
              (validationErrors.readyInMinutes ? " error-field" : "")
            }
          />
          {validationErrors.readyInMinutes && (
            <p className="text-red-500 text-sm mt-1">
              Ready in minutes must be greater than 0
            </p>
          )}
        </div>

        <div id="maker-input-servings">
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Servings*</label>
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
              <span>{suggestions['servings']}</span>
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
          <input
            type="number"
            min="0"
            value={recipe.servings}
            onChange={(e) => {
              const value = e.target.value === "" ? 0 : +e.target.value;
              handleChange("servings", value);
              if (value > 0) {
                setValidationErrors((prev) => ({ ...prev, servings: false }));
              }
            }}
            onKeyDown={(e) => {
              // Allow: backspace, delete, tab, escape, enter, decimal point
              if (
                ["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(
                  e.key
                ) ||
                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                (["a", "c", "v", "x"].includes(e.key.toLowerCase()) &&
                  (e.ctrlKey || e.metaKey)) ||
                // Allow: home, end, left, right
                ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)
              ) {
                return;
              }
              // Ensure that it's a number or stop the keypress
              if (
                (e.shiftKey || e.key < "0" || e.key > "9") &&
                !["ArrowUp", "ArrowDown"].includes(e.key)
              ) {
                e.preventDefault();
              }
            }}
            className={
              getInputClasses("servings") +
              (validationErrors.servings ? " error-field" : "")
            }
          />
          {validationErrors.servings && (
            <p className="text-red-500 text-sm mt-1">
              Servings must be greater than 0
            </p>
          )}
        </div>

        <div id="maker-input-ingredients">
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
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={ingredient}
                onChange={(e) => {
                  handleListChange("ingredients", index, e.target.value);
                  if (index === 0 && e.target.value.trim()) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      ingredients: false,
                    }));
                  }
                }}
                className={`flex-1 p-2 border rounded ${
                  index === 0 && validationErrors.ingredients
                    ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.6)] error-field"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => handleRemoveItem("ingredients", index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("ingredients")}
            className="text-blue-500"
          >
            Add Ingredient
          </button>
          {validationErrors.ingredients && (
            <p className="text-red-500 text-sm mt-1">
              At least one ingredient is required
            </p>
          )}
        </div>

        <div id="maker-input-instructions">
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
            value={recipe.instructions}
            onChange={(e) => {
              handleChange("instructions", e.target.value);
              if (e.target.value.trim()) {
                setValidationErrors((prev) => ({
                  ...prev,
                  instructions: false,
                }));
              }
            }}
            className={
              getInputClasses("instructions") +
              (validationErrors.instructions ? " error-field" : "")
            }
          />
          {validationErrors.instructions && (
            <p className="text-red-500 text-sm mt-1">
              Instructions are required
            </p>
          )}
        </div>

        <div id="maker-input-diets">
          <div className="flex justify-between items-center mb-1">
            <label className="font-bold">Diets</label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateField('diets')}
              disabled={loading['diets']}
            >
              {loading['diets'] ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          {suggestions['diets'] && (
            <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
              <span>{suggestions['diets']}</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copySuggestion('diets')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applySuggestion('diets')}
                >
                  Replace
                </Button>
              </div>
            </div>
          )}
          {(recipe.diets ?? []).map((diet, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <select
                id="diet"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                onChange={(e) =>
                  handleListChange("diets", index, e.target.value)
                }
                value={diet}
              >
                <option value="">None</option>
                <option value="Gluten Free">Gluten Free</option>
                <option value="Ketogenic">Ketogenic</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Lacto-Vegetarian">Lacto-Vegetarian</option>
                <option value="Ovo-Vegetarian">Ovo-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Pescetarian">Pescetarian</option>
                <option value="Paleo">Paleo</option>
                <option value="Primal">Primal</option>
                <option value="Low FODMAP">Low FODMAP</option>
                <option value="Whole30">Whole30</option>
              </select>
              <button
                type="button"
                onClick={() => handleRemoveItem("diets", index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("diets")}
            className="text-blue-500"
          >
            Add Diet
          </button>
        </div>

        <div id="maker-input-steps">
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
          {(recipe.steps ?? []).map((step, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={step}
                onChange={(e) => {
                  handleListChange("steps", index, e.target.value);
                  if (index === 0 && e.target.value.trim()) {
                    setValidationErrors((prev) => ({ ...prev, steps: false }));
                  }
                }}
                className={`flex-1 p-2 border rounded ${
                  index === 0 && validationErrors.steps
                    ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.6)] error-field"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => handleRemoveItem("steps", index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => handleAddItem("steps")}
            className="text-blue-500"
          >
            Add Step
          </button>
          {validationErrors.steps && (
            <p className="text-red-500 text-sm mt-1">
              At least one step is required
            </p>
          )}
        </div>

        <div id="maker-input-image">
          <label className="block font-bold mb-1">Image URL</label>
          <input
            type="text"
            value={recipe.image ?? ""} // Handle null value
            onClick={(event: any) => {
              event.target.select();
            }}
            onChange={(e) => {
              const imageURL = e.target.value;
              setRecipe({ ...recipe, image: imageURL });
              if (imageURL.length > 250) {
                setErrorMessage("Error: URL is too long");
              } else {
                setErrorMessage("");
              }
            }}
            className="p-2 border rounded w-full"
          />
        </div>

        <p className="text-red-500 font-medium mt-2 text-sm">{errorMessage}</p>
        {isLoggedIn ? (
          <button
            type="submit"
            className="w-full bg-[#a84e24] text-white font-bold p-2 rounded hover:bg-[#8e4220] transition-colors"
          >
            Create Recipe
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-center text-gray-700 font-medium">
              Log in to create this recipe
            </p>
            <button
              type="button"
              onClick={() => navigate("/account")}
              className="w-full bg-[#ff9e40] text-white font-bold p-2 rounded hover:bg-[#e7890c] transition-colors"
            >
              Log In
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RecipeMaker;
