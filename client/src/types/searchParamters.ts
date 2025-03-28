export interface searchParamters {
  diet?: string;
  cuisine?: string;
  intolerances: string[];
  includeIngredients: string[];
}

export const defaultSearchParameters: searchParamters = {
  intolerances: [],
  includeIngredients: [],
};
