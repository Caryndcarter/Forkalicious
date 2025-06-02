// client/src/components/recipe-ai/AiHelpers.tsx
import { Button } from "@/components/ui/button"; // Assuming this is your UI library path
import { Loader2, Sparkles, Copy } from "lucide-react";

// Reusable Generate Button (Sparkles icon with loading state)
interface GenerateButtonProps {
  field: string;
  loading: Record<string, boolean>;
  generateField: (field: string) => Promise<void>;
}

export function GenerateButton({ field, loading, generateField }: GenerateButtonProps) {
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

// Reusable Suggestion Box (AI suggestion with Copy/Replace buttons)
interface SuggestionBoxProps {
  field: string;
  suggestions: Record<string, string>;
  copySuggestion: (field: string) => void;
  applySuggestion: (field: string) => void;
  className?: string; // Optional for custom styles (e.g., text size)
}

export function SuggestionBox({
  field,
  suggestions,
  copySuggestion,
  applySuggestion,
  className = "",
}: SuggestionBoxProps) {
  if (!suggestions[field]) return null;
  return (
    <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
      <span className={`text-sm ${className}`}>{suggestions[field]}</span>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copySuggestion(field)}
          type="button" // Prevents form submission
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => applySuggestion(field)}
          type="button" // Prevents form submission
        >
          Replace
        </Button>
      </div>
    </div>
  );
}