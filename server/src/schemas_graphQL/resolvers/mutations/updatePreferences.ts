import { diet, intolerance, user_context } from "../../../types/index.js";
import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { User } from "../../../models_mongo/index.js";

export default {
  // update the preferences of a user
  updatePreferences: async (
    _: any,
    args: {
      diet?: diet;
      intolerances?: intolerance[];
    },
    context: user_context
  ): Promise<any> => {
    if (!context.user) {
      throw new AuthenticationError("could not authenticate user.");
    }

    const user = await User.findOne({ _id: context.user._id });

    if (!user) {
      throw new AuthenticationError("could not find user.");
    }

    const { diet, intolerances } = args;

    if (diet) {
      user.diet = diet;
    }

    if (intolerances) {
      user.intolerances = intolerances;
    }

    await user.save();
    //console.log(`${user.userName}'s new preferences are saved`);
    return {
      id: user._id,
      diet: user.diet || null,
      intolerances: user.intolerances || [],
    };
  },
};
