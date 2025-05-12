import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { Review, Recipe, User } from "../../../models_mongo/index.js";

export default {
  // delete a review from the review collection and off of the arrays on the user and the recipes
  deleteReview: async (
    _parent: any,
    { reviewId }: { reviewId: string },
    context: any
  ) => {
    //console.log("Attempting to delete review:", reviewId);

    if (!context.user) {
      throw new GraphQLError("You must be logged in!");
    }

    try {
      // Convert recipeId to ObjectId to ensure correct matching
      const objectId = new mongoose.Types.ObjectId(reviewId);
      //console.log("Converted to ObjectId:", objectId);

      const deletedReview = await Review.findByIdAndDelete(objectId);

      if (!deletedReview) {
        throw new GraphQLError("Review not found.");
      }

      //console.log("Deleted Review:", deletedReview);

      await Recipe.findOneAndUpdate(
        { reviews: objectId },
        { $pull: { reviews: objectId } },
        { new: true }
      );

      //console.log("Removed review from recipe.");

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { reviews: objectId } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new GraphQLError("Couldn't find user with this id!");
      }

      return updatedUser;
    } catch (err) {
      console.log("Error deleting review:", err);
      throw new GraphQLError("Error deleting review.");
    }
  },
};
