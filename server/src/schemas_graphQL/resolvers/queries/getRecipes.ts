import { Recipe } from "../../../models_mongo/index.js";
import { recipe, user_context } from "../../../types/index.js";
import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { User } from "../../../models_mongo/index.js";

export default {
  getRecipes: async (
    _parent: any,
    _args: any,
    context: user_context
  ): Promise<recipe[] | null> => {
    if (!context.user) {
      throw new AuthenticationError("could not authenticate user.");
    }

    const user = await User.findOne({ _id: context.user._id });

    if (!user) {
      throw new AuthenticationError("could not find user.");
    }

    const savedRecipes = user.savedRecipes;

    if (!savedRecipes) {
      console.log(`no recipes found for ${user.userName}`);
      return null;
    } else if (savedRecipes.length == 0) {
      console.log(`no recipes found for ${user.userName}`);
      return null;
    }
    let recipes: recipe[] = [];

    // Reverse the savedRecipes array to show the newest first on the page
    const reversedRecipes = [...savedRecipes].reverse();

    for (const id of reversedRecipes) {
      const recipe: recipe | null = await Recipe.findById(id);
      if (!recipe) {
        //console.log("skipping...");
        continue;
      }
      recipes.push(recipe);
    }

    return recipes;
  },
};
