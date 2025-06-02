// client/src/components/recipe-ai/AiHelpers.tsx
import { Button } from "@/components/ui/button"; // Assuming this is your UI library path
import { Loader2, Sparkles } from "lucide-react";

// Reusable Generate Button (Sparkles icon with loading state)
interface GenerateButtonProps {
  field: string;
  loading: Record<string, boolean>;
  generateField: (field: string) => Promise<void>;
}

export default function GenerateButton({ field, loading, generateField }: GenerateButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => generateField(field)}
      disabled={loading[field]}
      type="button" // Prevents form submission
    >
      {loading[field] ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
    </Button>
  );
}