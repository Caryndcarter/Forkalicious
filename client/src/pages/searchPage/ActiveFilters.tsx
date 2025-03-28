import type React from "react";
import { searchParamters } from "@/types";

interface ActiveFiltersProps {
  filterValue: searchParamters;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  filterValue,
}) => {
  const hasActiveFilters =
    filterValue.diet ||
    filterValue.cuisine ||
    filterValue.intolerances.length > 0 ||
    filterValue.includeIngredients.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterValue.diet && <FilterPill label={`Diet: ${filterValue.diet}`} />}

      {filterValue.cuisine && (
        <FilterPill label={`Cuisine: ${filterValue.cuisine}`} />
      )}

      {filterValue.intolerances.map((intolerance) => (
        <FilterPill
          key={`intolerance-${intolerance}`}
          label={`No ${intolerance}`}
        />
      ))}

      {filterValue.includeIngredients.map((ingredient) => (
        <FilterPill
          key={`ingredient-${ingredient}`}
          label={`With: ${ingredient}`}
        />
      ))}
    </div>
  );
};

interface FilterPillProps {
  label: string;
}

const FilterPill: React.FC<FilterPillProps> = ({ label }) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#ff9e40] text-white text-sm">
      <span>{label}</span>
    </div>
  );
};
