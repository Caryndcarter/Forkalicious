import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { GET_REVIEWS_FOR_RECIPE } from "@/utils_graphQL/queries";
import { Star } from "lucide-react";

interface AverageRatingProps {
  recipeId: string | null;
  triggerRefetch?: number;
}

const AverageRating = ({
  recipeId,
  triggerRefetch = 0,
}: AverageRatingProps) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);

  // Fetch reviews for this recipe
  const { data, refetch } = useQuery(GET_REVIEWS_FOR_RECIPE, {
    variables: { recipeId },
  });

  // Effect to handle refetching when triggerRefetch changes
  useEffect(() => {
    refetch();
  }, [triggerRefetch, refetch]);

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

  // Function to scroll to reviews section
  const scrollToReviews = () => {
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="flex items-center space-x-2 text-[#a84e24] mb-4 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={scrollToReviews}
      title="Click to see reviews"
    >
      {averageRating ? (
        <>
          <p className="text-lg font-semibold">
            Average Rating: {averageRating}
          </p>
          <Star className="w-6 h-6 fill-yellow-400" />
          <span className="text-sm italic">(Click to see reviews)</span>
        </>
      ) : (
        <>
          <p className="text-lg font-semibold">No ratings yet</p>
          <span className="text-sm italic">(Click to add a review)</span>
        </>
      )}
    </div>
  );
};

export default AverageRating;