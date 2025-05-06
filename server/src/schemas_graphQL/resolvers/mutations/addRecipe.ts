import { Recipe } from "../../../models_mongo/index.js";
import { recipe } from "../../../types/index.js";
import { GraphQLError } from "graphql";

export default {
  // Save a recipe to the overall recipe collection
  addRecipe: async (
    _parent: any,
    {
      recipeInput,
    }: {
      recipeInput: {
        title: string;
        summary: string;
        readyInMinutes: number;
        servings: number;
        ingredients: string[];
        instructions: string;
        steps: string[];
        diet?: string[];
        image?: string;
        sourceUrl?: string;
        spoonacularId?: number;
        spoonacularSourceUrl?: string;
      };
    }
  ) => {
    try {
      const { spoonacularId } = recipeInput;

      // check for duplicates by the spoonacular ID
      let duplicate: recipe | null = null;

      if (spoonacularId) {
        duplicate = await Recipe.findOne({
          spoonacularId: spoonacularId,
        }).exec();
      }

      if (duplicate) {
        //console.log("duplicate found.");
        return duplicate;
      }

      // Create and save the new recipe
      const newRecipe = await Recipe.create(recipeInput);

      if (!newRecipe) {
        throw new GraphQLError("Error saving recipe to collection.");
      }

      return newRecipe;
    } catch (err) {
      console.error("Error saving recipe to collection:", err);
      throw new GraphQLError("Error saving recipe to collection.");
    }
  },
};
