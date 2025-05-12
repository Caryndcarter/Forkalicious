import { Review } from "../../../models_mongo/index.js";

export default {
  getReviewsByRecipeId: async (
    _: any,
    { reviewIds }: { reviewIds: string[] }
  ): Promise<any> => {
    try {
      // Find reviews by the array of review IDs
      const reviews = await Review.find({ _id: { $in: reviewIds } });

      // Return the found reviews
      return reviews;
    } catch (error) {
      console.error("Error fetching reviews:", error);
      throw new Error("Failed to fetch reviews");
    }
  },
};
