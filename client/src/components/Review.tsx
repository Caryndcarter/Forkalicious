import { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import {
  ADD_REVIEW,
  SAVE_REVIEW_TO_USER,
  SAVE_REVIEW_TO_RECIPE,
} from "../utils_graphQL/mutations";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
//import localData from "@/utils_graphQL/localStorageService";
import ReviewDetails from "../types/reviewDetails.ts";
import { currentRecipeContext } from "@/App";
import { useContext } from "react";
import { GET_REVIEWS } from "@/utils_graphQL/queries";
interface ReviewProps {
  recipeId: string | null;
  existingReview: ReviewData | null;
  onReviewSubmit: () => void;
  onReviewAdded?: () => void;
}

interface ReviewData {
  rating: number;
  comment: string;
}

interface GetReviewsData {
  reviews: ReviewDetails[];
}

export function Review({
  existingReview,
  onReviewSubmit,
  onReviewAdded,
}: ReviewProps) {
  //const currentRecipeDetails = localData.getCurrentRecipe();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");

  const { currentRecipeDetails, setCurrentRecipeDetails } =
    useContext(currentRecipeContext);
  const [submitted, setSubmitted] = useState(false);

  const [addReview] = useMutation(ADD_REVIEW, {
    update(cache, { data: { addReview } }) {
      const existingReviews = cache.readQuery<GetReviewsData>({
        query: GET_REVIEWS,
      });
      cache.writeQuery({
        query: GET_REVIEWS,
        data: { reviews: [addReview, ...(existingReviews?.reviews || [])] },
      });
    },
  });
  const [saveReviewToUser] = useMutation(SAVE_REVIEW_TO_USER);
  const [saveReviewToRecipe] = useMutation(SAVE_REVIEW_TO_RECIPE);

  // Function to add the new review to the context
  const addReviewToContext = (newReview: string) => {
    // Update currentRecipeDetails directly with the new review
    //localData.setCurrentRecipe({
    setCurrentRecipeDetails({
      ...currentRecipeDetails,
      reviews: [...(currentRecipeDetails.reviews || []), newReview], // Add new review
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (existingReview) {
        console.log("There is an existing Review");
      } else {
        const recipeId = currentRecipeDetails._id;
        const reviewInput = { recipeId, rating, comment };

        //console.log("new review: ", reviewInput);
        //console.log("recipeId: ", recipeId);
        // Save the review to the review collection
        const { data } = await addReview({
          variables: {
            reviewInput,
          },
        });
        // Save the review ID to the user's reviews array
        if (data?.addReview._id) {
          await saveReviewToUser({
            variables: {
              reviewId: data.addReview._id,
            },
          });
        }

        // Save the review ID to the recipe's reviews array
        if (data?.addReview._id) {
          await saveReviewToRecipe({
            variables: {
              recipeId,
              reviewId: data.addReview._id,
            },
          });

          addReviewToContext(data.addReview._id);
          // Trigger refetch of reviews
          if (onReviewAdded) {
            //console.log("Triggering review refetch");
            onReviewAdded();
          }
        }
      }
      setSubmitted(true);
      onReviewSubmit();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  // Reset form fields once review is submitted
  useEffect(() => {
    if (submitted) {
      setComment("");
      setRating(0);
      setSubmitted(false);
    }
  }, [submitted]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`focus:outline-none ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review here..."
        className="w-full p-2 border rounded"
      />
      <Button type="submit" className="w-full bg-[#a84e24]">
        {existingReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  );
}
