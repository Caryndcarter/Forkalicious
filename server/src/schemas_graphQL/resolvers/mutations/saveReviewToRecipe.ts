import mongoose from "mongoose";
import { Review, Recipe } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";

export default {
  // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
  saveReviewToRecipe: async (
    _parent: any,
    args: {
      recipeId: string;
      reviewId: mongoose.Schema.Types.ObjectId;
    }
  ) => {
    try {
      const { recipeId, reviewId } = args;
      //console.log("Attempting to update recipe with review:", reviewId);

      // Check if the recipe exists in the Recipe collection
      const existingReview = await Review.findById(reviewId);

      if (!existingReview) {
        throw new GraphQLError("Review not found");
      }

      const objectId = new mongoose.Types.ObjectId(recipeId);

      const updatedRecipe = await Recipe.findOneAndUpdate(
        { _id: objectId },
        { $addToSet: { reviews: reviewId } },
        { new: true, runValidators: true }
      );

      //console.log("Updated recipe:", updatedRecipe);

      if (!updatedRecipe) {
        console.log("Recipe not found or update failed.");
        throw new GraphQLError(
          "Error saving review: Recipe not found or update failed."
        );
      }

      return updatedRecipe;
    } catch (err) {
      console.log("Error saving review ID to user:", err);
      throw new GraphQLError("Error saving review ID to recipe.");
    }
  },
};
