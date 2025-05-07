import mongoose from "mongoose";
import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { user_context } from "../../../types/index.js";
import { User, Recipe } from "../../../models_mongo/index.js";
// import { GraphQLError } from "graphql";

export default {
  updateRecipe: async (
    _parent: any,
    args: {
      mongoID: string; // GraphQL ID is typically a string
      update: {
        title?: string;
        summary?: string;
        readyInMinutes?: number;
        servings?: number;
        ingredients?: string[];
        instructions?: string;
        steps?: string[];
        diet?: string[];
        image?: string;
        sourceUrl?: string;
        spoonacularId?: number;
        spoonacularSourceUrl?: string;
      };
    },
    context: user_context // Replace with your actual context type
  ): Promise<any | null> => {
    // Return type should match your GraphQL Recipe type or null
    if (!context.user || !context.user._id) {
      // Ensure user and user._id exist
      throw new AuthenticationError("User not authenticated.");
    }

    const user = await User.findById(context.user._id); // Use findById for user context ID
    if (!user) {
      throw new AuthenticationError("Could not find user.");
    }

    const { mongoID, update } = args;

    if (!mongoose.Types.ObjectId.isValid(mongoID)) {
      throw new Error("Invalid MongoDB ID format."); // Or a specific GraphQL error
    }

    try {
      // Find the recipe and update it.
      // { new: true } option returns the modified document rather than the original.
      const updatedRecipe = await Recipe.findByIdAndUpdate(
        mongoID,
        { $set: update },
        { new: true, runValidators: true } // runValidators is good practice
      );

      if (!updatedRecipe) {
        // If the recipe with the given mongoID doesn't exist, findByIdAndUpdate returns null
        // You might want to throw an error or return null based on your API design
        // For a mutation that's supposed to update, returning null is common if not found.
        // Or throw new Error("Recipe not found.");
        return null;
      }

      return updatedRecipe; // Return the updated recipe
    } catch (error) {
      console.error("Error updating recipe:", error);
      // Depending on the error, you might want to throw a more specific GraphQL error
      // For now, re-throwing or throwing a generic error will add it to the GraphQL errors array
      throw new Error("Failed to update recipe.");
    }
  },
};
