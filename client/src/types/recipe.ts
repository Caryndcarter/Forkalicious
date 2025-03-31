export interface Recipe {
  _id: number;
  spoonacularId: number;
  title: string;
  image: string;
}

export const defaultPreview: Recipe = {
  _id: 0,
  spoonacularId: 0,
  title: "Placeholder",
  image: "Placeholder",
};
