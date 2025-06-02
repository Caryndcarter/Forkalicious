import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";

interface SuggestionBoxProps {
  field: string;
  suggestions: Record<string, string>;
  copySuggestion: (field: string) => void;
  applySuggestion: (field: string) => void;
  className?: string; // Optional for custom styles (e.g., text size)
}

export default function SuggestionBox({
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