import { AuthenticationError } from "../../../middleware/auth_graphQL.js";
import { User } from "../../../models_mongo/index.js";

export default {
  deleteUser: async (_: any, _args: any, context: any): Promise<any> => {
    if (!context.user) {
      throw new AuthenticationError(
        "You must be logged in to delete your account."
      );
    }

    const deletedUser = await User.findByIdAndDelete(context.user._id);
    if (!deletedUser) {
      throw new Error("User not found or already deleted.");
    }

    return {
      _id: deletedUser._id,
      userEmail: deletedUser.userEmail,
    };
  },
};
