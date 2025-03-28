import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

const SearchCard = () => {
  const navigate = useNavigate()

  return (
    <Card className="w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-transform transform hover:scale-105">
      <CardHeader className="p-6 bg-gradient-to-r from-[#f5d3a4] to-white">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#a84e24]">
          <Search className="h-6 w-6" />
          Recipe Search
        </CardTitle>
        <CardDescription className="text-[#a84e24]">
        Find new recipes to try
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        <div className="flex flex-col justify-between">
          <h3 className="text-xl font-semibold text-[#a84e24]">Description</h3>
          <p className="text-gray-700">
          Explore a vast collection of recipes from various cuisines. Search by ingredients, dietary restrictions, or
          meal types.</p>
        </div>
        <div className="flex flex-col justify-between pt-4">
          <Button
            onClick={() => navigate("/search")}
            className="w-full bg-[#ff9e40] text-white py-2 rounded-lg shadow hover:bg-[#e7890c] transition-colors duration-200"
          >
            Go to Search Page
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default SearchCard