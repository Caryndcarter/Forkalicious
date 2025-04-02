import { User, Recipe, Review } from "../models_mongo/index.js";
import { signToken, AuthenticationError } from "../middleware/auth_graphQL.js";
import { GraphQLError } from "graphql";
import { recipe } from "../types/index.js";
import {
  diet,
  intolerance,
  user_context,
  recipeAuthor,
} from "../types/index.js";
import mongoose from "mongoose";
// import { ObjectId } from "mongodb";

const resolvers = {
  Query: {
    getUser: async (_: any, _args: any, context: any): Promise<any> => {
     if (context.user) {
        return User.findOne({ _id: context.user._id });
      } 
      throw new AuthenticationError("could not authenticate user.");
    },

    getSpecificRecipeId: async (
      _: any,
      { recipeId }: { recipeId: string },
      context: any
    ): Promise<string | null> => {
      if (!recipeId) {
        return null;
      }

      //console.log("Received recipeId:", recipeId);
      //console.log("Context user:", context.user);

      if (!context.user) {
        throw new AuthenticationError("User not authenticated.");
      }

      try {
        // Convert recipeId string to ObjectId
        //const objectId = new mongoose.Types.ObjectId(recipeId);

        // Find the user by their ID
        const user = await User.findOne({ _id: context.user._id });

        if (!user) {
          throw new GraphQLError("User not found.");
        }

        const savedRecipes = user.savedRecipes || [];

        // Check if the provided recipeId exists in savedRecipes
        const foundRecipe = savedRecipes.find(
          (id) => id.toString() === recipeId
        );

        // Return the recipeId if found, otherwise return null
        return foundRecipe ? foundRecipe.toString() : null;
      } catch (err) {
        console.error("Error in get specific recipe resolver:", err);
        throw new GraphQLError("Failed to check if the recipe is saved.");
      }
    },

    getRecipes: async (
      _parent: any,
      _args: any,
      context: user_context
    ): Promise<recipe[] | null> => {
      if (!context.user) {
        throw new AuthenticationError("could not authenticate user.");
      }

      const user = await User.findOne({ _id: context.user._id });

      if (!user) {
        throw new AuthenticationError("could not find user.");
      }

      const savedRecipes = user.savedRecipes;

      if (!savedRecipes) {
        console.log(`no recipes found for ${user.userName}`);
        return null;
      } else if (savedRecipes.length == 0) {
        console.log(`no recipes found for ${user.userName}`);
        return null;
      }
      let recipes: recipe[] = [];

      // Reverse the savedRecipes array to show the newest first on the page
      const reversedRecipes = [...savedRecipes].reverse();

      for (const id of reversedRecipes) {
        const recipe: recipe | null = await Recipe.findById(id);
        if (!recipe) {
          //console.log("skipping...");
          continue;
        }
        recipes.push(recipe);
      }

      return recipes;
    },

    getRecipe: async (
      _parent: any,
      args: {
        mongoID: mongoose.Schema.Types.ObjectId;
        spoonacularId: number;
      },
      context: user_context
    ): Promise<recipeAuthor | null> => {
      if (!context.user) {
        throw new AuthenticationError("could not authenticate user.");
      }

      const user = await User.findOne({ _id: context.user._id });

      if (!user) {
        throw new AuthenticationError("could not find user.");
      }

      const { mongoID, spoonacularId } = args;

      //console.log(mongoID, spoonacularId);

      let recipe: recipe | null = null;

      if (mongoID) {
        recipe = await Recipe.findById(mongoID);
      } else if (spoonacularId) {
        recipe = await Recipe.findOne({ spoonacularId: spoonacularId });
      }

      if (recipe) {
        let author = false;
        const id = context.user._id;
        const authorID = recipe.author;
        if (id && authorID) {
          author = id == authorID.toString();
        }
        return { recipe: recipe, author: author };
      } else {
        return null;
      }
    },

    getReviews: async (_: any, { recipeId }: { recipeId: string }): Promise<any> => {
      try {

        const objectId = new mongoose.Types.ObjectId(recipeId);
        // Find the recipe and populate its reviews with user details
        const recipeReviews = await Recipe.findById(objectId)
        .populate({
          path: 'reviews',
          model: 'Review',  
          select: 'rating comment userName' 
        });
          
        if (!recipeReviews) {
          throw new GraphQLError("Recipe not found");
        }
    
        return recipeReviews.reviews;
      } catch (err) {
        console.error("Error fetching reviews:", err);
        throw new GraphQLError("Failed to fetch reviews");
      }
    },

    getReviewsByRecipeId: async (_: any, { reviewIds }: {reviewIds: string []}): Promise<any> => {
      try {
        // Find reviews by the array of review IDs
        const reviews = await Review.find({ '_id': { $in: reviewIds } });

        // Return the found reviews
        return reviews;
      } catch (error) {
        console.error("Error fetching reviews:", error);
        throw new Error("Failed to fetch reviews");
      }
    },

    getReviewsForRecipe: async (_: any, { recipeId }: { recipeId: string }): Promise<any> => {
      try {
        const objectId = new mongoose.Types.ObjectId(recipeId);
        const recipe = await Recipe.findById(objectId).populate({
          path: 'reviews',
          model: 'Review',
          select: '_id rating comment userName'
        });

        if (!recipe) {
          throw new GraphQLError("Recipe not found");
        }

        return recipe.reviews;
      } catch (err) {
        console.error("Error fetching reviews for recipe:", err);
        throw new GraphQLError("Failed to fetch reviews for recipe");
      }
    },
  },

  Mutation: {
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

    // update the preferences of a user
    updatePreferences: async (
      _: any,
      args: {
        diet?: diet;
        intolerances?: intolerance[];
      },
      context: user_context
    ): Promise<any> => {
      if (!context.user) {
        throw new AuthenticationError("could not authenticate user.");
      }

      const user = await User.findOne({ _id: context.user._id });

      if (!user) {
        throw new AuthenticationError("could not find user.");
      }

      const { diet, intolerances } = args;

      if (diet) {
        user.diet = diet;
      }

      if (intolerances) {
        user.intolerances = intolerances;
      }

      await user.save();
      //console.log(`${user.userName}'s new preferences are saved`);
      return {
        id: user._id,
        diet: user.diet || null,
        intolerances: user.intolerances || [],
      };
    },

    // Save a recipe to the overall recipe collection
    addRecipe: async (
      _parent: any,
      {
        recipeInput,
      }: {
        recipeInput: {
          title: string;
          summary: string;
          readyInMinutes: number;
          servings: number;
          ingredients: string[];
          instructions: string;
          steps: string[];
          diet?: string[];
          image?: string;
          sourceUrl?: string;
          spoonacularId?: number;
          spoonacularSourceUrl?: string;
        };
      }
    ) => {
      try {
        const { spoonacularId } = recipeInput;

        // check for duplicates by the spoonacular ID
        let duplicate: recipe | null = null;

        if (spoonacularId) {
          duplicate = await Recipe.findOne({
            spoonacularId: spoonacularId,
          }).exec();
        }

        if (duplicate) {
          //console.log("duplicate found.");
          return duplicate;
        }

        // Create and save the new recipe
        const newRecipe = await Recipe.create(recipeInput);

        if (!newRecipe) {
          throw new GraphQLError("Error saving recipe to collection.");
        }

        return newRecipe;
      } catch (err) {
        console.error("Error saving recipe to collection:", err);
        throw new GraphQLError("Error saving recipe to collection.");
      }
    },

    // Save a user-generated recipe to the overall recipe collection
    createRecipe: async (
      _parent: any,
      {
        recipeInput,
      }: {
        recipeInput: {
          title: string;
          author: string;
          summary: string;
          readyInMinutes: number;
          servings: number;
          ingredients: string[];
          instructions: string;
          steps: string[];
          diet?: string[];
          image?: string;
        };
      },
      context: user_context
    ) => {
      //const userID = context.user._id;
      //const authorID = recipeInput.author;

      //console.log("User's id: " + userID + " type of: " + typeof userID);
      //console.log("Author's id: " + authorID + " type of: " + typeof authorID);

      try {
        if (context.user._id == recipeInput.author) {
          //console.log("editing my own recipe");
          const updatedRecipe = await Recipe.findOneAndUpdate(
            { author: context.user._id },
            recipeInput,
            {
              new: true,
              runValidators: true,
            }
          );

          if (!updatedRecipe) {
            throw new GraphQLError("Error saving recipe to collection.");
          }

          return updatedRecipe;
        } else {
          // recipeInput.author = context.user._id as ObjectId;
          // Create and save the new recipe
          const newRecipe = await Recipe.create(recipeInput);

          if (!newRecipe) {
            throw new GraphQLError("Error saving recipe to collection.");
          }

          return newRecipe;
        }
      } catch (err) {
        console.error("Error saving recipe to collection:", err);
        throw new GraphQLError("Error saving recipe to collection.");
      }
    },

    // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
    saveRecipe: async (
      _parent: any,
      { recipeId }: { recipeId: string },
      context: any
    ) => {
      if (!context.user) {
        console.log("No user in context:", context.user);
        throw new GraphQLError("You must be logged in");
      }

      try {
        //console.log("Attempting to update user with recipe:", recipeId);

        // Check if the recipe exists in the Recipe collection
        const existingRecipe = await Recipe.findById(recipeId);

        if (!existingRecipe) {
          throw new GraphQLError("Recipe not found");
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedRecipes: recipeId } },
          { new: true, runValidators: true }
        );

        //console.log("Updated user:", updatedUser);

        if (!updatedUser) {
          console.log("User not found or update failed.");
          throw new GraphQLError(
            "Error saving recipe: User not found or update failed."
          );
        }

        return updatedUser;
      } catch (err) {
        console.log("Error saving recipe:", err);
        throw new GraphQLError("Error saving recipe.");
      }
    },

    // remove a recipe from a user's `savedRecipes`
    removeRecipe: async (
      _parent: any,
      { recipeId }: { recipeId: string },
      context: any
    ) => {
      //console.log("Attempting to remove recipe:", recipeId);

      if (!context.user) {
        throw new GraphQLError("You must be logged in!");
      }

      // Convert recipeId to ObjectId to ensure correct matching
      const objectId = new mongoose.Types.ObjectId(recipeId);
      //console.log("Converted to ObjectId:", objectId);

      try {
        const updatedUser = await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedRecipes: objectId } },
          { new: true, runValidators: true }
        );

        //console.log("Saved recipes after:", updatedUser?.savedRecipes);

        if (!updatedUser) {
          throw new GraphQLError("Couldn't find user with this id!");
        }

        return updatedUser;
      } catch (err) {
        console.log("Error removing recipe:", err);
        throw new GraphQLError("Error removing recipe.");
      }
    },

    // Add a review to the overall collection
    addReview: async (
      _parent: any,
      {
        reviewInput,
      }: { reviewInput: { recipeId: string; rating: number; comment: string } },
      context: user_context
    ): Promise<any> => {
      try {
        const { recipeId, rating, comment } = reviewInput;

        const user = await User.findOne({ _id: context.user._id });
        if (!user) {
          throw new GraphQLError("User not found.");
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
          throw new GraphQLError("Recipe not found.");
        }

        const newReview = new Review({
          userId: context.user._id,
          recipeId,
          rating,
          comment,
          userName: user.userName,
        });

        //console.log(newReview); //
        // // Save the review to the database
        const savedReview = await newReview.save();

        if (!savedReview) {
          throw new GraphQLError("Error saving review to collection.");
        }

        return savedReview;
      } catch (err) {
        console.error("Error saving review to collection:", err);
        throw new GraphQLError("Error saving review to collection.");
      }
    },

    // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
    saveReviewToUser: async (
      _parent: any,
      { reviewId }: { reviewId: string },
      context: any
    ) => {
      if (!context.user) {
        console.log("No user in context:", context.user);
        throw new GraphQLError("You must be logged in");
      }

      try {
        //console.log("Attempting to update user with review:", reviewId);

        // Check if the recipe exists in the Recipe collection
        const existingReview = await Review.findById(reviewId);

        if (!existingReview) {
          throw new GraphQLError("Review not found");
        }

        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { reviews: reviewId } },
          { new: true, runValidators: true }
        );

       // console.log("Updated user:", updatedUser);

        if (!updatedUser) {
          console.log("User not found or update failed.");
          throw new GraphQLError(
            "Error saving review: User not found or update failed."
          );
        }

        return updatedUser;
      } catch (err) {
        console.log("Error saving review ID to user:", err);
        throw new GraphQLError("Error saving review ID to user.");
      }
    },

    // save a recipe to a user's `savedRecipes` field by adding it to the set (to prevent duplicates)
    saveReviewToRecipe: async (
      _parent: any,
      args: {
        recipeId: string;
        reviewId: mongoose.Schema.Types.ObjectId;
      }
    ) => {
      try {
        const { recipeId, reviewId } = args;
        //console.log("Attempting to update recipe with review:", reviewId);

        // Check if the recipe exists in the Recipe collection
        const existingReview = await Review.findById(reviewId);

        if (!existingReview) {
          throw new GraphQLError("Review not found");
        }

        const objectId = new mongoose.Types.ObjectId(recipeId);

        const updatedRecipe = await Recipe.findOneAndUpdate(
          { _id: objectId },
          { $addToSet: { reviews: reviewId } },
          { new: true, runValidators: true }
        );

        //console.log("Updated recipe:", updatedRecipe);

        if (!updatedRecipe) {
          console.log("Recipe not found or update failed.");
          throw new GraphQLError(
            "Error saving review: Recipe not found or update failed."
          );
        }

      return updatedRecipe;
    } catch (err) {
      console.log("Error saving review ID to user:", err);
      throw new GraphQLError("Error saving review ID to recipe.");
    }
    },

  // delete a review from the review collection and off of the arrays on the user and the recipes
    deleteReview: async (
    _parent: any,
    { reviewId }: { reviewId: string },
    context: any
  ) => {
    //console.log("Attempting to delete review:", reviewId);

    if (!context.user) {
      throw new GraphQLError("You must be logged in!");
    }

    try {

    // Convert recipeId to ObjectId to ensure correct matching
    const objectId = new mongoose.Types.ObjectId(reviewId);
    //console.log("Converted to ObjectId:", objectId);

    const deletedReview = await Review.findByIdAndDelete(objectId);
    
    if (!deletedReview) {
      throw new GraphQLError("Review not found.");
    }

   //console.log("Deleted Review:", deletedReview);

    await Recipe.findOneAndUpdate(
      { reviews: objectId },
      { $pull: { reviews: objectId } },
      { new: true }
    );


    //console.log("Removed review from recipe.");

      const updatedUser = await User.findByIdAndUpdate(
        context.user._id,
        { $pull: { reviews: objectId } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new GraphQLError("Couldn't find user with this id!");
      }

      return updatedUser;
    } catch (err) {
      console.log("Error deleting review:", err);
      throw new GraphQLError("Error deleting review.");
    }
    },

    deleteUser: async (_: any, _args: any, context: any): Promise<any> => {
      if (!context.user) {
        throw new AuthenticationError("You must be logged in to delete your account.");
      }

      const deletedUser = await User.findByIdAndDelete(context.user._id);
      if (!deletedUser) {
        throw new Error("User not found or already deleted.");
      }

      return {
        _id: deletedUser._id,
        userEmail: deletedUser.userEmail,
      }
     },

    
  },

}; 

export default resolvers;
