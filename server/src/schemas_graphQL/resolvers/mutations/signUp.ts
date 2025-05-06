import { User } from "../../../models_mongo/index.js";
import { GraphQLError } from "graphql";
import { signToken } from "../../../middleware/auth_graphQL.js";

export default {
  // create a user, sign a token, and send it back
  signUp: async (
    _parent: any,
    {
      userName,
      userEmail,
      userPassword,
    }: { userName: string; userEmail: string; userPassword: string }
  ) => {
    const user = await User.create({ userName, userEmail, userPassword });

    if (!user) {
      throw new GraphQLError("Something is Wrong! Creating user failed");
    }

    const token = signToken(user.userName, user.userPassword, user._id);
    //console.log(`User ${user.userName} sucessfully signed up`);
    return { token, user };
  },
};
