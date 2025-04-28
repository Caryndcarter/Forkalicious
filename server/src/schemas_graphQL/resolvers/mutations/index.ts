import addRecipe from "./addRecipe.js";
import addReview from "./addReview.js";
import createRecipe from "./createRecipe.js";
import deleteReview from "./deleteReview.js";
import deleteUser from "./deleteUser.js";
import login from "./login.js";
import removeRecipe from "./removeRecipe.js";
import saveRecipe from "./saveRecipe.js";
import saveReviewToRecipe from "./saveReviewToRecipe.js";
import saveReviewToUser from "./saveReviewToUser.js";
import signUp from "./signUp.js";
import updatePreferences from "./updatePreferences.js";

export default {
  ...addRecipe,
  ...addReview,
  ...createRecipe,
  ...deleteReview,
  ...deleteUser,
  ...login,
  ...removeRecipe,
  ...saveRecipe,
  ...saveReviewToRecipe,
  ...saveReviewToUser,
  ...signUp,
  ...updatePreferences,
};
