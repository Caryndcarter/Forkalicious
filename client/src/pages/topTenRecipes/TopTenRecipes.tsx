import { useState, useEffect } from "react";
import RecipeCard from "../../components/RecipeCard"; 
import { Recipe } from "@/types"; 

// Placeholder data for top recipes matching the Recipe interface
const placeholderTopRecipes: Recipe[] = [
    {
      _id: 1001,
      spoonacularId: 1001,
      title: "Classic Spaghetti Carbonara",
      image: "https://source.unsplash.com/random/300x200/?pasta"
    },
    {
      _id: 1002,
      spoonacularId: 1002,
      title: "Avocado Toast with Poached Eggs",
      image: "https://source.unsplash.com/random/300x200/?avocado"
    },
    {
      _id: 1003,
      spoonacularId: 1003,
      title: "Chicken Tikka Masala",
      image: "https://source.unsplash.com/random/300x200/?curry"
    },
    {
      _id: 1004,
      spoonacularId: 1004,
      title: "Greek Salad",
      image: "https://source.unsplash.com/random/300x200/?salad"
    },
    {
      _id: 1005,
      spoonacularId: 1005,
      title: "Beef Wellington",
      image: "https://source.unsplash.com/random/300x200/?beef"
    },
    {
      _id: 1006,
      spoonacularId: 1006,
      title: "Vegetable Stir Fry",
      image: "https://source.unsplash.com/random/300x200/?stirfry"
    },
    {
      _id: 1007,
      spoonacularId: 1007,
      title: "Chocolate Lava Cake",
      image: "https://source.unsplash.com/random/300x200/?cake"
    },
    {
      _id: 1008,
      spoonacularId: 1008,
      title: "Mushroom Risotto",
      image: "https://source.unsplash.com/random/300x200/?risotto"
    },
    {
      _id: 1009,
      spoonacularId: 1009,
      title: "Beef Tacos",
      image: "https://source.unsplash.com/random/300x200/?tacos"
    },
    {
      _id: 1010,
      spoonacularId: 1010,
      title: "Mango Smoothie Bowl",
      image: "https://source.unsplash.com/random/300x200/?smoothie"
    }
  ];
  
  export default function TopTenRecipes() {
    const [topRecipes, setTopRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      // This function would be replaced with your actual API call later
      const fetchTopRecipes = async () => {
        try {
          // Simulate API call with a delay
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // For now, use placeholder data
          setTopRecipes(placeholderTopRecipes);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching top recipes:", err);
          setError("Failed to load top recipes. Please try again later.");
          setLoading(false);
        }
      };
  
      fetchTopRecipes();
    }, []);
  
    if (loading) {
      return (
        <div className="bg-[#fef3d0] min-h-screen pt-24">
          <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-[#a84e24] mb-8 text-center">
              Top 10 Favorite Recipes
            </h1>
            <div className="flex justify-center mt-6">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="bg-[#fef3d0] min-h-screen pt-24">
          <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-[#a84e24] mb-8 text-center">
              Top 10 Favorite Recipes
            </h1>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error! </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-[#fef3d0] min-h-screen pt-24">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-4xl font-bold text-[#a84e24] mb-8 text-center">
            Top 10 Favorite Recipes
          </h1>
          
          <p className="text-lg text-center text-gray-700 mb-10">
            The most saved recipes by our community
          </p>
          
          <ol className="space-y-12">
            {topRecipes.map((recipe, index) => (
              <li key={recipe._id} className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-[#ff9e40] rounded-full flex-shrink-0 shadow-lg">
                  <span className="text-2xl font-bold text-white">{index + 1}</span>
                </div>
                
                <div className="flex-grow w-full md:w-auto">
                  <RecipeCard recipe={recipe} />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }