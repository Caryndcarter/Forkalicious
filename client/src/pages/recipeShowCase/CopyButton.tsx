import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";

interface CopyRecipeButtonProps {
  onClick: () => void;
}

export default function CopyRecipeButton({ onClick }: CopyRecipeButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
    >
      <CopyIcon className="w-5 h-5 mr-2" />
      Make it your Own!
    </Button>
  );
}
