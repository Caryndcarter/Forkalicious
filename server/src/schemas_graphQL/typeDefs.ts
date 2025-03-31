const typeDefs = `

  type Query {
    getUser: User
    getSpecificRecipeId(recipeId: String): String
    getRecipes: [Recipe]
    getRecipe(mongoID: ID, spoonacularId: Int): Recipe
    getReviews(recipeId: ID!): [Review]
    getReviewsByRecipeId(reviewIds: [ID!]!): [Review!]!
    getReviewsForRecipe(recipeId: ID!): [Review]
  }

  type Mutation {
    login(userEmail: String!, userPassword: String!): Auth
    signUp(userName: String!, userEmail: String!, userPassword: String!): Auth
    updatePreferences(diet: String, intolerances: [String]): User
    addRecipe(recipeInput: recipeInput!): Recipe
    createRecipe(recipeInput: recipeInput!): Recipe
    saveRecipe(recipeId: ID!): User
    removeRecipe(recipeId: ID!): User
    addReview(reviewInput: ReviewInput!): Review
    saveReviewToUser(reviewId: ID!): User
    saveReviewToRecipe(recipeId: ID!, reviewId: ID!): Recipe
    deleteReview(reviewId: ID!): User!
  }

  type Mutation {
    deleteUser: User!
  }

  type User {
    _id: ID!
    userName: String!
    userEmail: String!
    userPassword: String!
    savedRecipes: [ID!]!
    diet: String
    intolerances: [String]
    reviews: [ID!]!
  }

  type Auth {
    token: String!
    user: User
  }

  type RecipeAuthor {
    recipe: Recipe
    author: Boolean
  }

   type Recipe {
    _id: ID
    author: ID
    title: String!
    summary: String!
    readyInMinutes: Int!
    servings: Int!
    ingredients: [String!]!
    instructions: String!
    steps: [String!]!
    diet: [String]
    image: String
    sourceUrl: String
    spoonacularId: Int
    spoonacularSourceUrl: String
    reviews: [ID!]!
  }

   input recipeInput {
    title: String!
    author: ID
    summary: String!
    readyInMinutes: Int!
    servings: Int!
    ingredients: [String!]!
    instructions: String!
    steps: [String!]!
    diet: [String]
    image: String
    sourceUrl: String
    spoonacularId: Int
    spoonacularSourceUrl: String
  }

  type Review {
    _id: ID!
    userId: ID!
    recipeId: ID!
    rating: Int!
    comment: String!
    userName: String!
  }

  input ReviewInput {
    recipeId: ID!
    rating: Int!
    comment: String!
  }

`;

export default typeDefs;
