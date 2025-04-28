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
    context: user_context
  ) => {
    //const userID = context.user._id;
    //const authorID = recipeInput.author;

    //console.log("User's id: " + userID + " type of: " + typeof userID);
    //console.log("Author's id: " + authorID + " type of: " + typeof authorID);

    try {
      if (context.user._id == recipeInput.author) {
        //console.log("editing my own recipe");
        const updatedRecipe = await Recipe.findOneAndUpdate(
          { author: context.user._id },
          recipeInput,
          {
            new: true,
            runValidators: true,
          }
        );

        if (!updatedRecipe) {
          throw new GraphQLError("Error saving recipe to collection.");
        }

        return updatedRecipe;
      } else {
        // recipeInput.author = context.user._id as ObjectId;
        // Create and save the new recipe
        const newRecipe = await Recipe.create(recipeInput);

        if (!newRecipe) {
          throw new GraphQLError("Error saving recipe to collection.");
        }

        return newRecipe;
      }
    } catch (err) {
      console.error("Error saving recipe to collection:", err);
      throw new GraphQLError("Error saving recipe to collection.");
    }
  },
};
