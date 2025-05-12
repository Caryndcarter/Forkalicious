import { GraphQLError } from "graphql";
import { Review, User } from "../../../models_mongo/index.js";

export default {
  // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
  saveReviewToUser: async (
    _parent: any,
    { reviewId }: { reviewId: string },
    context: any
  ) => {
    if (!context.user) {
      console.log("No user in context:", context.user);
      throw new GraphQLError("You must be logged in");
    }

    try {
      //console.log("Attempting to update user with review:", reviewId);

      // Check if the recipe exists in the Recipe collection
      const existingReview = await Review.findById(reviewId);

      if (!existingReview) {
        throw new GraphQLError("Review not found");
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: context.user._id },
        { $addToSet: { reviews: reviewId } },
        { new: true, runValidators: true }
      );

      // console.log("Updated user:", updatedUser);

      if (!updatedUser) {
        console.log("User not found or update failed.");
        throw new GraphQLError(
          "Error saving review: User not found or update failed."
        );
      }

      return updatedUser;
    } catch (err) {
      console.log("Error saving review ID to user:", err);
      throw new GraphQLError("Error saving review ID to user.");
    }
  },
};
