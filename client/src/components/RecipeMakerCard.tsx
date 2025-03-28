import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChefHat, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function RecipeMakerCard() {
  const navigate = useNavigate()

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden">
      <CardHeader className="p-6 bg-gradient-to-r from-[#f5d3a4] to-white">
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2 text-2xl font-bold text-[#a84e24]">
            <ChefHat className="h-6 w-6" />
            Recipe Maker
          </CardTitle>
          <div className="bg-gradient-to-r from-[#a84e24] to-[#ff9e40] text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-md animate-pulse">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">AI Powered</span>
          </div>
        </div>
        <CardDescription className="text-[#a84e24]">Create and customize your own recipes</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-3">
            <h3 className="text-xl font-semibold text-[#a84e24]">Features</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Create custom recipes</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[#a84e24]"></div>
                <span>Save to your recipe book</span>
              </li>
              <li className="flex items-center gap-2 font-medium text-[#a84e24]">
                <Sparkles className="h-4 w-4 text-[#ff9e40]" />
                <span>Generate recipes with AI</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-end space-y-4">
            <div className="bg-[#fff8e8] p-3 rounded-lg border border-[#f5d3a4]">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-[#ff9e40]" />
                <span className="font-semibold text-[#a84e24]">AI Recipe Generator</span>
              </div>
              <p className="text-sm text-gray-700">
                Describe what you want, and our AI will create a complete recipe for you!
              </p>
            </div>
            <Button
              onClick={() => navigate("/recipe-maker")}
              className="w-full bg-[#ff9e40] text-white py-2 rounded-lg shadow hover:bg-[#e7890c] transition-colors duration-200"
            >
              Go to Recipe Maker
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
