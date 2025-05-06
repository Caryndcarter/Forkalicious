import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { GraphQLError } from "graphql";
import { User } from "../../../models_mongo/index.js";

export default {
  getSpecificRecipeId: async (
    _: any,
    { recipeId }: { recipeId: string },
    context: any
  ): Promise<string | null> => {
    if (!recipeId) {
      return null;
    }

    //console.log("Received recipeId:", recipeId);
    //console.log("Context user:", context.user);

    if (!context.user) {
      throw new AuthenticationError("User not authenticated.");
    }

    try {
      // Convert recipeId string to ObjectId
      //const objectId = new mongoose.Types.ObjectId(recipeId);

      // Find the user by their ID
      const user = await User.findOne({ _id: context.user._id });

      if (!user) {
        throw new GraphQLError("User not found.");
      }

      const savedRecipes = user.savedRecipes || [];

      // Check if the provided recipeId exists in savedRecipes
      const foundRecipe = savedRecipes.find((id) => id.toString() === recipeId);

      // Return the recipeId if found, otherwise return null
      return foundRecipe ? foundRecipe.toString() : null;
    } catch (err) {
      console.error("Error in get specific recipe resolver:", err);
      throw new GraphQLError("Failed to check if the recipe is saved.");
    }
  },
};
