import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Copy } from "lucide-react";
import { RecipeDetails } from "@/types";
import askService from "@/api/askService";

interface RecipeFormFieldsProps {
  recipe: RecipeDetails;
  onRecipeChange: (field: keyof RecipeDetails, value: any) => void;
  onListChange: (
    field: keyof RecipeDetails,
    index: number,
    value: string
  ) => void;
  onAddItem: (field: keyof RecipeDetails) => void;
  onRemoveItem: (field: keyof RecipeDetails, index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  validationErrors: Record<string, boolean>;
  setValidationErrors: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  errorMessage: string;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoggedIn: boolean;
}

const RecipeFormFields = ({
  recipe,
  onRecipeChange,
  onListChange,
  onAddItem,
  onRemoveItem,
  onSubmit,
  validationErrors,
  setValidationErrors,
  errorMessage,
  setErrorMessage,
  isLoggedIn,
}: RecipeFormFieldsProps) => {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const listFields = ["ingredients", "steps", "diets"];

  const generateField = async (field: string) => {
    setLoading((prev) => ({ ...prev, [field]: true }));

    const preparedRecipe = {
      title: recipe.title,
      summary: recipe.summary,
      readyInMinutes: recipe.readyInMinutes.toString(),
      servings: recipe.servings.toString(),
      ingredients: recipe.ingredients.join("; "),
      instructions: recipe.instructions,
      steps: recipe.steps?.join("; ") || "",
      diets: recipe.diets?.join("; ") || "",
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
      onRecipeChange(
        field as keyof RecipeDetails,
        value
          .split("; ")
          .map((s) => s.trim())
          .filter((s) => s)
      );
    } else if (["readyInMinutes", "servings"].includes(field)) {
      onRecipeChange(field as keyof RecipeDetails, parseInt(value) || 0);
    } else {
      onRecipeChange(field as keyof RecipeDetails, value);
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

  const getInputClasses = (fieldName: string) => {
    return `w-full p-2 border rounded ${
      validationErrors[fieldName]
        ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,1)] focus:shadow-[0_0_0_2px_rgba(239,68,68,0.6)]"
        : ""
    }`;
  };

  const renderSuggestionBox = (field: string) => {
    if (!suggestions[field]) return null;

    return (
      <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
        <span>{suggestions[field]}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copySuggestion(field)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => applySuggestion(field)}
          >
            Replace
          </Button>
        </div>
      </div>
    );
  };

  const renderFieldHeader = (
    label: string,
    field: string,
    required = false
  ) => (
    <div className="flex justify-between items-center mb-1">
      <label className="font-bold">
        {label}
        {required && "*"}
      </label>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => generateField(field)}
        disabled={loading[field]}
      >
        {loading[field] ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </Button>
    </div>
  );

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-3xl mx-auto bg-[#fadaae] p-6 shadow-lg rounded-lg space-y-4 border border-gray-200"
    >
      {/* Title Section */}
      <section id="title-section">
        {renderFieldHeader("Title", "title", true)}
        {renderSuggestionBox("title")}
        <input
          id="title-input"
          type="text"
          value={recipe.title}
          onChange={(e) => {
            onRecipeChange("title", e.target.value);
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
      </section>

      {/* Summary Section */}
      <section id="summary-section">
        {renderFieldHeader("Summary", "summary", true)}
        {renderSuggestionBox("summary")}
        <textarea
          id="summary-textArea"
          value={recipe.summary}
          onChange={(e) => {
            onRecipeChange("summary", e.target.value);
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
      </section>

      {/* Ready In Minutes Section */}
      <section id="ready-in-minutes-section">
        {renderFieldHeader("Ready In Minutes", "readyInMinutes", true)}
        {renderSuggestionBox("readyInMinutes")}
        <input
          id="ready-in-minutes-input"
          type="number"
          min="0"
          value={recipe.readyInMinutes}
          onChange={(e) => {
            const value = e.target.value === "" ? 0 : +e.target.value;
            onRecipeChange("readyInMinutes", value);
            if (value > 0) {
              setValidationErrors((prev) => ({
                ...prev,
                readyInMinutes: false,
              }));
            }
          }}
          onKeyDown={(e) => {
            if (
              ["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(
                e.key
              ) ||
              (["a", "c", "v", "x"].includes(e.key.toLowerCase()) &&
                (e.ctrlKey || e.metaKey)) ||
              ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              return;
            }
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
      </section>

      {/* Servings Section */}
      <section id="servings-section">
        {renderFieldHeader("Servings", "servings", true)}
        {renderSuggestionBox("servings")}
        <input
          id="servings-input"
          type="number"
          min="0"
          value={recipe.servings}
          onChange={(e) => {
            const value = e.target.value === "" ? 0 : +e.target.value;
            onRecipeChange("servings", value);
            if (value > 0) {
              setValidationErrors((prev) => ({ ...prev, servings: false }));
            }
          }}
          onKeyDown={(e) => {
            if (
              ["Backspace", "Delete", "Tab", "Escape", "Enter", "."].includes(
                e.key
              ) ||
              (["a", "c", "v", "x"].includes(e.key.toLowerCase()) &&
                (e.ctrlKey || e.metaKey)) ||
              ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)
            ) {
              return;
            }
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
      </section>

      {/* Ingredients Section */}
      <section id="ingredients-section">
        {renderFieldHeader("Ingredients", "ingredients", true)}
        {renderSuggestionBox("ingredients")}
        {recipe.ingredients.map((ingredient, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={ingredient}
              onChange={(e) => {
                onListChange("ingredients", index, e.target.value);
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
              onClick={() => onRemoveItem("ingredients", index)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          id="add-ingredient-button"
          type="button"
          onClick={() => onAddItem("ingredients")}
          className="text-blue-500"
        >
          Add Ingredient
        </button>
        {validationErrors.ingredients && (
          <p className="text-red-500 text-sm mt-1">
            At least one ingredient is required
          </p>
        )}
      </section>

      {/* Instructions Section */}
      <section id="instructions-section">
        {renderFieldHeader("Instructions", "instructions", true)}
        {renderSuggestionBox("instructions")}
        <textarea
          id="instructions-textarea"
          value={recipe.instructions}
          onChange={(e) => {
            onRecipeChange("instructions", e.target.value);
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
          <p className="text-red-500 text-sm mt-1">Instructions are required</p>
        )}
      </section>

      {/* Diet Section */}
      <section id="diet-section">
        {renderFieldHeader("Diets", "diets")}
        {renderSuggestionBox("diets")}
        {(recipe.diets ?? []).map((diet, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <select
              id="diet-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              onChange={(e) => onListChange("diets", index, e.target.value)}
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
              onClick={() => onRemoveItem("diets", index)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          id="add-diet-button"
          type="button"
          onClick={() => onAddItem("diets")}
          className="text-blue-500"
        >
          Add Diet
        </button>
      </section>

      {/* Steps Section */}
      <section id="steps-section">
        {renderFieldHeader("Steps", "steps", true)}
        {renderSuggestionBox("steps")}
        {(recipe.steps ?? []).map((step, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={step}
              onChange={(e) => {
                onListChange("steps", index, e.target.value);
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
              onClick={() => onRemoveItem("steps", index)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          id="add-step-button"
          type="button"
          onClick={() => onAddItem("steps")}
          className="text-blue-500"
        >
          Add Step
        </button>
        {validationErrors.steps && (
          <p className="text-red-500 text-sm mt-1">
            At least one step is required
          </p>
        )}
      </section>

      {/* Image Section */}
      <section id="image-section">
        <label className="block font-bold mb-1">Image URL</label>
        <input
          id="image-input"
          type="text"
          value={recipe.image ?? ""}
          onClick={(event: any) => {
            event.target.select();
          }}
          onChange={(e) => {
            const imageURL = e.target.value;
            onRecipeChange("image", imageURL);
            if (imageURL.length > 250) {
              setErrorMessage("Error: URL is too long");
            } else {
              setErrorMessage("");
            }
          }}
          className="p-2 border rounded w-full"
        />
      </section>

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
  );
};

export default RecipeFormFields;
