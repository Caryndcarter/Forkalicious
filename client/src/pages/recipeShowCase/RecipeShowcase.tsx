import { useNavigate, Link } from "react-router-dom";
import { useContext, useLayoutEffect, useCallback, useMemo } from "react";

import { editingContext } from "@/App";
import { useState, useEffect } from "react";
import ButtonManager from "./ButtonManager";
import localData from "@/utils_graphQL/localStorageService";
import ReviewSection from "./Reviews";

import Summary from "./Summary";
import { useMutation, useLazyQuery } from "@apollo/client";
import {
  ADD_RECIPE,
  SAVE_RECIPE,
  REMOVE_RECIPE,
} from "@/utils_graphQL/mutations";
import Auth from "@/utils_graphQL/auth";
import AverageRating from "./AverageRating";

import Heading from "./Heading";
import localStorageService from "@/utils_graphQL/localStorageService";
import { RecipeDetails, defaultRecipe } from "@/types";
import { isEqual } from "lodash";

import { GET_RECIPE } from "@/utils_graphQL/queries";
import Placeholder from "./Placeholder";

export default function RecipeShowcase() {
  const [currentRecipeDetails, setCurrentRecipeDetails] =
    useState<RecipeDetails>(localStorageService.getCurrentRecipe());
  const [loadingRecipe, setLoadingRecipe] = useState<boolean>(false);
  const [queryRecipe] = useLazyQuery(GET_RECIPE);

  const recipePreview = useMemo(() => {
    return localStorageService.getRecipePreview();
  }, [location.pathname]);

  const fetchRecipe = useCallback(async () => {
    if (!recipePreview) {
      console.error("could not load needed information from local storage.");
      return;
    }

    const { _id, spoonacularId } = recipePreview;

    const { data } = await queryRecipe({
      variables: {
        mongoID: _id,
        spoonacularId: spoonacularId,
      },
    });

    const recipe: RecipeDetails = data?.getRecipe;

    setCurrentRecipeDetails(recipe);
    setLoadingRecipe(false);
  }, []);

  const navigate = useNavigate();
  const { setIsEditing } = useContext(editingContext);

  useLayoutEffect(() => {
    const isDefault = isEqual(currentRecipeDetails, defaultRecipe);

    if (isDefault) {
      setLoadingRecipe(true);
      fetchRecipe();
    }
  }, []);

  // Local storage fallback
  useEffect(() => {
    const storedRecipeDetails = localData.getCurrentRecipe();
    if (storedRecipeDetails) {
      setCurrentRecipeDetails(storedRecipeDetails);
    }
  }, [setCurrentRecipeDetails]);

  const [loginCheck, setLoginCheck] = useState(false);
  const [_SkipQuery, setSkipQuery] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAuthor] = useState<boolean>(false);
  const [reviewCount, setReviewCount] = useState(0);

  //mutations and queries
  const [addRecipe] = useMutation(ADD_RECIPE);
  const [saveRecipe] = useMutation(SAVE_RECIPE);
  const [removeRecipe] = useMutation(REMOVE_RECIPE);
  // const { data, refetch } = useQuery(GET_SPECIFIC_RECIPE_ID, {
  //   variables: { recipeId: currentRecipeDetails._id },
  //   skip: skipQuery,
  // });

  useLayoutEffect(() => {
    try {
      const isLoggedIn = Auth.loggedIn();
      setLoginCheck(isLoggedIn);
      // if logged in, activate the query to check if the recipe is saved
      if (isLoggedIn) {
        setSkipQuery(false);
      }
    } catch (error) {
      console.log("Auth error:", error);
      setLoginCheck(false);
      setSkipQuery(true);
    }
  }, []);

  // Function to save recipe
  const saveCurrentRecipe = async () => {
    try {
      const { data } = await addRecipe({
        variables: {
          recipeInput: {
            title: currentRecipeDetails.title,
            summary: currentRecipeDetails.summary,
            readyInMinutes: currentRecipeDetails.readyInMinutes,
            servings: currentRecipeDetails.servings,
            ingredients: currentRecipeDetails.ingredients,
            instructions: currentRecipeDetails.instructions,
            steps: currentRecipeDetails.steps,
            diet: currentRecipeDetails.diets,
            image: currentRecipeDetails.image,
            sourceUrl: currentRecipeDetails.sourceUrl,
            spoonacularId: currentRecipeDetails.spoonacularId,
            spoonacularSourceUrl: currentRecipeDetails.spoonacularSourceUrl,
          },
        },
      });

      // Save the recipe ID to the user's savedRecipes array
      if (data?.addRecipe._id) {
        // Update the ID with the one from the backend
        const updatedRecipe = {
          ...currentRecipeDetails,
          _id: data.addRecipe._id,
        };
        setCurrentRecipeDetails(updatedRecipe);
        localData.setCurrentRecipe(updatedRecipe);

        // save this recipe to the user
        await saveRecipe({
          variables: {
            recipeId: data.addRecipe._id,
          },
        });

        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      alert("Failed to save the recipe.");
    }
  };

  const editRecipe = () => {
    setIsEditing(true);
    navigate("/recipe-maker");
  };

  // Function to delete recipe
  const deleteCurrentRecipe = async () => {
    try {
      const { data } = await removeRecipe({
        variables: {
          recipeId: currentRecipeDetails._id,
        },
      });

      if (data) {
        console.log(
          "Recipe successfully deleted with ID: ",
          currentRecipeDetails._id
        );
      }

      // refetch the query:

      navigate("/recipe-book");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe.");
    }
  };

  if (loadingRecipe) {
    return <Placeholder {...recipePreview} />;
  }

  return (
    <div className="bg-[#fef3d0] min-h-screen pt-24">
      <div className="max-w-2xl mx-auto p-6 bg-[#fadaae] shadow-lg rounded-lg mt-10 border border-gray-200">
        <Heading {...currentRecipeDetails} />

        <AverageRating
          recipeId={currentRecipeDetails._id}
          triggerRefetch={reviewCount}
        />

        {/* Edit Buttons */}
        {loginCheck ? (
          <ButtonManager
            isAuthor={isAuthor}
            editRecipe={editRecipe}
            isSaved={isSaved}
            deleteCurrentRecipe={deleteCurrentRecipe}
            saveCurrentRecipe={saveCurrentRecipe}
          />
        ) : (
          <div className="text-gray-500 italic">
            <Link to="/account" className="hover:underline">
              Log in
            </Link>{" "}
            to save recipes.
          </div>
        )}

        <Summary {...currentRecipeDetails} />

        {/* Integrated Review Section */}
        <ReviewSection
          recipeId={currentRecipeDetails._id}
          isLoggedIn={loginCheck}
          isSaved={isSaved}
          onReviewSubmit={() => {}}
          onReviewAdded={() => setReviewCount((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}
