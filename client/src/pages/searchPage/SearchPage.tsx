import { useState, useCallback, useRef, useLayoutEffect } from "react";
import type Recipe from "@/types/recipe";
import FilterForm from "./FilterForm";
import apiService from "@/api/apiService";
import Results from "./Results";
import localStorageService from "@/utils_graphQL/localStorageService";
import { ActiveFilters } from "./ActiveFilters";

export interface filterInfo {
  diet?: string;
  cuisine?: string;
  intolerances: string[];
  includeIngredients: string[];
}

export default function AccountPage() {
  const queryReference = useRef<HTMLInputElement | null>(null);
  const [results, setResults] = useState<Recipe[]>([]); // Store the search results
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [filterVisible, setFilterVisible] = useState<boolean>(false); // Track filter form visibility
  const [filterValue, setFilterValue] = useState<filterInfo>({
    intolerances: [],
    includeIngredients: [],
  });

  useLayoutEffect(() => {
    // load the query:
    const query = localStorageService.getQuery();
    if (queryReference.current) {
      queryReference.current.value = query;
    }

    // load diet preferences saved to account:
    const dietNeeds = localStorageService.getAccountDiet();
    setFilterValue((previousFilter) => ({
      ...previousFilter,
      diet: dietNeeds.diet,
      intolerances: dietNeeds.intolerances,
    }));
  }, []);

  // trigger the search on filter update
  useLayoutEffect(() => {
    if (queryReference.current) {
      handleChange({
        target: queryReference.current,
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [filterValue]);

  const handleSearch = async (queryText: string) => {
    setLoading(true);

    if (!queryText) {
      const newRecipes = await apiService.forignRandomSearch();
      setResults(newRecipes);
      setLoading(false);
      return;
    }

    const searchParams: any = {
      query: queryText,
    };

    if (filterValue.cuisine) {
      searchParams.cuisine = filterValue.cuisine;
    }

    if (filterValue.diet) {
      searchParams.diet = filterValue.diet;
    }

    if (filterValue.intolerances.length > 0) {
      searchParams.intolerance = filterValue.intolerances;
    }

    if (filterValue.includeIngredients.length > 0) {
      searchParams.includeIngredients =
        filterValue.includeIngredients.join(",");
    }

    const recipes = await apiService.forignRecipeSearch(searchParams);
    setResults(recipes);
    setLoading(false);
  };

  // uses a debounced search
  const handleChange = async (e: any) => {
    const queryText = e.target.value;
    debouncedHandleSearch(queryText);
  };

  // debouncing logic
  const debounce = (mainFunction: any, delay: number) => {
    let timer: any;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        mainFunction(...args);
      }, delay);
    };
  };

  const debouncedHandleSearch = useCallback(debounce(handleSearch, 360), [
    filterValue,
  ]);

  return (
    <div
      className={`min-h-screen bg-[#fef3d0] ${
        filterVisible ? "filter-blur" : ""
      }`}
    >
      {/* Main Content */}
      <main className="pt-20 px-4">
        {/* Search Bar and Filter Button */}
        <div className="flex items-center mb-4">
          <input
            type="text"
            id="search-input"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-[#ff9e40]"
            placeholder="Search for recipes..."
            onChange={handleChange}
            ref={queryReference}
          />
          <button
            id="filter-toggle-button"
            className="ml-2 bg-[#ff9e40] text-white px-4 py-2 rounded-md hover:bg-[#e7890c] transition-colors"
            onClick={() => setFilterVisible(true)} // Show filter form
          >
            Filter
          </button>
        </div>

        {/* Active Filters Display */}
        <ActiveFilters filterValue={filterValue} setFilterVisible={setFilterVisible} />

        {/* Search Results */}
        <Results results={results} loading={loading} />

        {/* Filter Form Modal */}
        {filterVisible && (
          <FilterForm
            filterValue={filterValue}
            setFilterValue={setFilterValue}
            setFilterVisible={setFilterVisible}
          ></FilterForm>
        )}
      </main>
    </div>
  );
}
