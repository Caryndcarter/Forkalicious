import { useNavigate, Link } from "react-router-dom";
import { useContext, useLayoutEffect } from "react";
import { currentRecipeContext } from "@/App";
import { editingContext } from "@/App";
import { useState, useEffect } from "react";
import CopyRecipeButton from "@/components/CopyButton";
import EditRecipeButton from "@/components/EditButton";
import localData from "@/utils_graphQL/localStorageService";
import ReviewSection from "@/components/Reviews";

//new imports
import { useMutation, useQuery } from "@apollo/client";
import {
  ADD_RECIPE,
  SAVE_RECIPE,
  REMOVE_RECIPE,
} from "@/utils_graphQL/mutations";
import { GET_SPECIFIC_RECIPE_ID } from "@/utils_graphQL/queries";
import Auth from "@/utils_graphQL/auth";
import AverageRating from "@/components/AverageRating";

import Heading from "./Heading";

export default function RecipeShowcase() {
  const { currentRecipeDetails, setCurrentRecipeDetails } =
    useContext(currentRecipeContext);
  const navigate = useNavigate();
  const { setIsEditing } = useContext(editingContext);

  // Local storage fallback
  useEffect(() => {
    const storedRecipeDetails = localData.getCurrentRecipe();
    if (storedRecipeDetails) {
      setCurrentRecipeDetails(storedRecipeDetails);
    }
  }, [setCurrentRecipeDetails]);

  const [loginCheck, setLoginCheck] = useState(false);
  const [skipQuery, setSkipQuery] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [reviewCount, setReviewCount] = useState(0);

  //mutations and queries
  const [addRecipe] = useMutation(ADD_RECIPE);
  const [saveRecipe] = useMutation(SAVE_RECIPE);
  const [removeRecipe] = useMutation(REMOVE_RECIPE);
  const { data, refetch } = useQuery(GET_SPECIFIC_RECIPE_ID, {
    variables: { recipeId: currentRecipeDetails._id },
    skip: skipQuery,
  });

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
    }
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
      await refetch();

      navigate("/recipe-book");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe.");
    }
  };

  const RawHtmlRenderer = ({ htmlString }: { htmlString: string }) => {
    // Replace multiple line breaks with a single space or remove unwanted elements
    const cleanHtml = htmlString.replace(/<\/?[^>]+(>|$)/g, ""); // removes HTML tags if needed
    return <span dangerouslySetInnerHTML={{ __html: cleanHtml }} />;
  };

  return (
    <div className="bg-[#fef3d0] min-h-screen pt-24">
      <div className="max-w-2xl mx-auto p-6 bg-[#fadaae] shadow-lg rounded-lg mt-10 border border-gray-200">
        <Heading {...currentRecipeDetails} />

        <AverageRating
          recipeId={currentRecipeDetails._id}
          triggerRefetch={reviewCount}
        />

        {/* Additional Info */}
        <div className="mb-6 space-y-2">
          <div className="flex flex-wrap gap-2 mt-4">
            {loginCheck ? (
              isAuthor ? (
                <EditRecipeButton onClick={editRecipe} />
              ) : (
                <CopyRecipeButton onClick={editRecipe} />
              )
            ) : null}

            {/* Save Button */}
            {loginCheck && (
              <button
                onClick={() =>
                  isSaved ? deleteCurrentRecipe() : saveCurrentRecipe()
                }
                className={`font-semibold py-2 px-4 rounded transition-colors duration-300 ${
                  isSaved
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[#A84E24] hover:bg-green-600 text-white"
                }`}
              >
                {isSaved ? "Delete Recipe" : "Save Recipe"}
              </button>
            )}

            {!loginCheck && (
              <div className="text-gray-500 italic">
                <Link to="/account" className="hover:underline">
                  Log in
                </Link>{" "}
                to save recipes.
              </div>
            )}
          </div>
        </div>

        {/* Recipe Summary */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">
            Summary
          </h3>
          {/* Render the instructions as HTML */}
          <RawHtmlRenderer htmlString={currentRecipeDetails.summary} />
        </div>

        {/* Ingredients List */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">
            Ingredients
          </h3>
          <ul className="list-disc list-inside space-y-2">
            {currentRecipeDetails.ingredients?.map(
              (ingredient: string, index: number) => (
                <li key={index} className="text-gray-800">
                  {ingredient}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Cooking Instructions */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">
            Instructions
          </h3>
          {/* Render the instructions as HTML */}
          <RawHtmlRenderer htmlString={currentRecipeDetails.instructions} />
        </div>

        {/* Steps List */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-[#a84e24] mb-4">Steps</h3>
          <ol className="list-decimal list-inside space-y-2">
            {currentRecipeDetails.steps
              ?.slice(0, -1)
              .map((step: string, index: number) => (
                <li key={index} className="text-gray-800">
                  <RawHtmlRenderer htmlString={step} />
                </li>
              ))}
          </ol>
        </div>

        {/* Recipe Source Links */}
        <div className="mb-8 flex space-x-4">
          {currentRecipeDetails.sourceUrl && (
            <h4 className="text-lg font-bold text-[#a84e24]">
              <a
                href={currentRecipeDetails.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-medium underline"
              >
                Recipe Source
              </a>
            </h4>
          )}
          {currentRecipeDetails.spoonacularSourceUrl && (
            <h4 className="text-lg font-bold text-[#a84e24]">
              <a
                href={currentRecipeDetails.spoonacularSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-black font-medium underline"
              >
                Spoonacular Recipe
              </a>
            </h4>
          )}
        </div>

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
