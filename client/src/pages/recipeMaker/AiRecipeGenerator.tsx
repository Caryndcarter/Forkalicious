import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import askService from "@/api/askService";
import { RecipeDetails } from "@/types";

interface AiRecipeGeneratorProps {
  loggedIn: boolean;
  onRecipeGenerated: (recipe: RecipeDetails) => void;
}

const AiRecipeGenerator = ({
  loggedIn,
  onRecipeGenerated,
}: AiRecipeGeneratorProps) => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState<string>("");
  const [AILoading, setAILoading] = useState<boolean>(false);

  const handleAiCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setAILoading(true);

    try {
      const response = await askService.askForRecipe(prompt);
      const recipe = response.formattedResponse;

      const generatedRecipe: RecipeDetails = {
        _id: null,
        title: recipe.title,
        author: null,
        summary: recipe.Summary,
        readyInMinutes: Number.parseInt(recipe.ReadyInMinutes),
        servings: Number.parseInt(recipe.Servings),
        ingredients: recipe.Ingredients.split(";"),
        instructions: recipe.Instructions,
        diets: recipe.Diets.split(";"),
        steps: recipe.Steps.split(";"),
        image: "",
      };

      onRecipeGenerated(generatedRecipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setAILoading(false);
    }
  };

  if (!loggedIn) {
    return (
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
    );
  }

  return (
    <form
      onSubmit={handleAiCall}
      className="w-full max-w-3xl mx-auto p-6 bg-[#fadaae] rounded-lg shadow-lg space-y-4 border border-[#e7890c]/20 mb-6"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#a84e24]" />
          <Label htmlFor="prompt" className="font-bold text-lg text-[#a84e24]">
            Recipe AI Assistant
          </Label>
        </div>

        <p className="text-[#8e4220] text-sm">
          Describe the recipe you want to create and our AI will generate it for
          you!
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
  );
};

export default AiRecipeGenerator;
