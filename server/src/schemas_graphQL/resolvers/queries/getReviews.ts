import mongoose from "mongoose";
import { Recipe } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";

export default {
  getReviews: async (
    _: any,
    { recipeId }: { recipeId: string }
  ): Promise<any> => {
    try {
      const objectId = new mongoose.Types.ObjectId(recipeId);
      // Find the recipe and populate its reviews with user details
      const recipeReviews = await Recipe.findById(objectId).populate({
        path: "reviews",
        model: "Review",
        select: "rating comment userName",
      });

      if (!recipeReviews) {
        throw new GraphQLError("Recipe not found");
      }

      return recipeReviews.reviews;
    } catch (err) {
      console.error("Error fetching reviews:", err);
      throw new GraphQLError("Failed to fetch reviews");
    }
  },
};
