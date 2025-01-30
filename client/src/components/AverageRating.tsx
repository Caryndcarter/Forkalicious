import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_REVIEWS_FOR_RECIPE } from "../utils_graphQL/queries";
import { Star } from "lucide-react";

interface AverageRatingProps {
  recipeId: string | null;
}

const AverageRating = ({ recipeId }: AverageRatingProps) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);

  // Fetch reviews for this recipe
  const { data } = useQuery(GET_REVIEWS_FOR_RECIPE, {
    variables: { recipeId },
  });

  useEffect(() => {
    if (data?.getReviewsForRecipe) {
      const reviews = data.getReviewsForRecipe;
      if (reviews.length > 0) {
        const avg = (
          reviews.reduce(
            (acc: number, review: { rating: number }) => acc + review.rating,
            0
          ) / reviews.length
        ).toFixed(1); // Round to 1 decimal place
        setAverageRating(Number(avg));
      } else {
        setAverageRating(null);
      }
    }
  }, [data]);

  return (
    <div className="flex items-center space-x-2 text-[#a84e24] mb-4">
      {averageRating !== null ? (
        <>
          <p className="text-lg font-semibold">
            Average Rating: {averageRating}
          </p>
          <Star className="w-6 h-6 fill-yellow-400" />
        </>
      ) : (
        <p className="text-lg font-semibold">No reviews yet</p>
      )}
    </div>
  );
};

export default AverageRating;
