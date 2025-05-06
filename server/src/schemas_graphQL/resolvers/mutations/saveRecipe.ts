import { GraphQLError } from "graphql";
import { Recipe, User } from "../../../models_mongo/index.js";

export default {
  // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
  saveRecipe: async (
    _parent: any,
    { recipeId }: { recipeId: string },
    context: any
  ) => {
    if (!context.user) {
      console.log("No user in context:", context.user);
      throw new GraphQLError("You must be logged in");
    }

    try {
      //console.log("Attempting to update user with recipe:", recipeId);

      // Check if the recipe exists in the Recipe collection
      const existingRecipe = await Recipe.findById(recipeId);

      if (!existingRecipe) {
        throw new GraphQLError("Recipe not found");
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { savedRecipes: recipeId } },
        { new: true, runValidators: true }
      );

      //console.log("Updated user:", updatedUser);

      if (!updatedUser) {
        console.log("User not found or update failed.");
        throw new GraphQLError(
          "Error saving recipe: User not found or update failed."
        );
      }

      return updatedUser;
    } catch (err) {
      console.log("Error saving recipe:", err);
      throw new GraphQLError("Error saving recipe.");
    }
  },
};
