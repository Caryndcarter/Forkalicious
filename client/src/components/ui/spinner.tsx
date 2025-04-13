import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
  className?: string
  containerClassName?: string
}

export function Spinner({ size = "md", color = "#a84e24", className, containerClassName }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  }

  return (
    <div className={cn("flex justify-center items-center min-h-[200px]", containerClassName)}>
      <div
        className={cn(`animate-spin rounded-full border-b-2`, sizeClasses[size], className)}
        style={{ borderBottomColor: color }}
      />
    </div>
  )
}

