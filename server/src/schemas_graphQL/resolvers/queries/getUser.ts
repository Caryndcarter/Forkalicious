import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { User } from "../../../models_mongo/index.js";

export default {
  getUser: async (_: any, _args: any, context: any): Promise<any> => {
    if (context.user) {
      return User.findOne({ _id: context.user._id });
    }
    throw new AuthenticationError("could not authenticate user.");
  },
};
