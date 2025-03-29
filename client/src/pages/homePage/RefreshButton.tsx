import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RefreshButtonProps {
  getRandomRecipes: () => Promise<void>;
  isLoading: boolean;
}

export default function RefreshButton({
  getRandomRecipes,
  isLoading,
}: RefreshButtonProps) {
  return (
    <Button
      onClick={getRandomRecipes}
      disabled={isLoading}
      variant="outline"
      className="flex items-center gap-2 bg-white hover:bg-gray-100 text-[#a84e24] border-[#a84e24] hover:text-[#a84e24] transition-all"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      {isLoading ? "Generating..." : "Generate New Recipes"}
    </Button>
  );
}
