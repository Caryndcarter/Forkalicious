import getUser from "./getUser.js";
import getReviews from "./getReviews.js";
import getReviewsForRecipe from "./getReviewsForRecipe.js";
import getReviewsByRecipeId from "./getReviewsByRecipeId.js";
import getSpecificRecipeId from "./getSpecificRecipeId.js";
import getRecipes from "./getRecipes.js";
import getRecipe from "./getRecipe.js";

export default {
  ...getUser,
  ...getReviews,
  ...getReviewsForRecipe,
  ...getReviewsByRecipeId,
  ...getSpecificRecipeId,
  ...getRecipes,
  ...getRecipe,
};
