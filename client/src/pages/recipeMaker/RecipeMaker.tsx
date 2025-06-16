import { useState, useContext, useLayoutEffect, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { defaultRecipe, type RecipeDetails } from "@/types";
import { editingContext, userContext } from "@/App";
import Auth from "@/utils_graphQL/auth";
import { useMutation } from "@apollo/client";
import { CREATE_RECIPE, SAVE_RECIPE } from "@/utils_graphQL/mutations";
import localStorageService from "@/utils_graphQL/localStorageService";
import AiRecipeGenerator from "./AiRecipeGenerator";
import RecipeFormFields from "./RecipeFormFields";

const LOCAL_STORAGE_KEY = "recipeFormProgress";

const RecipeMaker = () => {
  const { isEditing, setIsEditing } = useContext(editingContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [createRecipe] = useMutation(CREATE_RECIPE);
  const [saveRecipe] = useMutation(SAVE_RECIPE);
  const isLoggedIn = Auth.loggedIn();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});

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

    // Get the current recipe from local storage service instead of context
    const currentRecipeDetails =
      localStorageService.getCurrentRecipe() || defaultRecipe;

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
  }, [isEditing, setIsEditing]);

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
      return;
    }

    // Clear any previous validation errors
    setValidationErrors({});

    if (recipe.image) {
      if (recipe.image.length > 250) {
        setErrorMessage("Error: URL is too long");
        return;
      }
    }

    try {
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
    } catch (error) {
      console.error("Error creating recipe:", error);
      setErrorMessage("Failed to create recipe. Please try again.");
    }
  };

  const handleRecipeGenerated = (generatedRecipe: RecipeDetails) => {
    setRecipe((prev) => ({
      ...prev,
      title: generatedRecipe.title,
      summary: generatedRecipe.summary,
      readyInMinutes: generatedRecipe.readyInMinutes,
      servings: generatedRecipe.servings,
      ingredients: generatedRecipe.ingredients,
      instructions: generatedRecipe.instructions,
      diets: generatedRecipe.diets,
      steps: generatedRecipe.steps,
    }));
  };

  // Function to clear saved form data
  const clearSavedFormData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setRecipe(emptyRecipe);
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

      <AiRecipeGenerator
        loggedIn={loggedIn}
        onRecipeGenerated={handleRecipeGenerated}
      />

      <RecipeFormFields
        recipe={recipe}
        onRecipeChange={handleChange}
        onListChange={handleListChange}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onSubmit={handleSubmit}
        validationErrors={validationErrors}
        setValidationErrors={setValidationErrors}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        isLoggedIn={isLoggedIn}
      />
    </div>
  );
};

export default RecipeMaker;
