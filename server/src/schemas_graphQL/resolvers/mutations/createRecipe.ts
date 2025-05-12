import { user_context } from "../../../types/index.js";
import { Recipe } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";

export default {
  // Save a user-generated recipe to the overall recipe collection
  createRecipe: async (
    _parent: any,
    {
      recipeInput,
    }: {
      recipeInput: {
        title: string;
        author: string;
        summary: string;
        readyInMinutes: number;
        servings: number;
        ingredients: string[];
        instructions: string;
        steps: string[];
        diet?: string[];
        image?: string;
      };
    },
    _context: user_context
  ) => {
    try {
      const newRecipe = await Recipe.create(recipeInput);

      if (!newRecipe) {
        throw new GraphQLError("Recipe was not saved to the database.");
      }

      return newRecipe;
    } catch (err) {
      console.error("Error saving recipe to collection:", err);
      throw new GraphQLError("Error saving recipe to collection.");
    }
  },
};
