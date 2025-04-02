import Recipe from "@/types/recipe";
import RecipeCard from "@/components/RecipeCard";

interface resultsProps {
  results: Recipe[];
  loading: boolean;
}

export default function Results({ results, loading }: resultsProps) {
  return (
    <div
      id="search-results"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {loading ? (
        <p>Loading...</p>
      ) : !results ? (
        <p>Something went wrong...</p>
      ) : results.length === 0 ? (
        <p>No results found...</p>
      ) : (
        results.map((recipe) => <RecipeCard recipe={recipe} />)
      )}
    </div>
  );
}
