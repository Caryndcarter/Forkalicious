type intolerance =
  | "Dairy"
  | "Egg"
  | "Gluten"
  | "Grain"
  | "Peanut"
  | "Seafood"
  | "Sesame"
  | "Shellfish"
  | "Soy"
  | "Sulfite"
  | "Tree Nut"
  | "Wheat";

const intoleranceOptions: intolerance[] = [
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

export type { intolerance };

export { intoleranceOptions };
