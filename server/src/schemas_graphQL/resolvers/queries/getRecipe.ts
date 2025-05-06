import mongoose from "mongoose";
import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { user_context, recipeAuthor, recipe } from "../../../types/index.js";
import { User, Recipe } from "../../../models_mongo/index.js";

export default {
  getRecipe: async (
    _parent: any,
    args: {
      mongoID: mongoose.Schema.Types.ObjectId;
      spoonacularId: number;
    },
    context: user_context
  ): Promise<recipeAuthor | null> => {
    if (!context.user) {
      throw new AuthenticationError("could not authenticate user.");
    }

    const user = await User.findOne({ _id: context.user._id });

    if (!user) {
      throw new AuthenticationError("could not find user.");
    }

    const { mongoID, spoonacularId } = args;

    //console.log(mongoID, spoonacularId);

    let recipe: recipe | null = null;

    if (mongoID) {
      recipe = await Recipe.findById(mongoID);
    } else if (spoonacularId) {
      recipe = await Recipe.findOne({ spoonacularId: spoonacularId });
    }

    if (recipe) {
      let author = false;
      const id = context.user._id;
      const authorID = recipe.author;
      if (id && authorID) {
        author = id == authorID.toString();
      }
      return { recipe: recipe, author: author };
    } else {
      return null;
    }
  },
};
