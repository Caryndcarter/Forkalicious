const typeDefs = `

  type Query {
    getUser: User
    getSpecificRecipeId(recipeId: String!): String
    getRecipes: [Recipe]
    getRecipe(mongoID: ID, spoonacularId: Int): Recipe
  }

  type Mutation {
    login(userEmail: String!, userPassword: String!): Auth
    signUp(userName: String!, userEmail: String!, userPassword: String!): Auth
    updatePreferences(diet: String, intolerances: [String]): User
    addRecipe(recipeInput: recipeInput!): Recipe
    saveRecipe(recipeId: ID!): User
    removeRecipe(recipeId: ID!): User
    addReview(reviewInput: ReviewInput!): Review
    saveReviewToUser(reviewId: ID!): User
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

   type Recipe {
    _id: ID!
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
  }

  input ReviewInput {
    recipeId: String!
    rating: Int!
    comment: String!
  }

`;

export default typeDefs;
