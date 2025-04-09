import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Utensils } from "lucide-react"
import { useNavigate } from "react-router-dom";

export default function SearchCard() {
  const navigate = useNavigate();

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="p-6 bg-gradient-to-r from-[#f5d3a4] to-white">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#a84e24]">
            <Search className="h-6 w-6" />
            Recipe Search
          </CardTitle>
          <div className="bg-[#a84e24] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <span className="font-semibold text-sm">Discover</span>
          </div>
        </div>
        <CardDescription className="text-[#a84e24]">Find new recipes to try</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <h3 className="text-xl font-semibold text-[#a84e24]">Search Options</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Search by ingredients</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Filter by dietary needs</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Browse by cuisine type</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-end space-y-4">
            <div className="bg-[#fff8e8] p-3 rounded-lg border border-[#f5d3a4]">
              <div className="flex items-center gap-2 mb-1">
                <Utensils className="h-4 w-4 text-[#ff9e40]" />
                <span className="font-semibold text-[#a84e24]">Explore Cuisines</span>
              </div>
              <p className="text-sm text-gray-700">
                Explore a vast collection of recipes from various cuisines, filtered to your preferences.
              </p>
            </div>
            <Button
              onClick={() => navigate("/search")}
              className="w-full bg-[#ff9e40] text-white py-2 rounded-lg shadow hover:bg-[#e7890c] transition-colors duration-200"
            >
              Go to Search Page
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
