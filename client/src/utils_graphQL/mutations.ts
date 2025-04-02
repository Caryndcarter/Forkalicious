import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation loginUser($userEmail: String!, $userPassword: String!) {
    login(userEmail: $userEmail, userPassword: $userPassword) {
      token
      user {
        diet
        intolerances
      }
    }
  }
`;

export const SIGN_UP = gql`
  mutation signUp(
    $userName: String!
    $userEmail: String!
    $userPassword: String!
  ) {
    signUp(
      userName: $userName
      userEmail: $userEmail
      userPassword: $userPassword
    ) {
      token
      user {
        _id
        userName
        userEmail
      }
    }
  }
`;

export const UPDATE_ACCOUNT_PREFERENCES = gql`
  mutation updatePreferences($diet: String, $intolerances: [String]) {
    updatePreferences(diet: $diet, intolerances: $intolerances) {
      diet
    }
  }
`;

export const ADD_RECIPE = gql`
  mutation addRecipe($recipeInput: recipeInput!) {
    addRecipe(recipeInput: $recipeInput) {
      _id
      title
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

export const CREATE_RECIPE = gql`
  mutation createRecipe($recipeInput: recipeInput!) {
    createRecipe(recipeInput: $recipeInput) {
      _id
    }
  }
`;

export const SAVE_RECIPE = gql`
  mutation saveRecipe($recipeId: ID!) {
    saveRecipe(recipeId: $recipeId) {
      _id
      userName
      userEmail
      savedRecipes
    }
  }
`;

export const REMOVE_RECIPE = gql`
  mutation removeRecipe($recipeId: ID!) {
    removeRecipe(recipeId: $recipeId) {
      _id
      userName
      userEmail
      savedRecipes
    }
  }
`;

export const ADD_REVIEW = gql`
  mutation addReview($reviewInput: ReviewInput!) {
    addReview(reviewInput: $reviewInput) {
      _id
      userId
      recipeId
      rating
      comment
    }
  }
`;

export const SAVE_REVIEW_TO_USER = gql`
  mutation saveReviewToUser($reviewId: ID!) {
    saveReviewToUser(reviewId: $reviewId) {
      _id
      userName
      userEmail
      reviews
    }
  }
`;

export const SAVE_REVIEW_TO_RECIPE = gql`
  mutation saveReviewToRecipe($recipeId: ID!, $reviewId: ID!) {
    saveReviewToRecipe(recipeId: $recipeId, reviewId: $reviewId) {
      _id
      title
      reviews
    }
  }
`;

export const DELETE_REVIEW = gql`
  mutation deleteReview($reviewId: ID!) {
    deleteReview(reviewId: $reviewId) {
      _id
      userName
    }
  }
`;

export const DELETE_USER = gql`
  mutation deleteUser {
    deleteUser {
      _id
      userEmail
    }
  }
`;
