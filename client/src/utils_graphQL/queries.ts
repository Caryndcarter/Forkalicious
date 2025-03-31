import { gql } from "@apollo/client";

export const GET_ACCOUNT_PREFERENCES = gql`
  query getAccountPreferences {
    getUser {
      diet
      intolerances
    }
  }
`;

export const GET_SAVED_RECIPES = gql`
  query getSavedRecipes {
    getRecipes {
      _id
      title
      image
      spoonacularId
    }
  }
`;

export const GET_RECIPE = gql`
  query getRecipe($mongoID: ID, $spoonacularId: Int) {
    getRecipe(mongoID: $mongoID, spoonacularId: $spoonacularId) {
      _id
      title
      author
      summary
      readyInMinutes
      servings
      ingredients
      instructions
      steps
      diet
      image
      sourceUrl
      spoonacularId
      spoonacularSourceUrl
    }
  }
`;

export const GET_SPECIFIC_RECIPE_ID = gql`
  query getSpecificRecipeId($recipeId: String) {
    getSpecificRecipeId(recipeId: $recipeId)
  }
`;

export const GET_REVIEWS = gql`
  query GetReviews($recipeId: ID!) {
    getReviews(recipeId: $recipeId) {
      _id
      rating
      comment
      userName
    }
  }
`;

export const GET_REVIEWS_BY_RECIPE_ID = gql`
  query GetReviewsByRecipeId($reviewIds: [ID!]!) {
    getReviewsByRecipeId(reviewIds: $reviewIds) {
      _id
      rating
      comment
      userName
    }
  }
`;

export const GET_REVIEWS_FOR_RECIPE = gql`
  query GetReviewsForRecipe($recipeId: ID!) {
    getReviewsForRecipe(recipeId: $recipeId) {
      _id
      rating
      comment
      userName
    }
  }
`;
