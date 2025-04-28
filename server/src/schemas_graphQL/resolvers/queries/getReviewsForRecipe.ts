import mongoose from "mongoose";
import { Recipe } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";

export default {
  getReviewsForRecipe: async (
    _: any,
    { recipeId }: { recipeId: string }
  ): Promise<any> => {
    try {
      const objectId = new mongoose.Types.ObjectId(recipeId);
      const recipe = await Recipe.findById(objectId).populate({
        path: "reviews",
        model: "Review",
        select: "_id rating comment userName",
      });

      if (!recipe) {
        throw new GraphQLError("Recipe not found");
      }

      return recipe.reviews;
    } catch (err) {
      console.error("Error fetching reviews for recipe:", err);
      throw new GraphQLError("Failed to fetch reviews for recipe");
    }
  },
};
