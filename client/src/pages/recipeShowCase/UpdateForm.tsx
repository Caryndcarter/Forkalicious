import type { RecipeDetails } from "@/types";
// import { DropDownMultiSelect, DropDownSelection } from "@/components/forms";
// import { dietOptions, intoleranceOptions } from "@/types";

interface updateFormProps {
  updateValues: RecipeDetails;
  setUpdateValues: any;
  setUpdateVisible: any;
}

export default function UpdateForm({
  updateValues,
  setUpdateValues,
  setUpdateVisible,
}: updateFormProps) {
  const submitRecipeUpdate = (event: any) => {
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

    if (JSON.stringify(updatedFilter) !== JSON.stringify(updateValues)) {
      setUpdateValues((prevFilters: RecipeDetails) => ({
        ...prevFilters,
        ...(updatedFilter as RecipeDetails),
      }));
    }
    setUpdateVisible(false);
  };

  return (
    <>
      <form
        id="update-recipe-form"
        onSubmit={submitRecipeUpdate}
        className="space-y-6"
      >
        <button
          type="submit"
          id="update-recipe"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
        >
          Update Recipe
        </button>
      </form>
    </>
  );
}
