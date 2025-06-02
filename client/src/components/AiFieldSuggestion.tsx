// client/src/components/AiFieldSuggestion.tsx
import { Sparkles, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AiFieldSuggestionProps {
  fieldName: string;
  suggestion: string | undefined;
  loading: boolean;
  onGenerate: () => void;
  onApply: () => void;
  onCopy: () => void;
}

export default function AiFieldSuggestion({
  fieldName,
  suggestion,
  loading,
  onGenerate,
  onApply,
  onCopy,
}: AiFieldSuggestionProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-bold text-[#a84e24]">{fieldName}</span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
        </Button>
      </div>
      {suggestion && (
        <div className="mb-2 p-2 bg-white/80 rounded border border-[#e7890c]/30 flex justify-between items-center">
          <span className="text-sm">{suggestion}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onCopy}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onApply}
            >
              Replace
            </Button>
          </div>
        </div>
      )}
    </>
  );
}