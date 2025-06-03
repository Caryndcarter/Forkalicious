import { useNavigate, Link } from "react-router-dom";
import { useCallback, useContext, useLayoutEffect } from "react";
import { currentRecipeContext } from "@/App";
import { useState, useEffect } from "react";
import UpdateForm from "./updateRecipeForm/UpdateForm";
import ButtonManager from "./ButtonManager";
import localData from "@/utils_graphQL/localStorageService";
import ReviewSection from "./Reviews";

import Summary from "./Summary";

//new imports
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {
  ADD_RECIPE,
  SAVE_RECIPE,
  REMOVE_RECIPE,
  UPDATE_RECIPE,
} from "@/utils_graphQL/mutations";
import { GET_RECIPE, GET_SPECIFIC_RECIPE_ID } from "@/utils_graphQL/queries";
import Auth from "@/utils_graphQL/auth";
import AverageRating from "./AverageRating";

import Heading from "./Heading";
import { RecipeDetails } from "@/types";
import apiService from "@/api/apiService";

export default function RecipeShowcase() {
  const { currentRecipeDetails, setCurrentRecipeDetails } =
    useContext(currentRecipeContext);
  const navigate = useNavigate();

  const [loginCheck, setLoginCheck] = useState(false);
  const [updateVisible, setUpdateVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [skipQuery, setSkipQuery] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [reviewCount, setReviewCount] = useState(0);

  //mutations and queries
  const [recipeQuery] = useLazyQuery(GET_RECIPE);
  const [addRecipe] = useMutation(ADD_RECIPE);
  const [saveRecipe] = useMutation(SAVE_RECIPE);
  const [removeRecipe] = useMutation(REMOVE_RECIPE);
  const [updateRecipe] = useMutation(UPDATE_RECIPE);
  const { data, refetch } = useQuery(GET_SPECIFIC_RECIPE_ID, {
    variables: { recipeId: currentRecipeDetails._id },
    skip: skipQuery,
  });

  const fetchRecipe = useCallback(async () => {
    let response: RecipeDetails | null = null;

    const { _id, spoonacularId } = localData.getCurrentCard();

    if (Auth.loggedIn()) {
      const { data } = await recipeQuery({
        variables: { mongoID: _id, spoonacularId: spoonacularId },
      });

      response = data?.getRecipe?.recipe;
    }

    if (!response) {
      response = await apiService.forignInformationSearch(spoonacularId);
    }

    localData.setCurrentRecipe(response);
    setCurrentRecipeDetails(response);
    setLoading(false);
  }, []);

  useLayoutEffect(() => {
    setLoading(true);

    const storedRecipe = localData.getCurrentRecipe();
    if (storedRecipe) {
      setCurrentRecipeDetails(storedRecipe);
      setLoading(false);
    } else {
      fetchRecipe();
    }
  }, []);

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

  // This effect determines if the recipe is saved by checking the database.
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (loginCheck && currentRecipeDetails._id) {
        setSkipQuery(false);
        try {
          await refetch();
        } catch (error) {
          console.error("Error checking saved status:", error);
        }
      }
    };

    checkSavedStatus();
  }, [loginCheck, currentRecipeDetails._id, refetch]);

  useEffect(() => {
    if (data?.getSpecificRecipeId) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }

    let id;
    if (loginCheck) {
      id = Auth.getProfile()?._id;
    }

    if (currentRecipeDetails.author == id && loginCheck) {
      setIsAuthor(true);
    } else setIsAuthor(false);
  }, [data, loginCheck, currentRecipeDetails.author]);

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
        await refetch();
      }
    } catch (err) {
      console.error("Error saving recipe:", err);
      alert("Failed to save the recipe.");
    }
  };

  const editRecipe = () => {
    // Clear any existing form progress
    localStorage.removeItem("recipeFormProgress");
    
    // Set the current recipe for editing
    localData.setCurrentRecipe(currentRecipeDetails);
    
    // Set editing flag
    localData.setIsEditing(true);
    
    // Navigate to recipe maker
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
      await refetch();

      navigate("/recipe-book");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe.");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#fef3d0] min-h-screen pt-24">
        <div className="max-w-2xl mx-auto p-6 bg-[#fadaae] shadow-lg rounded-lg mt-10 border border-gray-200">
          <Heading {...localData.getCurrentCard()} />
          <div className="flex justify-center mt-6">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (updateVisible) {
    return (
      <div className="bg-[#fef3d0] min-h-screen pt-24">
        <div className="max-w-2xl mx-auto p-6 bg-[#fadaae] shadow-lg rounded-lg mt-10 border border-gray-200">
          <UpdateForm
            recipe={currentRecipeDetails}
            setRecipe={setCurrentRecipeDetails}
            setUpdateVisible={setUpdateVisible}
            updateRecipe={updateRecipe}
          ></UpdateForm>
        </div>
      </div>
    );
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
            setUpdateVisible={setUpdateVisible}
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
          onReviewSubmit={() => refetch()}
          onReviewAdded={() => setReviewCount((prev) => prev + 1)}
        />
      </div>
    </div>
  );
}
