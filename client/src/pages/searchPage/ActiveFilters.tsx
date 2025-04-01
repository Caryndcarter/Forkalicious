import type { searchParamters } from "@/types"

interface ActiveFiltersProps {
  filterValue: searchParamters
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

  const handlePillClick = () => {
    setFilterVisible(true)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterValue.diet && <FilterPill label={`Diet: ${filterValue.diet}`} onClick={handlePillClick} />}

      {filterValue.cuisine && <FilterPill label={`Cuisine: ${filterValue.cuisine}`} onClick={handlePillClick} />}

      {filterValue.intolerances.map((intolerance) => (
        <FilterPill key={`intolerance-${intolerance}`} label={`No ${intolerance}`} onClick={handlePillClick} />
      ))}

      {filterValue.includeIngredients.map((ingredient) => (
        <FilterPill key={`ingredient-${ingredient}`} label={`With: ${ingredient}`} onClick={handlePillClick} />
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
    <button
      className="inline-flex items-center px-3 py-1 rounded-full bg-[#ff9e40] text-white text-sm hover:bg-[#e7890c] transition-colors cursor-pointer"
      onClick={onClick}
      aria-label={`Edit filter: ${label}`}
    >
      <span>{label}</span>
    </button>
  )
}

