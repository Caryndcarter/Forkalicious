import { filterInfo } from "./SearchPage";
import {
  DropDownMultiSelect,
  DropDownSelection,
  InputMultiSelect,
} from "@/components/forms";

const dietOptions = [
  "Gluten Free",
  "Ketogenic",
  "Vegetarian",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "Vegan",
  "Pescetarian",
  "Paleo",
  "Primal",
  "Low FODMAP",
  "Whole30",
];

const intoleranceOptions = [
  "Dairy",
  "Egg",
  "Gluten",
  "Grain",
  "Peanut",
  "Seafood",
  "Sesame",
  "Shellfish",
  "Soy",
  "Sulfite",
  "Tree Nut",
  "Wheat",
];

const cuisineOptions = [
  "African",
  "Asian",
  "American",
  "British",
  "Cajun",
  "Caribbean",
  "Chinese",
  "Eastern European",
  "European",
  "French",
  "German",
  "Greek",
  "Indian",
  "Irish",
  "Italian",
  "Japanese",
  "Jewish",
  "Korean",
  "Latin American",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Nordic",
  "Southern",
  "Spanish",
  "Thai",
  "Vietnamese",
];

interface filterFormProps {
  filterValue: filterInfo;
  setFilterValue: any;
  setFilterVisible: any;
}

export default function FilterForm({
  filterValue,
  setFilterValue,
  setFilterVisible,
}: filterFormProps) {
  const submitFilterUpdate = (event: any) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedFilter: any = Object.fromEntries(formData.entries());

    updatedFilter.intolerances = [];
    updatedFilter.includeIngredients = [];

    for (const [key, value] of formData) {
      const stringValue = value as string;

      if (key.includes("intolerance")) {
        stringValue ? updatedFilter.intolerances.push(stringValue) : null;
        delete updatedFilter[key];
      }

      if (key.includes("required ingredient")) {
        stringValue ? updatedFilter.includeIngredients.push(stringValue) : null;
        delete updatedFilter[key];
      }
    }
    console.log(updatedFilter);

    if (JSON.stringify(updatedFilter) !== JSON.stringify(filterValue)) {
      setFilterValue((prevFilters: filterInfo) => ({
        ...prevFilters,
        ...(updatedFilter as filterInfo),
      }));
    }
    setFilterVisible(false);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
        <div className="bg-white p-4 rounded-lg shadow-lg relative">
          <button
            id="close-filter"
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            onClick={() => setFilterVisible(false)}
          >
            ×
          </button>
          <form
            id="filter-form"
            onSubmit={submitFilterUpdate}
            className="space-y-6"
          >
            <section className="Filters-info">
              <p className="text-sm text-gray-500">
                Filters are set from your Account Preferences, but you can
                change them here to experiment.
              </p>
            </section>

            <DropDownSelection
              name="Diet"
              placeholder="Select a diet"
              initialSelection={filterValue.diet}
              options={dietOptions}
            ></DropDownSelection>

            <DropDownMultiSelect
              name="Intolerance"
              placeholder="Select your Intolerances"
              options={intoleranceOptions}
              initialSelection={filterValue.intolerances}
            ></DropDownMultiSelect>

            <DropDownSelection
              name="Cuisine"
              placeholder={
                filterValue.diet ? filterValue.diet : "Select a Cuisine"
              }
              options={cuisineOptions}
            ></DropDownSelection>

            <InputMultiSelect
              name="Required Ingredient"
              placeholder="Enter an ingredient(s) you want to cook with"
              initialSelection={filterValue.includeIngredients}
            ></InputMultiSelect>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                id="submit-search-filters"
                className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
              >
                Update Filters
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
