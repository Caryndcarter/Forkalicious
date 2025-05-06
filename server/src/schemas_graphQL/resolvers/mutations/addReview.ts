import { user_context } from "../../../types/index.js";
import { User, Recipe, Review } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";

export default {
  // Add a review to the overall collection
  addReview: async (
    _parent: any,
    {
      reviewInput,
    }: { reviewInput: { recipeId: string; rating: number; comment: string } },
    context: user_context
  ): Promise<any> => {
    try {
      const { recipeId, rating, comment } = reviewInput;

      const user = await User.findOne({ _id: context.user._id });
      if (!user) {
        throw new GraphQLError("User not found.");
      }

      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        throw new GraphQLError("Recipe not found.");
      }

      const newReview = new Review({
        userId: context.user._id,
        recipeId,
        rating,
        comment,
        userName: user.userName,
      });

      //console.log(newReview); //
      // // Save the review to the database
      const savedReview = await newReview.save();

      if (!savedReview) {
        throw new GraphQLError("Error saving review to collection.");
      }

      return savedReview;
    } catch (err) {
      console.error("Error saving review to collection:", err);
      throw new GraphQLError("Error saving review to collection.");
    }
  },
};
