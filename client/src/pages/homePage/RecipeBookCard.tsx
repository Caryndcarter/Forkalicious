import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Book, BookOpen } from "lucide-react"
import { useNavigate } from "react-router-dom";

export default function RecipeBookCard() {
const navigate = useNavigate();

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="p-6 bg-gradient-to-r from-[#f5d3a4] to-white">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#a84e24]">
            <Book className="h-6 w-6" />
            Recipe Book
          </CardTitle>
          <div className="bg-[#a84e24] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
            <span className="font-semibold text-sm">Personal Collection</span>
          </div>
        </div>
        <CardDescription className="text-[#a84e24]">Your personal collection of recipes</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <h3 className="text-xl font-semibold text-[#a84e24]">Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>View your saved recipes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Enjoy your recipes being in one place</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Access anytime, anywhere</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-end space-y-4">
            <div className="bg-[#fff8e8] p-3 rounded-lg border border-[#f5d3a4]">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-[#ff9e40]" />
                <span className="font-semibold text-[#a84e24]">Recipe Collection</span>
              </div>
              <p className="text-sm text-gray-700">
                Recipes you make yourself or ones you search for and save, all in one place.
              </p>
            </div>
            <Button
              onClick={() => navigate("/recipe-book")}
              className="w-full bg-[#ff9e40] text-white py-2 rounded-lg shadow hover:bg-[#e7890c] transition-colors duration-200"
            >
              Go to Recipe Book
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


