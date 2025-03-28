"use client"

import type React from "react"

import { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQuery } from "@apollo/client"
import { ADD_REVIEW, SAVE_REVIEW_TO_USER, SAVE_REVIEW_TO_RECIPE } from "../utils_graphQL/mutations"
import { GET_REVIEWS } from "@/utils_graphQL/queries"
import { currentRecipeContext } from "@/App"

interface ReviewSectionProps {
  recipeId: string | null
  isLoggedIn: boolean
  isSaved: boolean
  onReviewSubmit: () => void
  onReviewAdded: () => void
}

interface Review {
  _id: string
  rating: number
  comment: string
  userName: string
}

export default function ReviewSection({
  recipeId,
  isLoggedIn,
  isSaved,
  onReviewSubmit,
  onReviewAdded,
}: ReviewSectionProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [activeTab, setActiveTab] = useState("write")

  const { currentRecipeDetails, setCurrentRecipeDetails } = useContext(currentRecipeContext)

  // GraphQL mutations
  const [addReview] = useMutation(ADD_REVIEW, {
    update(cache, { data: { addReview } }) {
      const existingReviews = cache.readQuery<{ reviews: Review[] }>({
        query: GET_REVIEWS,
      })
      cache.writeQuery({
        query: GET_REVIEWS,
        data: { reviews: [addReview, ...(existingReviews?.reviews || [])] },
      })
    },
  })
  const [saveReviewToUser] = useMutation(SAVE_REVIEW_TO_USER)
  const [saveReviewToRecipe] = useMutation(SAVE_REVIEW_TO_RECIPE)

  // Query to fetch reviews
  const { data, loading, refetch } = useQuery(GET_REVIEWS, {
    variables: { recipeId },
    skip: !isLoggedIn || !recipeId,
  })

  // Refetch reviews when component mounts or recipeId changes
  useEffect(() => {
    if (isLoggedIn && recipeId) {
      refetch()
    }
  }, [recipeId, isLoggedIn, refetch])

  // Reset form fields once review is submitted
  useEffect(() => {
    if (submitted) {
      setComment("")
      setRating(0)
      setSubmitted(false)
    }
  }, [submitted])

  // Function to add the new review to the context
  const addReviewToContext = (newReview: string) => {
    setCurrentRecipeDetails({
      ...currentRecipeDetails,
      reviews: [...(currentRecipeDetails.reviews || []), newReview],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!recipeId) {
      console.error("Cannot submit review: Recipe ID is null")
      return
    }

    try {
      const reviewInput = { recipeId, rating, comment }

      // Save the review to the review collection
      const { data } = await addReview({
        variables: {
          reviewInput,
        },
      })

      // Save the review ID to the user's reviews array
      if (data?.addReview._id) {
        await saveReviewToUser({
          variables: {
            reviewId: data.addReview._id,
          },
        })
      }

      // Save the review ID to the recipe's reviews array
      if (data?.addReview._id) {
        await saveReviewToRecipe({
          variables: {
            recipeId,
            reviewId: data.addReview._id,
          },
        })

        addReviewToContext(data.addReview._id)
        onReviewAdded()
      }

      setSubmitted(true)
      onReviewSubmit()
      await refetch()

      // Switch to the read tab after successful submission
      setActiveTab("read")
    } catch (error) {
      console.error("Error submitting review:", error)
    }
  }

  const renderStars = (count: number, hovered = 0, interactive = true) => {
    return Array.from({ length: 5 }, (_, i) => {
      const value = i + 1
      const isHovered = hovered >= value
      const isSelected = count >= value

      if (interactive) {
        return (
          <button
            key={i}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHoveredRating(value)}
            onMouseLeave={() => setHoveredRating(0)}
            className={`focus:outline-none ${
              isHovered ? "text-yellow-400" : isSelected ? "text-yellow-400" : "text-gray-300"
            }`}
            aria-label={`Rate ${value} stars`}
          >
            <Star className={`w-6 h-6 ${isHovered || isSelected ? "fill-current" : ""}`} />
          </button>
        )
      } else {
        return <Star key={i} className={`w-4 h-4 ${isSelected ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      }
    })
  }

  // If recipeId is null, show a message
  if (!recipeId) {
    return (
      <Card className="mt-8 border border-[#a84e24]/20 bg-[#fadaae]/50">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#a84e24]">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 italic">Recipe information is loading or not available.</div>
        </CardContent>
      </Card>
    )
  }

  const reviews: Review[] = data?.getReviews || []

  if (!isLoggedIn) {
    return (
      <Card className="mt-8 border border-[#a84e24]/20 bg-[#fadaae]/50">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#a84e24]">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 italic">
            <Link to="/account" className="text-[#a84e24] hover:underline font-medium">
              Log in
            </Link>{" "}
            to read and write reviews.
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isSaved) {
    return (
      <Card className="mt-8 border border-[#a84e24]/20 bg-[#fadaae]/50">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-[#a84e24]">Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-700 italic">Save this recipe to your collection to write a review.</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mt-8 border border-[#a84e24]/20 bg-[#fadaae]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-semibold text-[#a84e24]">Reviews</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#fef3d0]">
            <TabsTrigger value="write" className="data-[state=active]:bg-[#a84e24] data-[state=active]:text-white">
              Write a Review
            </TabsTrigger>
            <TabsTrigger value="read" className="data-[state=active]:bg-[#a84e24] data-[state=active]:text-white">
              Read Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Your Rating</label>
                <div className="flex gap-1">{renderStars(rating, hoveredRating)}</div>
              </div>

              <div className="space-y-2">
                <label htmlFor="review" className="block text-sm font-medium text-gray-700">
                  Your Review
                </label>
                <Textarea
                  id="review"
                  placeholder="Share your experience with this recipe..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="min-h-[120px] bg-white border-[#a84e24]/20"
                  required
                />
              </div>

              <Button type="submit" className="bg-[#a84e24] hover:bg-[#8a3e1c] text-white">
                Submit Review
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="read" className="mt-4">
            {loading ? (
              <div className="text-center py-4">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="p-4 bg-white rounded-md border border-[#a84e24]/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.userName}</h4>
                        <div className="flex mt-1">{renderStars(review.rating, 0, false)}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No reviews yet. Be the first to review this recipe!</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

