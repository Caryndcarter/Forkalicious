import type React from "react"
import type { filterInfo } from "./SearchPage"

interface ActiveFiltersProps {
  filterValue: filterInfo
  setFilterVisible: (visible: boolean) => void
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filterValue, setFilterVisible }) => {
  const hasActiveFilters =
    filterValue.diet ||
    filterValue.cuisine ||
    filterValue.intolerances.length > 0 ||
    filterValue.includeIngredients.length > 0

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterValue.diet && <FilterPill label={`Diet: ${filterValue.diet}`} onClick={() => setFilterVisible(true)} />}

      {filterValue.cuisine && (
        <FilterPill label={`Cuisine: ${filterValue.cuisine}`} onClick={() => setFilterVisible(true)} />
      )}

      {filterValue.intolerances.map((intolerance) => (
        <FilterPill
          key={`intolerance-${intolerance}`}
          label={`No ${intolerance}`}
          onClick={() => setFilterVisible(true)}
        />
      ))}

      {filterValue.includeIngredients.map((ingredient) => (
        <FilterPill
          key={`ingredient-${ingredient}`}
          label={`With: ${ingredient}`}
          onClick={() => setFilterVisible(true)}
        />
      ))}
    </div>
  )
}

interface FilterPillProps {
  label: string
  onClick: () => void
}

const FilterPill: React.FC<FilterPillProps> = ({ label, onClick }) => {
  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full bg-[#ff9e40] text-white text-sm cursor-pointer hover:bg-[#e7890c] transition-colors"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Edit filter: ${label}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick()
          e.preventDefault()
        }
      }}
    >
      <span>{label}</span>
    </div>
  )
}

