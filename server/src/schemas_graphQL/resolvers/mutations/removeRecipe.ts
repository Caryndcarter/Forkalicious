import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { User } from "../../../models_mongo/index.js";

export default {
  // remove a recipe from a user's `savedRecipes`
  removeRecipe: async (
    _parent: any,
    { recipeId }: { recipeId: string },
    context: any
  ) => {
    //console.log("Attempting to remove recipe:", recipeId);

    if (!context.user) {
      throw new GraphQLError("You must be logged in!");
    }

    // Convert recipeId to ObjectId to ensure correct matching
    const objectId = new mongoose.Types.ObjectId(recipeId);
    //console.log("Converted to ObjectId:", objectId);

    try {
      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { savedRecipes: objectId } },
        { new: true, runValidators: true }
      );

      //console.log("Saved recipes after:", updatedUser?.savedRecipes);

      if (!updatedUser) {
        throw new GraphQLError("Couldn't find user with this id!");
      }

      return updatedUser;
    } catch (err) {
      console.log("Error removing recipe:", err);
      throw new GraphQLError("Error removing recipe.");
    }
  },
};
