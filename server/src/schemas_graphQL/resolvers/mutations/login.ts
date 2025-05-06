import { User } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";
import { signToken } from "../../../middleware/auth_graphQL.js";

export default {
  // login a user, sign a token, and send it back
  login: async (
    _: any,
    args: { userEmail: string; userPassword: string }
  ): Promise<any> => {
    const { userEmail, userPassword } = args;
    //console.log(userEmail);
    const user = await User.findOne({ userEmail: userEmail });

    if (!user) {
      throw new GraphQLError("Wrong email");
    }

    const correctPw = await user.isCorrectPassword(userPassword);
    if (!correctPw) {
      throw new GraphQLError("Wrong password");
    }

    const token = signToken(user.userName, user.userPassword, user._id);
    return { token, user };
  },
};
